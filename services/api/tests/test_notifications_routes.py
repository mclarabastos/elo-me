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


def test_demo_notify_patient_and_notification_flow() -> None:
    with TestClient(app) as client:
        created_response = client.post("/access-requests/demo-notify-patient")

    created = created_response.json()
    notification = created["notification"]
    access_request = created["access_request"]
    identity_id = notification["recipient_identity_id"]

    assert created_response.status_code == 201
    assert access_request["status"] == "pending"
    assert notification["status"] == "unread"
    assert notification["type"] == "access_request"
    assert "nextSteps" in created
    assert_public_payload(created)

    with TestClient(app) as client:
        notifications_response = client.get(f"/notifications/{identity_id}")

    notifications = notifications_response.json()
    assert notifications_response.status_code == 200
    assert any(item["id"] == notification["id"] for item in notifications)
    assert_public_payload(notifications)

    with TestClient(app) as client:
        read_response = client.patch(f"/notifications/{notification['id']}/read")

    read_notification = read_response.json()
    assert read_response.status_code == 200
    assert read_notification["status"] == "read"
    assert read_notification["read_at"] is not None
    assert_public_payload(read_notification)


def test_pending_and_sent_requests_by_profile() -> None:
    with TestClient(app) as client:
        created = client.post("/access-requests/demo-notify-patient").json()
        access_request_id = created["access_request"]["id"]
        patient_response = client.get("/patients/patient_rose/pending-requests")
        doctor_response = client.get("/doctors/doctor_ana/sent-requests")
        clinic_response = client.get("/clinics/clinic_neurorio/sent-requests")

    patient_requests = patient_response.json()
    doctor_requests = doctor_response.json()
    clinic_requests = clinic_response.json()

    assert patient_response.status_code == 200
    assert doctor_response.status_code == 200
    assert clinic_response.status_code == 200
    assert any(item["id"] == access_request_id for item in patient_requests)
    assert any(item["id"] == access_request_id for item in doctor_requests)
    assert any(item["id"] == access_request_id for item in clinic_requests)
    assert_public_payload(patient_requests)
    assert_public_payload(doctor_requests)
    assert_public_payload(clinic_requests)
