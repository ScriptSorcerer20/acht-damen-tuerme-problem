"""Database model for application user accounts."""

from .. import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    """Represent one authenticated account in the application."""

    __tablename__ = "users"

    # These core identity fields are the minimum needed to create and safely
    # authenticate an account.
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    # The metadata and 2FA fields support account history and stronger account
    # protection without changing the basic login flow.
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    last_login = db.Column(db.DateTime)
    two_factor_enabled = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("0"))
    two_factor_secret = db.Column(db.String(64))

    def __repr__(self):
        """Return a readable representation for debugging output.
        """

        return f"<User {self.username}>"
