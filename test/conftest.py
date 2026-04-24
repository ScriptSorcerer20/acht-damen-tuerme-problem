import sys
from pathlib import Path

import pytest
from werkzeug.security import generate_password_hash

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import create_app, db
from app.models.user import User


@pytest.fixture
def app_instance(tmp_path):
    db_path = Path(tmp_path) / "test_app.db"
    app = create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-secret-key",
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
        }
    )

    with app.app_context():
        db.drop_all()
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app_instance):
    return app_instance.test_client()


@pytest.fixture
def user_factory(app_instance):
    def _create_user(username="alice", password="Password123!", **extra_fields):
        with app_instance.app_context():
            user = User(
                username=username,
                password=generate_password_hash(password),
                **extra_fields,
            )
            db.session.add(user)
            db.session.commit()
            return user.id

    return _create_user


@pytest.fixture
def login_as(client):
    def _login(username="alice", password="Password123!"):
        return client.post(
            "/login",
            data={"username": username, "password": password},
            follow_redirects=False,
        )

    return _login
