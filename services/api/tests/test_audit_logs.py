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


def create_active_consent(client: TestClient) -> dict:
    access_request = create_pending_access_request(client)
    response = client.post(
        "/consents/approve",
        json={
            "access_request_id": access_request["id"],
            "allowed_scopes": ["allergies", "medications"],
            "transaction_hash": "0xmocked",
        },
    )

    assert response.status_code == 201
    return response.json()


def validate_access(
    client: TestClient,
    consent_id: str,
    requested_scopes: str,
) -> dict:
    response = client.get(
        "/external/access/validate",
        params={
            "clinic_id": "clinic_neurorio",
            "doctor_id": "doctor_ana",
            "consent_id": consent_id,
            "requested_scopes": requested_scopes,
        },
    )

    assert response.status_code == 200
    return response.json()


def test_authorized_external_validation_creates_audit_log() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        validate_access(client, consent["id"], "allergies,medications")
        response = client.get("/patients/patient_rose/audit-logs")

    assert response.status_code == 200

    logs = response.json()
    matching_logs = [
        log
        for log in logs
        if log["consent_id"] == consent["id"]
        and log["decision"] == "AUTHORIZED"
    ]

    assert isinstance(logs, list)
    assert matching_logs

    audit_log = matching_logs[0]
    assert audit_log["reason"] == "Access granted by valid consent"
    assert audit_log["consent_id"] == consent["id"]
    assert "allergies" in audit_log["requested_scopes"]


def test_denied_external_validation_creates_audit_log() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        validate_access(client, consent["id"], "allergies,recent_exams")
        response = client.get("/patients/patient_rose/audit-logs")

    logs = response.json()
    matching_logs = [
        log
        for log in logs
        if log["consent_id"] == consent["id"]
        and log["decision"] == "DENIED"
        and log["reason"] == "Requested scopes are outside consent"
    ]

    assert response.status_code == 200
    assert matching_logs
    assert "recent_exams" in matching_logs[0]["requested_scopes"]


def test_list_audit_logs_returns_list() -> None:
    with TestClient(app) as client:
        response = client.get("/audit-logs")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_audit_log_by_id() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        validate_access(client, consent["id"], "allergies")
        logs_response = client.get("/patients/patient_rose/audit-logs")
        audit_log_id = next(
            log["id"]
            for log in logs_response.json()
            if log["consent_id"] == consent["id"]
        )
        response = client.get(f"/audit-logs/{audit_log_id}")

    assert response.status_code == 200
    assert response.json()["id"] == audit_log_id


def test_get_missing_audit_log_fails() -> None:
    with TestClient(app) as client:
        response = client.get("/audit-logs/audit_fake")

    assert response.status_code == 404
    assert response.json()["detail"] == "Audit log not found"
