from datetime import datetime, timedelta

from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.consent import Consent


def seed_demo_data(client: TestClient) -> None:
    client.get("/users/demo")
    client.get("/clinics/demo")
    client.get("/doctors/demo")
    client.get("/patients/patient_rose/medical-data")


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


def test_get_authorized_medical_data_filters_by_allowed_scopes() -> None:
    with TestClient(app) as client:
        seed_demo_data(client)
        consent = create_active_consent(client)
        response = client.get(
            f"/consents/{consent['id']}/authorized-medical-data"
        )

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    categories = {item["category"] for item in data}
    assert len(data) >= 2
    assert categories.issubset({"allergies", "medications"})
    assert "special_needs" not in categories
    assert "recent_exams" not in categories
    assert all("encrypted_payload" not in item for item in data)


def test_authorized_medical_data_missing_consent_fails() -> None:
    with TestClient(app) as client:
        response = client.get("/consents/consent_fake/authorized-medical-data")

    assert response.status_code == 404


def test_authorized_medical_data_revoked_consent_fails() -> None:
    with TestClient(app) as client:
        seed_demo_data(client)
        consent = create_active_consent(client)
        client.post(
            "/consents/revoke",
            json={
                "consent_id": consent["id"],
                "transaction_hash": "0xmocked-revoked",
            },
        )
        response = client.get(
            f"/consents/{consent['id']}/authorized-medical-data"
        )

    assert response.status_code == 403


def test_authorized_medical_data_expired_consent_fails() -> None:
    with TestClient(app) as client:
        seed_demo_data(client)
        consent = create_active_consent(client)

        db = SessionLocal()
        try:
            db_consent = db.get(Consent, consent["id"])
            db_consent.expires_at = datetime.utcnow() - timedelta(hours=1)
            db.commit()
        finally:
            db.close()

        response = client.get(
            f"/consents/{consent['id']}/authorized-medical-data"
        )

    assert response.status_code == 403
