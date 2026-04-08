from .. import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    last_login = db.Column(db.DateTime)
    two_factor_enabled = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("0"))
    two_factor_secret = db.Column(db.String(64))

    def __repr__(self):
        return f"<User {self.username}>"
