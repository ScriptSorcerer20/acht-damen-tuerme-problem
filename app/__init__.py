from flask import Flask

def create_app():
    app = Flask(__name__)

    # Basic config
    app.config["SECRET_KEY"] = "dev-secret-key"

    # # ---- Register Blueprints (Routes) ----
    # from .routes.auth_routes import auth_bp
    # from .routes.solver_routes import solver_bp
    from .routes.main_routes import main_bp

    # app.register_blueprint(auth_bp)
    # app.register_blueprint(solver_bp)
    app.register_blueprint(main_bp)

    return app
