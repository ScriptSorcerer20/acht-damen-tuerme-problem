from flask import Blueprint, render_template, request, url_for, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user
from ..models.user import User
from .. import db

login_bp = Blueprint("login", __name__)

@login_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        email = request.form.get("email")

        if User.query.filter_by(username=username).first():
            return render_template("sign_up.html", error="Username already taken!")

        hashed_password = generate_password_hash(password)

        new_user = User(
            username=username,
            password=hashed_password,
            email=email
        )

        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for("login.login"))

    return render_template("sign_up.html")


@login_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for("main.dashboard"))

        return render_template("login.html", error="Invalid username or password")

    return render_template("login.html")
