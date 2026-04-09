"""Main application routes for pages, puzzle solving, and save points.

This module contains the public pages, the dashboard, the board validation
logic for queens and rooks, solver endpoints, and the CRUD-style endpoints
used to store and restore saved games for a logged-in user.
"""

import json
import random
from datetime import datetime

from flask import Blueprint, jsonify, render_template, request
from flask_login import current_user, login_required

from .. import db
from ..models.gamestate import GameState

DEFAULT_BOARD_SIZE = 8
MIN_BOARD_SIZE = 4
MAX_BOARD_SIZE = 13

# Blueprint that groups the main site and game-related routes.
main_bp = Blueprint("main", __name__)


def create_empty_board(board_size):
    """Create a square board matrix with no placed pieces."""
    return [[0 for _ in range(board_size)] for _ in range(board_size)]


def build_board_from_positions(piece_positions, board_size):
    """Convert the legacy one-piece-per-row format into a board matrix."""
    board = create_empty_board(board_size)

    for row, col in enumerate(piece_positions):
        if isinstance(col, int) and 0 <= col < board_size:
            board[row][col] = 1

    return board


def normalize_board(candidate_board, board_size):
    """Normalize stored boards so legacy and matrix formats can both be used."""
    if not isinstance(candidate_board, list) or len(candidate_board) != board_size:
        return create_empty_board(board_size)

    if all(isinstance(row, list) and len(row) == board_size for row in candidate_board):
        normalized_board = create_empty_board(board_size)

        for row_index, row in enumerate(candidate_board):
            for col_index, value in enumerate(row):
                normalized_board[row_index][col_index] = 1 if value else 0

        return normalized_board

    return build_board_from_positions(candidate_board, board_size)


def iter_piece_positions(board):
    """Yield every occupied square from the normalized board matrix."""
    for row_index, row in enumerate(board):
        for col_index, value in enumerate(row):
            if value:
                yield row_index, col_index


def count_placed_pieces(board):
    """Count how many pieces are currently placed on the board."""
    return sum(1 for _ in iter_piece_positions(board))


def parse_board_size(raw_size, default=DEFAULT_BOARD_SIZE):
    """Convert a user-supplied board size into a safe integer range."""
    try:
        board_size = int(raw_size)
    except (TypeError, ValueError):
        board_size = default

    return max(MIN_BOARD_SIZE, min(MAX_BOARD_SIZE, board_size))


def parse_favorite_flag(raw_value):
    """Interpret common truthy values from query parameters or JSON payloads."""
    return str(raw_value).lower() in {"1", "true", "yes", "on"}


def parse_non_negative_int(raw_value, default=0):
    """Parse an integer and clamp negative values to zero."""
    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        return default

    return max(0, value)


def get_position_label(row, col, board_size):
    """Return a chess-style board label such as A8 or C5."""
    return f"{chr(65 + col)}{board_size - row}"


def solve_queens(board_size):
    """Return every valid N-Queens solution for the requested board size."""
    queen_positions = [-1] * board_size
    queen_solutions = []

    def is_queen_position_safe(row, col):
        """Check whether the new queen conflicts with any earlier queen."""
        for previous_row in range(row):
            previous_col = queen_positions[previous_row]

            if previous_col == col:
                return False

            if abs(previous_col - col) == abs(previous_row - row):
                return False

        return True

    def place_queen(row):
        """Backtracking search that fills the board row by row."""
        if row == board_size:
            queen_solutions.append(queen_positions[:])
            return

        for col in range(board_size):
            if is_queen_position_safe(row, col):
                queen_positions[row] = col
                place_queen(row + 1)
                queen_positions[row] = -1

    place_queen(0)
    return queen_solutions


def solve_rooks(board_size):
    """Return one valid rook arrangement with exactly one rook per row/column."""
    rook_positions = list(range(board_size))
    random.shuffle(rook_positions)
    return rook_positions


