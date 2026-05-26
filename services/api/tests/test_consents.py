from fastapi.testclient import TestClient

from app.main import app


def seed_demo_entities(client: TestClient) -> None:
    client.get("/users/demo")
    client.get("/clinics/demo")
    client.get("/doctors/demo")


def create_pending_access_request(client: TestClient) -> dict:
    response = client.post(
        "/access-requests",
        json={
            "patient_id": "patient_rose",
            "requester_type": "clinic",
            "clinic_id": "clinic_neurorio",
            "doctor_id": "doctor_ana",
            "requested_scopes": ["allergies", "medications", "special_needs"],
            "purpose": "Consulta neurológica",
            "duration_hours": 24,
        },
    )

    assert response.status_code in (200, 201)
    return response.json()


def approve_consent(client: TestClient, access_request_id: str) -> dict:
    response = client.post(
        "/consents/approve",
        json={
            "access_request_id": access_request_id,
            "allowed_scopes": ["allergies", "medications"],
            "transaction_hash": "0xmocked",
        },
    )

    assert response.status_code == 201
    return response.json()


def test_approve_consent_success() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        consent = approve_consent(client, access_request["id"])
        updated_request = client.get(f"/access-requests/{access_request['id']}")

    assert consent["status"] == "active"
    assert "allergies" in consent["allowed_scopes"]
    assert updated_request.json()["status"] == "approved"


def test_approve_missing_access_request_fails() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/consents/approve",
            json={
                "access_request_id": "req_missing",
                "allowed_scopes": ["allergies"],
                "transaction_hash": "0xmocked",
            },
        )

    assert response.status_code == 404


def test_approve_non_pending_access_request_fails() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        client.patch(
            f"/access-requests/{access_request['id']}/status",
            json={"status": "cancelled"},
        )
        response = client.post(
            "/consents/approve",
            json={
                "access_request_id": access_request["id"],
                "allowed_scopes": ["allergies"],
                "transaction_hash": "0xmocked",
            },
        )

    assert response.status_code == 400


def test_approve_empty_allowed_scopes_fails() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        response = client.post(
            "/consents/approve",
            json={
                "access_request_id": access_request["id"],
                "allowed_scopes": [],
                "transaction_hash": "0xmocked",
            },
        )

    assert response.status_code in (400, 422)


def test_approve_scope_outside_requested_scopes_fails() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        response = client.post(
            "/consents/approve",
            json={
                "access_request_id": access_request["id"],
                "allowed_scopes": ["full_history"],
                "transaction_hash": "0xmocked",
            },
        )

    assert response.status_code == 400


def test_get_consent_by_id() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        consent = approve_consent(client, access_request["id"])
        response = client.get(f"/consents/{consent['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == consent["id"]


def test_verify_active_consent_is_valid() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        consent = approve_consent(client, access_request["id"])
        response = client.get(f"/consents/{consent['id']}/verify")

    data = response.json()
    assert response.status_code == 200
    assert data["consentId"] == consent["id"]
    assert data["patientId"] == "patient_rose"
    assert "allergies" in data["allowedScopes"]
    assert "expiresAt" in data
    assert data["isValid"] is True


def test_revoke_consent_makes_verify_invalid() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        access_request = create_pending_access_request(client)
        consent = approve_consent(client, access_request["id"])
        revoke_response = client.post(
            "/consents/revoke",
            json={
                "consent_id": consent["id"],
                "transaction_hash": "0xmocked-revoked",
            },
        )
        verify_response = client.get(f"/consents/{consent['id']}/verify")

    assert revoke_response.status_code == 200
    assert revoke_response.json()["status"] == "revoked"
    assert verify_response.status_code == 200
    assert verify_response.json()["isValid"] is False
