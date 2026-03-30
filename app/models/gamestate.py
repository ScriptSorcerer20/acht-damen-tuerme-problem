from .. import db
from flask_login import UserMixin

class GameState(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    board = db.Column(db.Text, nullable=False)  # JSON String
    mode = db.Column(db.String(10), nullable=False)  # queens / rooks

    created_at = db.Column(db.DateTime, default=db.func.now())
