"""Application factory and shared Flask extensions.

This file creates the Flask application, configures the database and login
manager, imports the data models so SQLAlchemy knows about them, and registers
the route blueprints used by the project.
"""

import os

from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

# Shared extension instances are created once here and attached to the app
db = SQLAlchemy()
login_manager = LoginManager()


def create_app():
    """Build and configure the Flask application instance."""
    app = Flask(__name__)

    # Build an absolute path to the application directory so the SQLite
    # database file can be referenced reliably from any working directory.
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # Core Flask and SQLAlchemy configuration.
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "app.db")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["REMEMBER_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    # Connect the shared extension objects to this specific app instance.
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "login.login"
    login_manager.login_message_category = "info"

    # Import the models before create_all() so SQLAlchemy has the table
    from .models.user import User
    from .models.gamestate import GameState
    from .models.login_attempt import LoginAttempt

    # Create any database tables that do not exist yet.
    with app.app_context():
        db.create_all()

    @login_manager.user_loader
    def load_user(user_id):
        """Reload the logged-in user from the session-stored user id."""
        return db.session.get(User, int(user_id))

    # Import and register the blueprints that contain the route handlers.
    from .routes.login_routes import login_bp
    from .routes.main_routes import main_bp

    app.register_blueprint(login_bp)
    app.register_blueprint(main_bp)

    return app
