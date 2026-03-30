from flask import Blueprint, jsonify, render_template, request
from flask_login  import login_required, current_user
import random, json
from ..models.gamestate import GameState
from ..models.user import User
from .. import db

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    return render_template("index.html")

@main_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@main_bp.route("/check", methods=["POST"])
def check():
    data = request.json
    board = data["board"]
    row = data["row"]
    col = data["col"]

    for r in range(len(board)):
        c = board[r]

        if c == -1 or r == row:
            continue

        # gleiche Spalte
        if c == col:
            return jsonify({"valid": False})

        # gleiche Diagonale
        if abs(c - col) == abs(r - row):
            return jsonify({"valid": False})

    return jsonify({"valid": True})


@main_bp.route("/solve")
def solve():
    n = 8
    solutions = []
    board = [-1] * n

    def is_safe(row, col):
        for r in range(row):
            c = board[r]
            if c == col or abs(c - col) == abs(r - row):
                return False
        return True

    def backtrack(row):
        if row == n:
            solutions.append(board[:])
            return

        for col in range(n):
            if is_safe(row, col):
                board[row] = col
                backtrack(row + 1)
                board[row] = -1

    backtrack(0)
    return jsonify(solutions)

@main_bp.route("/solve_rooks")
def solve_rooks_route():
    return jsonify(solve_rooks(8))

def solve_rooks(n=8):
    solution = list(range(n))
    random.shuffle(solution)
    return solution

@main_bp.route("/save", methods=["POST"])
def save_game():
    data = request.json

    board = data["board"]
    mode = data["mode"]

    game = GameState(
        user_id=current_user.id,
        board=json.dumps(board),
        mode=mode
    )

    db.session.add(game)
    db.session.commit()

    return jsonify({"status": "saved"})

@main_bp.route("/load")
def load_game():
    game = GameState.query.filter_by(user_id=current_user.id)\
        .order_by(GameState.id.desc()).first()

    if not game:
        return jsonify({"board": [-1]*8, "mode": "queens"})

    return jsonify({
        "board": json.loads(game.board),
        "mode": game.mode
    })
