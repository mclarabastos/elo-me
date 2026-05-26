from fastapi.testclient import TestClient

from app.main import app


def test_get_demo_clinic() -> None:
    with TestClient(app) as client:
        response = client.get("/clinics/demo")

    assert response.status_code == 200
    assert response.json()["id"] == "clinic_neurorio"


def test_get_demo_doctor() -> None:
    with TestClient(app) as client:
        response = client.get("/doctors/demo")

    assert response.status_code == 200
    assert response.json()["id"] == "doctor_ana"


def test_get_patient_demo_medical_data() -> None:
    with TestClient(app) as client:
        response = client.get("/patients/patient_rose/medical-data")

    assert response.status_code == 200

    data = response.json()
    assert len(data) >= 6
    assert "encrypted_payload" not in data[0]
