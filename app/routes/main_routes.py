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

main_bp = Blueprint("main", __name__)


def parse_board_size(raw_size, default=DEFAULT_BOARD_SIZE):
    try:
        board_size = int(raw_size)
    except (TypeError, ValueError):
        board_size = default

    return max(MIN_BOARD_SIZE, min(MAX_BOARD_SIZE, board_size))


def parse_favorite_flag(raw_value):
    return str(raw_value).lower() in {"1", "true", "yes", "on"}


def parse_non_negative_int(raw_value, default=0):
    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        return default

    return max(0, value)


def get_position_label(row, col, board_size):
    return f"{chr(65 + col)}{board_size - row}"


def solve_queens(board_size):
    queen_positions = [-1] * board_size
    queen_solutions = []

    def is_queen_position_safe(row, col):
        for previous_row in range(row):
            previous_col = queen_positions[previous_row]

            if previous_col == col:
                return False

            if abs(previous_col - col) == abs(previous_row - row):
                return False

        return True

    def place_queen(row):
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
    rook_positions = list(range(board_size))
    random.shuffle(rook_positions)
    return rook_positions


def build_queens_trace(board_size):
    queen_positions = [-1] * board_size
    steps = []

    def is_queen_position_safe(row, col):
        for previous_row in range(row):
            previous_col = queen_positions[previous_row]

            if previous_col == col:
                return False

            if abs(previous_col - col) == abs(previous_row - row):
                return False

        return True

    def place_queen(row):
        if row == board_size:
            steps.append({
                "type": "solution",
                "row": None,
                "col": None,
                "board": queen_positions[:],
                "message": f"Loesung gefunden. Alle {board_size} Damen stehen ohne Konflikte."
            })
            return True

        for col in range(board_size):
            if not is_queen_position_safe(row, col):
                continue

            queen_positions[row] = col
            position = get_position_label(row, col, board_size)
            steps.append({
                "type": "place",
                "row": row,
                "col": col,
                "board": queen_positions[:],
                "message": f"Dame auf {position} gesetzt."
            })

            if place_queen(row + 1):
                return True

            queen_positions[row] = -1
            steps.append({
                "type": "remove",
                "row": row,
                "col": col,
                "board": queen_positions[:],
                "message": f"Backtracking: Dame von {position} entfernt."
            })

        return False

    solved = place_queen(0)

    return {
        "mode": "queens",
        "board_size": board_size,
        "initial_board": [-1] * board_size,
        "steps": steps,
        "solved": solved
    }


def build_rooks_trace(board_size):
    rook_positions = solve_rooks(board_size)
    board = [-1] * board_size
    steps = []

    for row, col in enumerate(rook_positions):
        board[row] = col
        position = get_position_label(row, col, board_size)
        steps.append({
            "type": "place",
            "row": row,
            "col": col,
            "board": board[:],
            "message": f"Turm auf {position} gesetzt."
        })

    steps.append({
        "type": "solution",
        "row": None,
        "col": None,
        "board": board[:],
        "message": f"Loesung gefunden. Alle {board_size} Tuerme stehen ohne Konflikte."
    })

    return {
        "mode": "rooks",
        "board_size": board_size,
        "initial_board": [-1] * board_size,
        "steps": steps,
        "solved": True
    }


def serialize_game_state(game_state):
    board = json.loads(game_state.board)

    return {
        "id": game_state.id,
        "board": board,
        "mode": game_state.mode,
        "board_size": game_state.board_size,
        "save_name": game_state.save_name,
        "save_note": game_state.save_note,
        "is_favorite": game_state.is_favorite,
        "pieces_placed": sum(1 for column in board if column != -1),
        "step_count": game_state.step_count,
        "elapsed_seconds": game_state.elapsed_seconds,
        "is_solved": game_state.is_solved,
        "created_at": game_state.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at": game_state.updated_at.strftime("%Y-%m-%d %H:%M:%S")
    }


def build_save_point_query():
    query = GameState.query.filter_by(user_id=current_user.id)

    selected_mode = request.args.get("mode")
    board_size = request.args.get("board_size")
    favorites_only = request.args.get("favorites_only")
    sort_by = request.args.get("sort", "newest")

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
    return render_template("index.html")


@main_bp.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", user=current_user)


@main_bp.route("/check", methods=["POST"])
def check():
    data = request.json
    board = data["board"]
    row = data["row"]
    col = data["col"]
    piece_mode = data.get("mode", "queens")

    for current_row, current_col in enumerate(board):
        if current_col == -1 or current_row == row:
            continue

        same_column = current_col == col
        same_diagonal = abs(current_col - col) == abs(current_row - row)

        if same_column:
            return jsonify({"valid": False})

        if piece_mode == "queens" and same_diagonal:
            return jsonify({"valid": False})

    return jsonify({"valid": True})


@main_bp.route("/solve")
def solve_queens_route():
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(solve_queens(board_size))


@main_bp.route("/solve_trace")
def solve_queens_trace_route():
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(build_queens_trace(board_size))


@main_bp.route("/solve_rooks")
def solve_rooks_route():
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(solve_rooks(board_size))


@main_bp.route("/solve_rooks_trace")
def solve_rooks_trace_route():
    board_size = parse_board_size(request.args.get("size"))
    return jsonify(build_rooks_trace(board_size))


@main_bp.route("/save", methods=["POST"])
@login_required
def save_game():
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
    save_points = build_save_point_query().all()
    return jsonify([serialize_game_state(game_state) for game_state in save_points])


@main_bp.route("/save_points/<int:game_id>/favorite", methods=["POST"])
@login_required
def toggle_save_point_favorite(game_id):
    game_state = GameState.query.filter_by(id=game_id, user_id=current_user.id).first()

    if not game_state:
        return jsonify({"error": "Save point not found"}), 404

    game_state.is_favorite = not game_state.is_favorite
    db.session.commit()

    return jsonify(serialize_game_state(game_state))


@main_bp.route("/save_points/<int:game_id>", methods=["DELETE"])
@login_required
def delete_save_point(game_id):
    game_state = GameState.query.filter_by(id=game_id, user_id=current_user.id).first()

    if not game_state:
        return jsonify({"error": "Save point not found"}), 404

    db.session.delete(game_state)
    db.session.commit()

    return jsonify({"status": "deleted"})


@main_bp.route("/load")
@login_required
def load_game():
    latest_game = (
        GameState.query.filter_by(user_id=current_user.id)
        .order_by(GameState.created_at.desc(), GameState.id.desc())
        .first()
    )

    if not latest_game:
        return jsonify({"board": [-1] * DEFAULT_BOARD_SIZE, "mode": "queens"})

    return jsonify(serialize_game_state(latest_game))


@main_bp.route("/load/<int:game_id>")
@login_required
def load_specific_game(game_id):
    game_state = GameState.query.filter_by(id=game_id, user_id=current_user.id).first()

    if not game_state:
        return jsonify({"error": "Save point not found"}), 404

    return jsonify(serialize_game_state(game_state))