def build_queens_trace(board_size):
    """Build a step-by-step trace that explains the queens backtracking search."""
    queen_positions = [-1] * board_size
    steps = []

    def is_queen_position_safe(row, col):
        """Reuse the same safety rules used by the queens solver."""
        for previous_row in range(row):
            previous_col = queen_positions[previous_row]

            if previous_col == col:
                return False

            if abs(previous_col - col) == abs(previous_row - row):
                return False

        return True

    def place_queen(row):
        """Record every placement and backtracking step until a solution is found."""
        if row == board_size:
            steps.append({
                "type": "solution",
                "row": None,
                "col": None,
                "board": build_board_from_positions(queen_positions, board_size),
                "message": f"Lösung gefunden. Alle {board_size} Damen stehen ohne Konflikte."
            })
            return True

        for col in range(board_size):
            if not is_queen_position_safe(row, col):
                continue

            queen_positions[row] = col
            position = get_position_label(row, col, board_size)
            # Store a snapshot of the current board so the frontend can replay
            # the solving process visually.
            steps.append({
                "type": "place",
                "row": row,
                "col": col,
                "board": build_board_from_positions(queen_positions, board_size),
                "message": f"Dame auf {position} gesetzt."
            })

            if place_queen(row + 1):
                return True

            queen_positions[row] = -1
            steps.append({
                "type": "remove",
                "row": row,
                "col": col,
                "board": build_board_from_positions(queen_positions, board_size),
                "message": f"Backtracking: Dame von {position} entfernt."
            })

        return False

    solved = place_queen(0)

    return {
        "mode": "queens",
        "board_size": board_size,
        "initial_board": create_empty_board(board_size),
        "steps": steps,
        "solved": solved
    }


def build_rooks_trace(board_size):
    """Build a simple placement trace for the rook mode."""
    rook_positions = solve_rooks(board_size)
    board = create_empty_board(board_size)
    steps = []

    for row, col in enumerate(rook_positions):
        board[row][col] = 1
        position = get_position_label(row, col, board_size)
        # As with the queens trace, each step includes a full board snapshot for
        # straightforward frontend rendering.
        steps.append({
            "type": "place",
            "row": row,
            "col": col,
            "board": [board_row[:] for board_row in board],
            "message": f"Turm auf {position} gesetzt."
        })

    steps.append({
        "type": "solution",
        "row": None,
        "col": None,
        "board": [board_row[:] for board_row in board],
        "message": f"Loesung gefunden. Alle {board_size} Tuerme stehen ohne Konflikte."
    })

    return {
        "mode": "rooks",
        "board_size": board_size,
        "initial_board": create_empty_board(board_size),
        "steps": steps,
        "solved": True
    }


def serialize_game_state(game_state):
    """Convert a database model into JSON-friendly data for the frontend."""
    board = normalize_board(json.loads(game_state.board), game_state.board_size)

    return {
        "id": game_state.id,
        "board": board,
        "mode": game_state.mode,
        "board_size": game_state.board_size,
        "save_name": game_state.save_name,
        "save_note": game_state.save_note,
        "is_favorite": game_state.is_favorite,
        "pieces_placed": count_placed_pieces(board),
        "step_count": game_state.step_count,
        "elapsed_seconds": game_state.elapsed_seconds,
        "is_solved": game_state.is_solved,
        "created_at": game_state.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at": game_state.updated_at.strftime("%Y-%m-%d %H:%M:%S")
    }


def build_save_point_query():
    """Create a filtered and sorted query for the current user's save points."""
    query = GameState.query.filter_by(user_id=current_user.id)

    selected_mode = request.args.get("mode")
    board_size = request.args.get("board_size")
    favorites_only = request.args.get("favorites_only")
    sort_by = request.args.get("sort", "newest")

    # Apply optional filters only when the request contains a supported value.
    if selected_mode in {"queens", "rooks"}:
        query = query.filter_by(mode=selected_mode)

    if board_size not in {None, "", "all"}:
        query = query.filter_by(board_size=parse_board_size(board_size))

    if parse_favorite_flag(favorites_only):
        query = query.filter_by(is_favorite=True)

    sort_options = {
        "newest": GameState.created_at.desc(),
        "oldest": GameState.created_at.asc(),
        "updated": GameState.updated_at.desc(),
        "favorites": GameState.is_favorite.desc()
    }

    return query.order_by(sort_options.get(sort_by, GameState.created_at.desc()), GameState.id.desc())


@main_bp.route("/")
def home():
    """Render the public landing page and choose a matching default language."""
    initial_language = request.accept_languages.best_match(["de", "en"]) or "de"
    return render_template("index.html", initial_language=initial_language)


@main_bp.route("/dashboard")
@login_required
def dashboard():
    """Render the logged-in dashboard."""
    return render_template("dashboard.html", user=current_user)


@main_bp.route("/privacy_policy")
def privacy_policy():
    """Render the privacy policy page."""
    return render_template("privacy.html")


@main_bp.route("/imprint")
def imprint():
    """Render the imprint/legal notice page."""
    return render_template("impressum.html")


