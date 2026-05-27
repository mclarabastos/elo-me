from fastapi.testclient import TestClient

from app.main import app


def contains_encrypted_payload(value) -> bool:
    if isinstance(value, dict):
        return any(
            key == "encrypted_payload" or contains_encrypted_payload(item)
            for key, item in value.items()
        )

    if isinstance(value, list):
        return any(contains_encrypted_payload(item) for item in value)

    return False


def test_frontend_patient_dashboard() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/patient-dashboard")

    data = response.json()
    assert response.status_code == 200
    assert "patient" in data
    assert "summary" in data
    assert "medicalDataCategories" in data
    assert data["patient"]["id"] == "patient_rose"
    assert contains_encrypted_payload(data) is False


def test_frontend_share_flow() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/share-flow")

    data = response.json()
    assert response.status_code == 200
    assert "shareableScopes" in data
    assert isinstance(data["shareableScopes"], list)
    assert contains_encrypted_payload(data) is False


def test_frontend_audit_timeline() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/audit-timeline")

    data = response.json()
    assert response.status_code == 200
    assert "items" in data
    assert isinstance(data["items"], list)
    assert contains_encrypted_payload(data) is False


def test_frontend_cre_status() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/cre-status")

    data = response.json()
    assert response.status_code == 200
    assert data["mainCreEndpoint"] == "/external/access/validate"
    assert contains_encrypted_payload(data) is False
