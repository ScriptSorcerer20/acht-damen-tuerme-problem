from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = ""
    app.config["SECRET_KEY"] = "dev-secret-key"

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "login.login"

    from .models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from .routes.login_routes import login_bp
    from .routes.main_routes import main_bp

    app.register_blueprint(login_bp)
    app.register_blueprint(main_bp)

    return app
