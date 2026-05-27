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


def test_external_verify_demo_clinic() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        response = client.get("/external/clinics/clinic_neurorio/verify")

    assert response.status_code == 200
    assert response.json()["clinicId"] == "clinic_neurorio"
    assert response.json()["authorized"] is True
    assert response.json()["licenseStatus"] == "active"


def test_external_verify_demo_doctor() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        response = client.get("/external/doctors/doctor_ana/verify")

    assert response.status_code == 200
    assert response.json()["doctorId"] == "doctor_ana"
    assert response.json()["authorized"] is True
    assert response.json()["crmStatus"] == "active"
    assert response.json()["clinicId"] == "clinic_neurorio"


def test_external_verify_missing_clinic_fails() -> None:
    with TestClient(app) as client:
        response = client.get("/external/clinics/clinic_fake/verify")

    assert response.status_code == 404


def test_external_verify_missing_doctor_fails() -> None:
    with TestClient(app) as client:
        response = client.get("/external/doctors/doctor_fake/verify")

    assert response.status_code == 404


def test_external_verify_consent() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        response = client.get(f"/external/consents/{consent['id']}/verify")

    assert response.status_code == 200
    assert response.json()["isValid"] is True
    assert "allergies" in response.json()["allowedScopes"]


def test_external_validate_authorized_access() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        response = client.get(
            "/external/access/validate",
            params={
                "clinic_id": "clinic_neurorio",
                "doctor_id": "doctor_ana",
                "consent_id": consent["id"],
                "requested_scopes": "allergies,medications",
            },
        )

    data = response.json()
    assert response.status_code == 200
    assert data["decision"] == "AUTHORIZED"
    assert data["clinicAuthorized"] is True
    assert data["doctorAuthorized"] is True
    assert data["doctorBelongsToClinic"] is True
    assert data["consentValid"] is True
    assert data["scopeValid"] is True


def test_external_validate_denied_by_scope() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        response = client.get(
            "/external/access/validate",
            params={
                "clinic_id": "clinic_neurorio",
                "doctor_id": "doctor_ana",
                "consent_id": consent["id"],
                "requested_scopes": "allergies,recent_exams",
            },
        )

    data = response.json()
    assert response.status_code == 200
    assert data["decision"] == "DENIED"
    assert data["scopeValid"] is False
    assert data["reason"] == "Requested scopes are outside consent"


def test_external_validate_denied_by_missing_consent() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        response = client.get(
            "/external/access/validate",
            params={
                "clinic_id": "clinic_neurorio",
                "doctor_id": "doctor_ana",
                "consent_id": "consent_fake",
                "requested_scopes": "allergies",
            },
        )

    data = response.json()
    assert response.status_code == 200
    assert data["decision"] == "DENIED"
    assert data["reason"] == "Consent not found"
    assert data["consentValid"] is False


def test_external_validate_denied_by_missing_clinic() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        consent = create_active_consent(client)
        response = client.get(
            "/external/access/validate",
            params={
                "clinic_id": "clinic_fake",
                "doctor_id": "doctor_ana",
                "consent_id": consent["id"],
                "requested_scopes": "allergies",
            },
        )

    data = response.json()
    assert response.status_code == 200
    assert data["decision"] == "DENIED"
    assert data["reason"] == "Clinic not found"
    assert data["clinicAuthorized"] is False
