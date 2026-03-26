from flask import Blueprint, jsonify, render_template, request
from flask_login  import login_required, current_user

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