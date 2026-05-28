from fastapi.testclient import TestClient

from app.main import app


def seed_demo_entities(client: TestClient) -> None:
    client.get("/users/demo")
    client.get("/clinics/demo")
    client.get("/doctors/demo")


def create_access_request(client: TestClient) -> dict:
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


def test_create_access_request_success() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        data = create_access_request(client)

    assert data["status"] == "pending"
    assert data["patient_id"] == "patient_rose"
    assert "allergies" in data["requested_scopes"]


def test_get_access_request_by_id() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        created = create_access_request(client)
        response = client.get(f"/access-requests/{created['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_list_patient_access_requests() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        created = create_access_request(client)
        response = client.get("/patients/patient_rose/access-requests")

    assert response.status_code == 200
    assert any(item["id"] == created["id"] for item in response.json())


def test_update_access_request_status_to_cancelled() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        created = create_access_request(client)
        response = client.patch(
            f"/access-requests/{created['id']}/status",
            json={"status": "cancelled"},
        )

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_create_access_request_with_missing_patient_fails() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/access-requests",
            json={
                "patient_id": "missing_patient",
                "requester_type": "clinic",
                "clinic_id": None,
                "doctor_id": None,
                "requested_scopes": ["allergies"],
                "purpose": "Consulta neurológica",
                "duration_hours": 24,
            },
        )

    assert response.status_code == 404


def test_create_access_request_with_empty_scopes_fails() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        response = client.post(
            "/access-requests",
            json={
                "patient_id": "patient_rose",
                "requester_type": "clinic",
                "clinic_id": "clinic_neurorio",
                "doctor_id": "doctor_ana",
                "requested_scopes": [],
                "purpose": "Consulta neurológica",
                "duration_hours": 24,
            },
        )

    assert response.status_code == 400


def test_create_access_request_with_invalid_duration_fails() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        response = client.post(
            "/access-requests",
            json={
                "patient_id": "patient_rose",
                "requester_type": "clinic",
                "clinic_id": "clinic_neurorio",
                "doctor_id": "doctor_ana",
                "requested_scopes": ["allergies"],
                "purpose": "Consulta neurológica",
                "duration_hours": 0,
            },
        )

    assert response.status_code == 400


def test_update_access_request_with_invalid_status_fails() -> None:
    with TestClient(app) as client:
        seed_demo_entities(client)
        created = create_access_request(client)
        response = client.patch(
            f"/access-requests/{created['id']}/status",
            json={"status": "expired"},
        )

    assert response.status_code == 400
