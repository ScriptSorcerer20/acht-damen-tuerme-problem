"""Authentication routes and security helpers for account access."""

import base64
import binascii
import hashlib
import hmac
import re
import secrets
import struct
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from flask import Blueprint, flash, redirect, render_template, request, session, url_for
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from .. import db
from ..models.login_attempt import LoginAttempt
from ..models.user import User

# The blueprint keeps all account-related routes in one security-focused module.
login_bp = Blueprint("login", __name__)

# Central limits are defined once so registration, login, and settings all
# enforce the same rules and do not drift apart over time.
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
MAX_LOGIN_FAILURES = 4
LOGIN_LOCK_MINUTES = 30
TWO_FACTOR_CODE_DIGITS = 6
TWO_FACTOR_TIME_STEP_SECONDS = 30
TWO_FACTOR_VALID_WINDOW = 1
TWO_FACTOR_ISSUER = "8 Queens Solver"
MAX_TWO_FACTOR_ATTEMPTS = 5
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{3,20}$")
DUMMY_PASSWORD_HASH = generate_password_hash("dummy-password-for-timing-protection")


# -----------------------------------------------------------------------------
# General helper functions

def utcnow():
    """Return the current UTC time for security-related comparisons."""
    return datetime.utcnow()


def get_utc_timestamp(moment=None):
    """Convert a datetime into UTC seconds for time-based calculations."""
    if moment is None:
        return int(datetime.now(timezone.utc).timestamp())

    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)

    return int(moment.timestamp())


def normalize_username(username):
    """Normalize usernames so harmless whitespace does not affect login or signup."""
    return (username or "").strip()


def lookup_user_by_username(username):
    """Find usernames case-insensitively to keep login user-friendly."""
    if not username:
        return None

    return User.query.filter(db.func.lower(User.username) == username.lower()).first()


