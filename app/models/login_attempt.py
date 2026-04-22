from .. import db


class LoginAttempt(db.Model):
    __tablename__ = "login_attempts"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True, nullable=False)
    failed_attempts = db.Column(db.Integer, nullable=False, default=0, server_default=db.text("0"))
    locked_until = db.Column(db.DateTime)
    last_failed_at = db.Column(db.DateTime)

    def __repr__(self):
        return f"<LoginAttempt {self.ip_address}>"
