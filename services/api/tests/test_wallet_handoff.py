from fastapi.testclient import TestClient

from app.main import app


FORBIDDEN_RESPONSE_TEXT = (
    "private_key",
    "encrypted_payload",
    "SECRET_KEY",
    "DATABASE_URL",
    "\u00c3",
    "\u00c2",
    "\ufffd",
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


def assert_public_handoff_payload(data) -> None:
    assert response_contains_forbidden_text(data) is False


def test_wallet_abstraction_config() -> None:
    with TestClient(app) as client:
        response = client.get("/auth/wallet-abstraction/config")

    data = response.json()
    assert response.status_code == 200
    assert "supportedProviders" in data
    assert data["requiresPrivateKey"] is False
    assert data["network"]["contractAddress"]
    assert_public_handoff_payload(data)


def test_integration_auth_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/auth-contract")

    data = response.json()
    assert response.status_code == 200
    assert data["mainEndpoint"]["method"] == "POST"
    assert data["mainEndpoint"]["path"] == "/auth/wallet-session"
    assert "provider" in data["requiredFields"]
    assert "provider_user_id" in data["requiredFields"]
    assert "wallet_address" in data["requiredFields"]
    assert "role" in data["requiredFields"]
    assert_public_handoff_payload(data)


def test_demo_wallet_payloads_cover_roles_and_wallets() -> None:
    with TestClient(app) as client:
        response = client.get("/auth/demo-wallet-payloads")

    data = response.json()
    roles = {item["payload"]["role"] for item in data["items"]}

    assert response.status_code == 200
    assert roles == {"patient", "doctor", "clinic", "admin"}
    assert all(item["payload"]["wallet_address"] for item in data["items"])
    assert_public_handoff_payload(data)


def test_wallet_abstraction_ux_copy() -> None:
    with TestClient(app) as client:
        response = client.get("/auth/wallet-abstraction/ux-copy")

    data = response.json()
    methods = {item["method"] for item in data["loginButtons"]}

    assert response.status_code == 200
    assert data["headline"] == "Entre no Elo.me sem precisar entender blockchain"
    assert {"google", "email", "phone", "passkey"}.issubset(methods)
    assert_public_handoff_payload(data)