def minutes_until(target_time):
    """Round remaining lock time up so the feedback stays conservative."""
    seconds = max(1, int((target_time - utcnow()).total_seconds()))
    return max(1, (seconds + 59) // 60)


def render_login_settings(error=None):
    """Render login settings with the current 2FA setup state included."""
    pending_secret = get_pending_two_factor_setup_secret(current_user)
    formatted_secret = format_two_factor_secret(pending_secret) if pending_secret else None
    provisioning_uri = build_totp_uri(current_user, pending_secret) if pending_secret else None

    return render_template(
        "login_settings.html",
        error=error,
        pending_two_factor_secret=formatted_secret,
        pending_two_factor_uri=provisioning_uri,
    )


# -----------------------------------------------------------------------------
# 1. Password enforcement

def validate_username(username):
    """Reject usernames that would not fit the project's account policy."""
    if not USERNAME_PATTERN.fullmatch(username):
        return "Username must be 3-20 characters and only use letters, numbers, dots, dashes, or underscores."
    return None


def validate_password(password):
    """Reject passwords that fall outside the shared account policy."""
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."

    if len(password) > MAX_PASSWORD_LENGTH:
        return f"Password must be at most {MAX_PASSWORD_LENGTH} characters long."

    return None


# -----------------------------------------------------------------------------
# 2. Anti brute force script

def get_request_ip():
    """Identify the request source so repeated failed attempts can be throttled."""
    forwarded_for = request.headers.get("X-Forwarded-For", "")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()[:45] or "unknown"

    return (request.remote_addr or "unknown")[:45]


def get_or_create_login_attempt():
    """Persist failed-attempt state so throttling survives across requests."""
    ip_address = get_request_ip()
    attempt = LoginAttempt.query.filter_by(ip_address=ip_address).first()

    if attempt is None:
        attempt = LoginAttempt(ip_address=ip_address)
        db.session.add(attempt)

    return attempt


def clear_expired_lock(attempt, now):
    """Remove stale lockouts so temporary blocks do not outlive their purpose."""
    if attempt.locked_until and attempt.locked_until <= now:
        attempt.failed_attempts = 0
        attempt.locked_until = None


def get_active_lock():
    """Check whether the current IP is still inside a lockout window."""
    now = utcnow()
    attempt = LoginAttempt.query.filter_by(ip_address=get_request_ip()).first()

    if not attempt:
        return None

    clear_expired_lock(attempt, now)
    db.session.commit()
    return attempt.locked_until


def record_failed_login():
    """Increase the failure counter so repeated guessing becomes expensive."""
    now = utcnow()
    attempt = get_or_create_login_attempt()
    clear_expired_lock(attempt, now)
    attempt.failed_attempts = (attempt.failed_attempts or 0) + 1
    attempt.last_failed_at = now

    if attempt.failed_attempts >= MAX_LOGIN_FAILURES:
        attempt.locked_until = now + timedelta(minutes=LOGIN_LOCK_MINUTES)

    db.session.commit()
    return attempt.locked_until


def clear_login_attempts():
    """Reset the throttle state after a legitimate login succeeds."""
    attempt = LoginAttempt.query.filter_by(ip_address=get_request_ip()).first()

    if attempt:
        db.session.delete(attempt)

    db.session.commit()


# -----------------------------------------------------------------------------
# 3. 2-factor authentication

def normalize_two_factor_secret(secret):
    """Normalize shared secrets so formatting differences do not break validation."""
    return (secret or "").strip().replace(" ", "").upper()


def generate_two_factor_secret():
    """Generate a fresh secret so every account has its own 2FA seed."""
    return base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")


def format_two_factor_secret(secret):
    """Group the secret for humans because setup may happen by manual typing."""
    normalized = normalize_two_factor_secret(secret)
    return " ".join(normalized[index:index + 4] for index in range(0, len(normalized), 4))


def clear_pending_two_factor(user=None):
    """Clear unfinished login verification state from the session."""
    session.pop("pending_2fa_user_id", None)
    session.pop("pending_2fa_attempts", None)


def get_pending_two_factor_setup_secret(user):
    """Return only the setup secret that belongs to the current account."""
    if session.get("pending_2fa_setup_user_id") != user.id:
        return None

    secret = normalize_two_factor_secret(session.get("pending_2fa_setup_secret"))
    return secret or None


def clear_pending_two_factor_setup():
    """Remove unfinished authenticator setup state from the session."""
    session.pop("pending_2fa_setup_user_id", None)
    session.pop("pending_2fa_setup_secret", None)


def build_totp_uri(user, secret):
    """Create the otpauth URI so authenticator apps can import the account."""
    normalized_secret = normalize_two_factor_secret(secret)
    label = quote(f"{TWO_FACTOR_ISSUER}:{user.username}")
    issuer = quote(TWO_FACTOR_ISSUER)
    return (
        f"otpauth://totp/{label}"
        f"?secret={normalized_secret}&issuer={issuer}"
        f"&algorithm=SHA1&digits={TWO_FACTOR_CODE_DIGITS}&period={TWO_FACTOR_TIME_STEP_SECONDS}"
    )


def decode_two_factor_secret(secret):
    """Decode the stored Base32 secret into raw bytes for code generation."""
    normalized_secret = normalize_two_factor_secret(secret)
    padded_secret = normalized_secret + ("=" * (-len(normalized_secret) % 8))
    return base64.b32decode(padded_secret, casefold=True)


def generate_totp_code(secret, for_time=None):
    """Generate a code locally so the app can verify authenticator input itself."""
    timestamp = get_utc_timestamp(for_time)
    counter = timestamp // TWO_FACTOR_TIME_STEP_SECONDS
    key = decode_two_factor_secret(secret)
    message = struct.pack(">Q", counter)
    digest = hmac.new(key, message, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    truncated_hash = struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF
    code = truncated_hash % (10 ** TWO_FACTOR_CODE_DIGITS)
    return f"{code:0{TWO_FACTOR_CODE_DIGITS}d}"


def verify_totp_code(secret, code, at_time=None):
    """Allow a small time drift so valid users are not locked out unnecessarily."""
    normalized_code = (code or "").strip()

    if not normalized_code.isdigit() or len(normalized_code) != TWO_FACTOR_CODE_DIGITS:
        return False

    current_time = at_time or utcnow()

    try:
        for window in range(-TWO_FACTOR_VALID_WINDOW, TWO_FACTOR_VALID_WINDOW + 1):
            window_time = current_time + timedelta(seconds=window * TWO_FACTOR_TIME_STEP_SECONDS)

            if secrets.compare_digest(generate_totp_code(secret, window_time), normalized_code):
                return True
    except (TypeError, ValueError, binascii.Error):
        return False

    return False


def get_pending_two_factor_user():
    """Load the account that is currently waiting for login verification."""
    user_id = session.get("pending_2fa_user_id")

    if not user_id:
        return None

    return db.session.get(User, user_id)


# -----------------------------------------------------------------------------
# Routes

@login_bp.route("/register", methods=["GET", "POST"])
def register():
    """Create a user account after validating the configured account rules."""
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    if request.method == "POST":
        username = normalize_username(request.form.get("username"))
        password = request.form.get("password") or ""

        username_error = validate_username(username)
        password_error = validate_password(password)

        if username_error:
            return render_template("sign_up.html", error=username_error, username=username)

        if password_error:
            return render_template("sign_up.html", error=password_error, username=username)

        if lookup_user_by_username(username):
            return render_template("sign_up.html", error="Username already taken!", username=username)

        # Passwords are stored hashed so a leaked database does not reveal them directly.
        new_user = User(username=username, password=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()

        flash("Account created successfully. You can log in now.", "success")
        return redirect(url_for("login.login"))

    return render_template("sign_up.html")


@login_bp.route("/login", methods=["GET", "POST"])
def login():
    """Authenticate a user and branch into 2FA only when required."""
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    if request.method == "POST":
        username = normalize_username(request.form.get("username"))
        password = request.form.get("password") or ""

        if not username or not password:
            return render_template("login.html", error="Username and password are required.", username=username)

        # Locked IPs are rejected early so the expensive password check is not repeated.
        locked_until = get_active_lock()

        if locked_until and locked_until > utcnow():
            return render_template(
                "login.html",
                error=f"Too many failed login attempts. Please try again in about {minutes_until(locked_until)} minute(s).",
                username=username,
            )

        user = lookup_user_by_username(username)

        # A dummy hash keeps timing similar even when the username does not exist.
        password_hash = user.password if user else DUMMY_PASSWORD_HASH
        password_matches = check_password_hash(password_hash, password)

        if not user or not password_matches:
            locked_until = record_failed_login()
            error_message = "Invalid username or password."

            if locked_until:
                error_message = (
                    f"Too many failed login attempts. Please try again in about {minutes_until(locked_until)} minute(s)."
                )

            return render_template("login.html", error=error_message, username=username)

        clear_login_attempts()

        if user.two_factor_enabled:
            # The actual login is delayed until the second factor proves account ownership.
            if not user.two_factor_secret:
                return render_template(
                    "login.html",
                    error="This account requires two-factor authentication, but no authenticator app is configured.",
                    username=username,
                )

            session["pending_2fa_user_id"] = user.id
            session["pending_2fa_attempts"] = 0
            flash("Enter the current 6-digit code from your authenticator app.", "info")
            return redirect(url_for("login.verify_two_factor"))

        user.last_login = utcnow()
        db.session.commit()
        login_user(user)
        clear_pending_two_factor()
        session["start_dashboard_with_default_mode"] = True
        return redirect(url_for("main.dashboard"))

    return render_template("login.html")


@login_bp.route("/login/verify", methods=["GET", "POST"])
def verify_two_factor():
    """Finish login by validating the authenticator app code."""
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    user = get_pending_two_factor_user()

    if user is None:
        flash("Your verification session expired. Please log in again.", "error")
        return redirect(url_for("login.login"))

    if request.method == "POST":
        code = (request.form.get("code") or "").strip()

        if not code.isdigit() or len(code) != TWO_FACTOR_CODE_DIGITS:
            return render_template(
                "two_factor_verify.html",
                error="Please enter the 6-digit verification code.",
            )

        attempts = int(session.get("pending_2fa_attempts", 0))

        # The second factor gets its own retry limit so guessing stays impractical.
        if attempts >= MAX_TWO_FACTOR_ATTEMPTS:
            clear_pending_two_factor(user)
            db.session.commit()
            flash("Too many invalid 2FA attempts. Please log in again.", "error")
            return redirect(url_for("login.login"))

        if not user.two_factor_secret:
            clear_pending_two_factor()
            flash("Authenticator app 2FA is not configured for this account.", "error")
            return redirect(url_for("login.login"))

        if not verify_totp_code(user.two_factor_secret, code):
            attempts += 1
            session["pending_2fa_attempts"] = attempts

            if attempts >= MAX_TWO_FACTOR_ATTEMPTS:
                clear_pending_two_factor(user)
                db.session.commit()
                flash("Too many invalid 2FA attempts. Please log in again.", "error")
                return redirect(url_for("login.login"))

            remaining_attempts = MAX_TWO_FACTOR_ATTEMPTS - attempts
            return render_template(
                "two_factor_verify.html",
                error=f"Invalid authenticator code. You have {remaining_attempts} attempt(s) left.",
            )

        clear_pending_two_factor(user)
        user.last_login = utcnow()
        db.session.commit()
        login_user(user)
        flash("Two-factor authentication successful.", "success")
        session["start_dashboard_with_default_mode"] = True
        return redirect(url_for("main.dashboard"))

    return render_template("two_factor_verify.html")


@login_bp.route("/login/settings", methods=["GET", "POST"])
@login_required
def login_settings():
    """Handle password changes and authenticator-based 2FA settings."""
    if request.method == "POST":
        action = request.form.get("action")

        if action == "start_two_factor_setup":
            if current_user.two_factor_enabled:
                return render_login_settings(error="Authenticator app 2FA is already enabled.")

            # The secret stays temporary until the user proves the app was configured correctly.
            secret = generate_two_factor_secret()
            session["pending_2fa_setup_user_id"] = current_user.id
            session["pending_2fa_setup_secret"] = secret
            flash("Add the secret to your authenticator app, then confirm it with the current 6-digit code.", "info")
            return redirect(url_for("login.login_settings"))

        if action == "confirm_two_factor_setup":
            pending_secret = get_pending_two_factor_setup_secret(current_user)

            if not pending_secret:
                return render_login_settings(error="Start the authenticator setup first.")

            code = (request.form.get("code") or "").strip()

            if not verify_totp_code(pending_secret, code):
                return render_login_settings(error="Invalid authenticator code. Please try the current code again.")

            current_user.two_factor_secret = pending_secret
            current_user.two_factor_enabled = True
            clear_pending_two_factor_setup()
            db.session.commit()
            flash("Authenticator app 2FA enabled.", "success")
            return redirect(url_for("login.login_settings"))

        if action == "cancel_two_factor_setup":
            clear_pending_two_factor_setup()
            flash("Authenticator app setup cancelled.", "info")
            return redirect(url_for("login.login_settings"))

        if action == "disable_two_factor":
            current_user.two_factor_enabled = False
            current_user.two_factor_secret = None
            clear_pending_two_factor_setup()
            db.session.commit()
            flash("Authenticator app 2FA disabled.", "success")
            return redirect(url_for("login.login_settings"))

        if action == "password":
            current_password = request.form.get("current_password") or ""
            new_password = request.form.get("new_password") or ""
            confirm_password = request.form.get("confirm_password") or ""

            # The old password is checked first so nobody can change credentials from a stolen session alone.
            if not check_password_hash(current_user.password, current_password):
                return render_login_settings(error="Your current password is incorrect.")

            password_error = validate_password(new_password)

            if password_error:
                return render_login_settings(error=password_error)

            if new_password != confirm_password:
                return render_login_settings(error="The new passwords do not match.")

            current_user.password = generate_password_hash(new_password)
            db.session.commit()
            flash("Password updated successfully.", "success")
            return redirect(url_for("login.login_settings"))

        return render_login_settings(error="Unknown settings action.")

    return render_login_settings()


@login_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    """Log the user out and clear unfinished security state."""
    clear_pending_two_factor()
    clear_pending_two_factor_setup()
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("login.login"))
