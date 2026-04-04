from flask import Flask
import os
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy import inspect, text

db = SQLAlchemy()
login_manager = LoginManager()


def apply_startup_migrations():
    inspector = inspect(db.engine)

    if "users" in inspector.get_table_names():
        existing_columns = {column["name"] for column in inspector.get_columns("users")}
        user_column_migrations = {
            "two_factor_enabled": "ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT 0",
            "two_factor_secret": "ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(64)",
        }

        for column_name, statement in user_column_migrations.items():
            if column_name not in existing_columns:
                db.session.execute(text(statement))

        db.session.commit()

def create_app():
    app = Flask(__name__)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "app.db")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["REMEMBER_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "login.login"
    login_manager.login_message_category = "info"

    from .models.user import User
    from .models.gamestate import GameState
    from .models.login_attempt import LoginAttempt

    with app.app_context():
        db.create_all()
        apply_startup_migrations()

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from .routes.login_routes import login_bp
    from .routes.main_routes import main_bp

    app.register_blueprint(login_bp)
    app.register_blueprint(main_bp)

    return app
