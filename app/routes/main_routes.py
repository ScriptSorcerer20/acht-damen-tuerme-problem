from flask import Blueprint, render_template
from flask_login  import login_required, current_user

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    return render_template("index.html")

@main_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@main_bp.route('/solver')
def solver():
    return render_template('solver.html')
