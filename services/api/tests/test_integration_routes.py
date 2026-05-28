from fastapi.testclient import TestClient

from app.main import app


FORBIDDEN_RESPONSE_TEXT = (
    "SECRET_KEY",
    "DATABASE_URL",
    "sqlite:///./elome.db",
    "encrypted_payload",
    "change-me",
)


def response_contains_forbidden_text(value) -> bool:
    if isinstance(value, dict):
        return any(
            response_contains_forbidden_text(key)
            or response_contains_forbidden_text(item)
            for key, item in value.items()
        )

    if isinstance(value, list):
        return any(response_contains_forbidden_text(item) for item in value)

    if isinstance(value, str):
        return any(forbidden in value for forbidden in FORBIDDEN_RESPONSE_TEXT)

    return False


def assert_no_forbidden_text(data) -> None:
    assert response_contains_forbidden_text(data) is False


def test_integration_status() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/status")

    data = response.json()
    assert response.status_code == 200
    assert data["apiStatus"] == "online"
    assert_no_forbidden_text(data)


def test_integration_frontend_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/frontend-contract")

    data = response.json()
    paths = {endpoint["path"] for endpoint in data["endpoints"]}

    assert response.status_code == 200
    assert "/frontend/patient-dashboard" in paths
    assert_no_forbidden_text(data)


def test_integration_cre_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/cre-contract")

    data = response.json()
    assert response.status_code == 200
    assert data["mainValidationEndpoint"]["path"] == "/external/access/validate"
    assert_no_forbidden_text(data)


def test_integration_pitch_script_data() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/pitch-script-data")

    data = response.json()
    assert response.status_code == 200
    assert len(data["pitchFlow"]) >= 6
    assert_no_forbidden_text(data)
