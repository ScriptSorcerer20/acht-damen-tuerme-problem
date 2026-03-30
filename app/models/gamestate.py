from .. import db

class GameState(db.Model):
    __tablename__ = "game_state"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    board = db.Column(db.Text, nullable=False)
    mode = db.Column(db.String(10), nullable=False)
    board_size = db.Column(db.Integer, nullable=False, default=8)
    save_name = db.Column(db.String(80), nullable=False, default="Unnamed Save")
    save_note = db.Column(db.Text, nullable=False, default="")
    is_favorite = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )
