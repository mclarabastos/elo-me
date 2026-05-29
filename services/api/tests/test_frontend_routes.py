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


def contains_mojibake(value) -> bool:
    markers = ("Ã", "Â", "�")

    if isinstance(value, dict):
        return any(
            contains_mojibake(key) or contains_mojibake(item)
            for key, item in value.items()
        )

    if isinstance(value, list):
        return any(contains_mojibake(item) for item in value)

    if isinstance(value, str):
        return any(marker in value for marker in markers)

    return False


def assert_frontend_safe_payload(data) -> None:
    assert contains_encrypted_payload(data) is False
    assert contains_mojibake(data) is False


def test_frontend_patient_dashboard() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/patient-dashboard")

    data = response.json()
    assert response.status_code == 200
    assert "patient" in data
    assert "summary" in data
    assert "medicalDataCategories" in data
    assert data["patient"]["id"] == "patient_rose"
    assert_frontend_safe_payload(data)


def test_frontend_share_flow() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/share-flow")

    data = response.json()
    assert response.status_code == 200
    assert "shareableScopes" in data
    assert isinstance(data["shareableScopes"], list)
    assert_frontend_safe_payload(data)


def test_frontend_audit_timeline() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/audit-timeline")

    data = response.json()
    assert response.status_code == 200
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) >= 1
    assert {
        "id",
        "title",
        "description",
        "status",
        "actor",
        "timestamp",
        "type",
    }.issubset(data["items"][0])
    assert_frontend_safe_payload(data)


def test_frontend_audit_timeline_has_demo_fallback_after_reset() -> None:
    with TestClient(app) as client:
        client.post("/demo/reset-local-demo-data")
        response = client.get("/frontend/audit-timeline")

    data = response.json()
    assert response.status_code == 200
    assert len(data["items"]) >= 1
    assert data["items"][0]["type"] == "identity"
    assert_frontend_safe_payload(data)


def test_frontend_cre_status() -> None:
    with TestClient(app) as client:
        response = client.get("/frontend/cre-status")

    data = response.json()
    assert response.status_code == 200
    assert data["mainCreEndpoint"] == "/external/access/validate"
    assert_frontend_safe_payload(data)


def test_demo_overview_has_no_mojibake_or_encrypted_payload() -> None:
    with TestClient(app) as client:
        response = client.get("/demo/overview")

    data = response.json()
    assert response.status_code == 200
    assert data["project"] == "Elo.me"
    assert_frontend_safe_payload(data)


def test_integration_auth_contract_has_no_mojibake_or_encrypted_payload() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/auth-contract")

    data = response.json()
    assert response.status_code == 200
    assert data["mainEndpoint"]["path"] == "/auth/wallet-session"
    assert_frontend_safe_payload(data)
