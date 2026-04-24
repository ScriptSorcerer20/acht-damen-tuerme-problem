from datetime import timedelta

from app import db
from app.models.gamestate import GameState
from app.models.login_attempt import LoginAttempt
from app.models.user import User
from app.routes.login_routes import utcnow


def test_dashboard_requires_login(client):
    response = client.get("/dashboard")

    assert response.status_code == 302
    assert "/login" in response.headers["Location"]


def test_register_creates_user_and_redirects_to_login(client, app_instance):
    response = client.post(
        "/register",
        data={"username": "newuser", "password": "Password123!"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert "/login" in response.headers["Location"]

    with app_instance.app_context():
        saved_user = User.query.filter_by(username="newuser").first()
        assert saved_user is not None


def test_login_blocks_requests_from_a_locked_ip(client, app_instance, user_factory):
    user_factory(username="lockeduser", password="Password123!")

    with app_instance.app_context():
        db.session.add(
            LoginAttempt(
                ip_address="203.0.113.10",
                failed_attempts=4,
                locked_until=utcnow() + timedelta(minutes=5),
            )
        )
        db.session.commit()

    response = client.post(
        "/login",
        data={"username": "lockeduser", "password": "Password123!"},
        headers={"X-Forwarded-For": "203.0.113.10"},
    )

    assert response.status_code == 200
    assert b"Too many failed login attempts" in response.data


def test_check_endpoint_applies_different_rules_for_queens_and_rooks(client):
    board = [
        [1, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ]

    queens_response = client.post(
        "/check",
        json={"board": board, "row": 1, "col": 1, "mode": "queens"},
    )
    rooks_response = client.post(
        "/check",
        json={"board": board, "row": 1, "col": 1, "mode": "rooks"},
    )

    assert queens_response.status_code == 200
    assert rooks_response.status_code == 200
    assert queens_response.get_json() == {"valid": False}
    assert rooks_response.get_json() == {"valid": True}


def test_authenticated_user_can_save_and_load_a_game_state(client, app_instance, user_factory, login_as):
    user_factory(username="alice", password="Password123!")

    login_response = login_as("alice", "Password123!")
    assert login_response.status_code == 302

    payload = {
        "board": [
            [0, 1, 0, 0],
            [0, 0, 0, 1],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
        ],
        "mode": "queens",
        "boardSize": 4,
        "saveName": "test-save",
        "saveNote": "unit integration save",
        "isFavorite": False,
        "stepCount": 7,
        "elapsedSeconds": 42,
        "isSolved": True,
    }

    save_response = client.post("/save", json=payload)
    assert save_response.status_code == 200

    saved_data = save_response.get_json()["save_point"]
    load_response = client.get(f"/load/{saved_data['id']}")

    assert load_response.status_code == 200
    loaded_data = load_response.get_json()
    assert loaded_data["board"] == payload["board"]
    assert loaded_data["mode"] == payload["mode"]
    assert loaded_data["step_count"] == payload["stepCount"]
    assert loaded_data["elapsed_seconds"] == payload["elapsedSeconds"]
    assert loaded_data["is_solved"] is True

    with app_instance.app_context():
        assert GameState.query.count() == 1


def test_favorite_toggle_changes_filtered_save_point_list(client, user_factory, login_as):
    user_factory(username="favuser", password="Password123!")

    login_response = login_as("favuser", "Password123!")
    assert login_response.status_code == 302

    save_response = client.post(
        "/save",
        json={
            "board": [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            "mode": "rooks",
            "boardSize": 4,
            "saveName": "favorite-candidate",
            "saveNote": "",
            "isFavorite": False,
            "stepCount": 2,
            "elapsedSeconds": 5,
            "isSolved": False,
        },
    )

    save_id = save_response.get_json()["save_point"]["id"]

    filtered_before = client.get("/save_points?favorites_only=true")
    assert filtered_before.status_code == 200
    assert filtered_before.get_json() == []

    toggle_response = client.post(f"/save_points/{save_id}/favorite")
    assert toggle_response.status_code == 200
    assert toggle_response.get_json()["is_favorite"] is True

    filtered_after = client.get("/save_points?favorites_only=true")
    assert filtered_after.status_code == 200
    assert len(filtered_after.get_json()) == 1
    assert filtered_after.get_json()[0]["id"] == save_id