@main_bp.route("/check", methods=["POST"])
def check():
    """Validate whether a piece can be placed on the requested square."""
    data = request.json
    board = data["board"]
    row = data["row"]
    col = data["col"]
    piece_mode = data.get("mode", "queens")
    normalized_board = normalize_board(board, len(board))

    for current_row, current_col in iter_piece_positions(normalized_board):
        if current_row == row and current_col == col:
            continue

        same_row = current_row == row
        same_column = current_col == col
        same_diagonal = abs(current_col - col) == abs(current_row - row)

        if same_row or same_column:
            return jsonify({"valid": False})

        # Diagonal conflicts only matter for queens, not for rooks.
        if piece_mode == "queens" and same_diagonal:
            return jsonify({"valid": False})

    return jsonify({"valid": True})


@main_bp.route("/solve")
def solve_queens_route():
    """Return all queens solutions for the requested board size."""
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(solve_queens(board_size))


@main_bp.route("/solve_trace")
def solve_queens_trace_route():
    """Return a step-by-step queens solving trace."""
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(build_queens_trace(board_size))


@main_bp.route("/solve_rooks")
def solve_rooks_route():
    """Return one rook solution for the requested board size."""
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(solve_rooks(board_size))


@main_bp.route("/solve_rooks_trace")
def solve_rooks_trace_route():
    """Return a step-by-step rook placement trace."""
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(build_rooks_trace(board_size))


@main_bp.route("/save", methods=["POST"])
@login_required
def save_game():
    """Store the current board state as a new save point for the user."""
    data = request.json

    board = data["board"]
    piece_mode = data["mode"]
    board_size = parse_board_size(data.get("boardSize"), default=len(board))
    save_name = (data.get("saveName") or "").strip() or f"{piece_mode.title()} Save"
    save_note = (data.get("saveNote") or "").strip()
    is_favorite = bool(data.get("isFavorite"))
    step_count = parse_non_negative_int(data.get("stepCount"))
    elapsed_seconds = parse_non_negative_int(data.get("elapsedSeconds"))
    is_solved = bool(data.get("isSolved"))
    timestamp = datetime.utcnow()

    # Save the board as JSON text so it can be restored exactly as the user left it.
    game_state = GameState(
        user_id=current_user.id,
        board=json.dumps(board),
        mode=piece_mode,
        board_size=board_size,
        save_name=save_name,
        save_note=save_note,
        is_favorite=is_favorite,
        step_count=step_count,
        elapsed_seconds=elapsed_seconds,
        is_solved=is_solved,
        created_at=timestamp,
        updated_at=timestamp
    )

    db.session.add(game_state)
    db.session.commit()

    return jsonify({
        "status": "saved",
        "save_point": serialize_game_state(game_state)
    })


@main_bp.route("/save_points")
@login_required
def list_save_points():
    """Return all save points for the current user after filtering and sorting."""
    save_points = build_save_point_query().all()
    return jsonify([serialize_game_state(game_state) for game_state in save_points])


@main_bp.route("/save_points/<int:game_id>/favorite", methods=["POST"])
@login_required
def toggle_save_point_favorite(game_id):
    """Toggle the favorite flag for one saved game."""
    game_state = GameState.query.filter_by(id=game_id, user_id=current_user.id).first()

    if not game_state:
        return jsonify({"error": "Save point not found"}), 404

    game_state.is_favorite = not game_state.is_favorite
    db.session.commit()

    return jsonify(serialize_game_state(game_state))


@main_bp.route("/save_points/<int:game_id>", methods=["DELETE"])
@login_required
def delete_save_point(game_id):
    """Delete one save point owned by the current user."""
    game_state = GameState.query.filter_by(id=game_id, user_id=current_user.id).first()

    if not game_state:
        return jsonify({"error": "Save point not found"}), 404

    db.session.delete(game_state)
    db.session.commit()

    return jsonify({"status": "deleted"})


@main_bp.route("/load")
@login_required
def load_game():
    """Load the newest save point for the current user."""
    latest_game = (
        GameState.query.filter_by(user_id=current_user.id)
        .order_by(GameState.created_at.desc(), GameState.id.desc())
        .first()
    )

    # If the user has never saved a game, return a clean default board.
    if not latest_game:
        return jsonify({"board": create_empty_board(DEFAULT_BOARD_SIZE), "mode": "queens"})

    return jsonify(serialize_game_state(latest_game))


@main_bp.route("/load/<int:game_id>")
@login_required
def load_specific_game(game_id):
    """Load a specific save point owned by the current user."""
    game_state = GameState.query.filter_by(id=game_id, user_id=current_user.id).first()

    if not game_state:
        return jsonify({"error": "Save point not found"}), 404

    return jsonify(serialize_game_state(game_state))
