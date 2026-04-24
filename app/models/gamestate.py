"""Database models for persisted puzzle save points."""

from .. import db


class GameState(db.Model):
    """Persist one saved puzzle session for a specific user."""

    __tablename__ = "game_state"

    # These identifiers connect a save point to one concrete database row and
    # to the user who owns it, which is necessary so save points stay private.
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    # The remaining fields describe the board snapshot and the surrounding
    # progress information, because a meaningful restore needs more than just
    # piece coordinates.
    board = db.Column(db.Text, nullable=False)
    mode = db.Column(db.String(10), nullable=False)
    board_size = db.Column(db.Integer, nullable=False, default=8)
    save_name = db.Column(db.String(80), nullable=False, default="Unnamed Save")
    save_note = db.Column(db.Text, nullable=False, default="")
    is_favorite = db.Column(db.Boolean, nullable=False, default=False)
    step_count = db.Column(db.Integer, nullable=False, default=0, server_default=db.text("0"))
    elapsed_seconds = db.Column(db.Integer, nullable=False, default=0, server_default=db.text("0"))
    is_solved = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("0"))

    # Timestamps make it possible to sort, filter, and explain save points in
    # the UI without asking the user to remember when each run was created.
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )
