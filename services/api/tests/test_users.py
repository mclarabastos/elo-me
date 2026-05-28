from fastapi.testclient import TestClient

from app.main import app


def test_get_demo_user() -> None:
    with TestClient(app) as client:
        response = client.get("/users/demo")

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == "patient_rose"
    assert data["role"] == "patient"
    assert data["email"] == "roseane@demo.elome"
