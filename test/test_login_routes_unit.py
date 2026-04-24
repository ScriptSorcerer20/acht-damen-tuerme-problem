from datetime import datetime, timedelta, timezone

from app.routes.login_routes import (
    format_two_factor_secret,
    generate_totp_code,
    normalize_two_factor_secret,
    validate_password,
    validate_username,
    verify_totp_code,
)


def test_validate_username_accepts_supported_format():
    assert validate_username("valid_user-01") is None


def test_validate_username_rejects_unsupported_characters():
    assert validate_username("bad user!") is not None


def test_validate_password_rejects_too_short_passwords():
    assert validate_password("short") == "Password must be at least 8 characters long."


def test_validate_password_rejects_too_long_passwords():
    assert validate_password("a" * 129) == "Password must be at most 128 characters long."


def test_normalize_and_format_two_factor_secret_prepare_manual_input():
    secret = "jbsw y3dp ehpk 3pxp"

    assert normalize_two_factor_secret(secret) == "JBSWY3DPEHPK3PXP"
    assert format_two_factor_secret(secret) == "JBSW Y3DP EHPK 3PXP"


def test_verify_totp_code_accepts_code_generated_for_same_time():
    secret = "JBSWY3DPEHPK3PXP"
    moment = datetime(2026, 4, 24, 12, 0, 0, tzinfo=timezone.utc)
    code = generate_totp_code(secret, moment)

    assert verify_totp_code(secret, code, moment) is True


def test_verify_totp_code_accepts_code_in_adjacent_time_window():
    secret = "JBSWY3DPEHPK3PXP"
    moment = datetime(2026, 4, 24, 12, 0, 0, tzinfo=timezone.utc)
    code = generate_totp_code(secret, moment)

    assert verify_totp_code(secret, code, moment + timedelta(seconds=30)) is True


def test_verify_totp_code_rejects_malformed_code_input():
    secret = "JBSWY3DPEHPK3PXP"
    moment = datetime(2026, 4, 24, 12, 0, 0, tzinfo=timezone.utc)

    assert verify_totp_code(secret, "12ab56", moment) is False
    assert verify_totp_code(secret, "12345", moment) is False
