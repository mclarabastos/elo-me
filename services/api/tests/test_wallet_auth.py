from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def unique_suffix() -> str:
    return uuid4().hex[:10]


def wallet_payload(**overrides) -> dict[str, object]:
    suffix = unique_suffix()
    payload: dict[str, object] = {
        "provider": "privy",
        "provider_user_id": f"did:privy:test_user_{suffix}",
        "email": f"roseane-{suffix}@example.com",
        "phone": None,
        "wallet_address": f"0x{uuid4().hex[:40].ljust(40, '0')}",
        "display_name": "Roseane Carreiro",
        "role": "patient",
    }
    payload.update(overrides)
    return payload


def contains_forbidden_payload(value) -> bool:
    forbidden = ("private_key", "encrypted_payload")

    if isinstance(value, dict):
        return any(
            key in forbidden or contains_forbidden_payload(item)
            for key, item in value.items()
        )

    if isinstance(value, list):
        return any(contains_forbidden_payload(item) for item in value)

    if isinstance(value, str):
        return any(item in value for item in forbidden)

    return False


def test_create_wallet_session_with_privy_provider() -> None:
    payload = wallet_payload()

    with TestClient(app) as client:
        response = client.post("/auth/wallet-session", json=payload)

    data = response.json()
    assert response.status_code == 201
    assert data["provider"] == "privy"
    assert data["provider_user_id"] == payload["provider_user_id"]
    assert data["role"] == "patient"
    assert "view_own_medical_data" in data["available_actions"]
    assert data["message"] == "Wallet abstraction session registered successfully."
    assert contains_forbidden_payload(data) is False


def test_create_wallet_session_with_email() -> None:
    payload = wallet_payload(email="roseane@example.com", phone=None)

    with TestClient(app) as client:
        response = client.post("/auth/wallet-session", json=payload)

    data = response.json()
    assert response.status_code == 201
    assert data["email"] == "roseane@example.com"
    assert data["phone"] is None


def test_create_wallet_session_with_phone() -> None:
    payload = wallet_payload(email=None, phone="+5511999999999")

    with TestClient(app) as client:
        response = client.post("/auth/wallet-session", json=payload)

    data = response.json()
    assert response.status_code == 201
    assert data["email"] is None
    assert data["phone"] == "+5511999999999"


def test_get_wallet_session_by_identity_id() -> None:
    payload = wallet_payload()

    with TestClient(app) as client:
        created = client.post("/auth/wallet-session", json=payload).json()
        response = client.get(f"/auth/wallet-session/{created['id']}")

    data = response.json()
    assert response.status_code == 200
    assert data["id"] == created["id"]
    assert data["wallet_address"] == payload["wallet_address"]


def test_get_wallet_session_by_wallet_address() -> None:
    payload = wallet_payload()

    with TestClient(app) as client:
        created = client.post("/auth/wallet-session", json=payload).json()
        response = client.get(f"/auth/wallet-address/{payload['wallet_address']}")

    data = response.json()
    assert response.status_code == 200
    assert data["id"] == created["id"]
    assert data["wallet_address"] == payload["wallet_address"]


def test_update_wallet_session_role() -> None:
    payload = wallet_payload()

    with TestClient(app) as client:
        created = client.post("/auth/wallet-session", json=payload).json()
        response = client.patch(
            f"/auth/wallet-session/{created['id']}/role",
            json={"role": "doctor"},
        )

    data = response.json()
    assert response.status_code == 200
    assert data["role"] == "doctor"
    assert "request_patient_access" in data["available_actions"]


def test_update_wallet_session_role_rejects_invalid_role() -> None:
    payload = wallet_payload()

    with TestClient(app) as client:
        created = client.post("/auth/wallet-session", json=payload).json()
        response = client.patch(
            f"/auth/wallet-session/{created['id']}/role",
            json={"role": "owner"},
        )

    assert response.status_code == 422


def test_create_wallet_session_rejects_invalid_role() -> None:
    payload = wallet_payload(role="superuser")

    with TestClient(app) as client:
        response = client.post("/auth/wallet-session", json=payload)

    assert response.status_code == 422


def test_create_wallet_session_rejects_empty_wallet_address() -> None:
    payload = wallet_payload(wallet_address=" ")

    with TestClient(app) as client:
        response = client.post("/auth/wallet-session", json=payload)

    assert response.status_code == 422


def test_wallet_session_does_not_duplicate_existing_provider_user_id() -> None:
    provider_user_id = f"did:privy:dedupe_{unique_suffix()}"
    first_payload = wallet_payload(
        provider_user_id=provider_user_id,
        display_name="Roseane Original",
    )
    second_payload = wallet_payload(
        provider_user_id=provider_user_id,
        display_name="Roseane Atualizada",
        email="roseane.updated@example.com",
    )

    with TestClient(app) as client:
        first = client.post("/auth/wallet-session", json=first_payload).json()
        second = client.post("/auth/wallet-session", json=second_payload).json()

    assert first["id"] == second["id"]
    assert second["display_name"] == "Roseane Atualizada"
    assert second["email"] == "roseane.updated@example.com"


def test_wallet_session_reuses_existing_wallet_address() -> None:
    wallet_address = f"0x{uuid4().hex[:40].ljust(40, '0')}"
    first_payload = wallet_payload(wallet_address=wallet_address)
    second_payload = wallet_payload(
        provider="web3auth",
        provider_user_id=f"web3auth|{unique_suffix()}",
        wallet_address=wallet_address,
        display_name="Roseane Web3Auth",
    )

    with TestClient(app) as client:
        first = client.post("/auth/wallet-session", json=first_payload).json()
        second = client.post("/auth/wallet-session", json=second_payload).json()

    assert first["id"] == second["id"]
    assert second["provider"] == "web3auth"
    assert second["wallet_address"] == wallet_address


def test_roles_endpoint_exposes_actions_by_role() -> None:
    with TestClient(app) as client:
        response = client.get("/auth/roles")

    data = response.json()
    roles = {item["role"]: item for item in data["roles"]}
    assert response.status_code == 200
    assert "approve_consent" in roles["patient"]["available_actions"]
    assert "view_authorized_data" in roles["doctor"]["available_actions"]
    assert "manage_doctors" in roles["clinic"]["available_actions"]
    assert "manage_registry" in roles["admin"]["available_actions"]
    assert contains_forbidden_payload(data) is False


def test_wallet_session_ignores_private_key_in_payload() -> None:
    payload = wallet_payload(private_key="never-save-this")

    with TestClient(app) as client:
        response = client.post("/auth/wallet-session", json=payload)

    data = response.json()
    assert response.status_code == 201
    assert contains_forbidden_payload(data) is False
