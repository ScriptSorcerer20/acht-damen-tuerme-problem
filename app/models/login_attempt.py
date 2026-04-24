"""Database model for temporary login-throttling information."""

from .. import db


class LoginAttempt(db.Model):
    """Track failed login attempts per IP address."""

    __tablename__ = "login_attempts"

    # The unique IP address is the central lookup key because the lockout
    # policy is applied to the origin of failed requests, not to one account.
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True, nullable=False)

    # These values explain how far an address is into the lock flow and when
    # the application may safely allow another login attempt.
    failed_attempts = db.Column(db.Integer, nullable=False, default=0, server_default=db.text("0"))
    locked_until = db.Column(db.DateTime)
    last_failed_at = db.Column(db.DateTime)

    def __repr__(self):
        """Return a compact identifier for debugging and logging.
        """

        return f"<LoginAttempt {self.ip_address}>"
