from fastapi.testclient import TestClient

from app.main import app


FORBIDDEN_TEXT = (
    "\u00c3",
    "\u00c2",
    "\ufffd",
    "Cl\u00c3",
    "m\u00c3",
    "p\u00c3",
    "produ\u00c3",
    "usu\u00c3",
    "private_key",
    "SECRET_KEY",
    "DATABASE_URL",
    "encrypted_payload",
    "RPC privado",
    "mnemonic",
    "seed phrase",
)


def contains_forbidden_text(value) -> bool:
    if isinstance(value, dict):
        return any(
            contains_forbidden_text(key) or contains_forbidden_text(item)
            for key, item in value.items()
        )

    if isinstance(value, list):
        return any(contains_forbidden_text(item) for item in value)

    if isinstance(value, str):
        return any(forbidden in value for forbidden in FORBIDDEN_TEXT)

    return False


def assert_public_payload(data) -> None:
    assert contains_forbidden_text(data) is False


def test_user_journey_routes() -> None:
    with TestClient(app) as client:
        response = client.get("/user-journey/routes")

    data = response.json()
    assert response.status_code == 200
    assert "patient" in data
    assert "doctor" in data
    assert "clinic" in data
    assert "admin" in data
    assert "receber solicitação" in data["patient"]
    assert_public_payload(data)


def test_user_journey_storage_map() -> None:
    with TestClient(app) as client:
        response = client.get("/user-journey/storage-map")

    data = response.json()
    assert response.status_code == 200
    assert "offChainDatabase" in data
    assert "blockchain" in data
    assert "chainlinkCRE" in data
    assert "futureIntegrations" in data
    assert "notificações" in data["offChainDatabase"]["stores"]
    assert_public_payload(data)
