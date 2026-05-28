from fastapi.testclient import TestClient

from app.main import app


def test_demo_overview() -> None:
    with TestClient(app) as client:
        response = client.get("/demo/overview")

    data = response.json()
    assert response.status_code == 200
    assert data["project"] == "Elo.me"
    assert data["patient"]["id"] == "patient_rose"
    assert data["clinic"]["id"] == "clinic_neurorio"
    assert data["doctor"]["id"] == "doctor_ana"
    assert isinstance(data["medicalDataCategories"], list)
    assert all(
        "encrypted_payload" not in item
        for item in data["medicalDataCategories"]
    )


def test_demo_run_authorized_flow() -> None:
    with TestClient(app) as client:
        response = client.post("/demo/run-authorized-flow")

    data = response.json()
    categories = {item["category"] for item in data["authorizedMedicalData"]}

    assert response.status_code == 201
    assert data["flow"] == "authorized"
    assert data["externalValidation"]["decision"] == "AUTHORIZED"
    assert data["externalValidation"]["scopeValid"] is True
    assert isinstance(data["authorizedMedicalData"], list)
    assert categories.issubset({"allergies", "medications"})
    assert all(
        "encrypted_payload" not in item
        for item in data["authorizedMedicalData"]
    )
    assert data["auditLog"]["decision"] == "AUTHORIZED"


def test_demo_run_denied_flow() -> None:
    with TestClient(app) as client:
        response = client.post("/demo/run-denied-flow")

    data = response.json()
    assert response.status_code == 201
    assert data["flow"] == "denied"
    assert data["externalValidation"]["decision"] == "DENIED"
    assert data["externalValidation"]["scopeValid"] is False
    assert "recent_exams" in data["blockedScopes"]
    assert data["auditLog"]["decision"] == "DENIED"


def test_demo_reset_local_demo_data() -> None:
    with TestClient(app) as client:
        client.post("/demo/run-authorized-flow")
        client.post("/demo/run-denied-flow")
        response = client.post("/demo/reset-local-demo-data")

    data = response.json()
    assert response.status_code == 200
    assert data["deleted"]["auditLogs"] >= 1
    assert data["deleted"]["consents"] >= 1
    assert data["deleted"]["accessRequests"] >= 1


def test_demo_overview_works_after_reset() -> None:
    with TestClient(app) as client:
        client.post("/demo/reset-local-demo-data")
        response = client.get("/demo/overview")

    data = response.json()
    assert response.status_code == 200
    assert data["patient"]["id"] == "patient_rose"
    assert data["clinic"]["id"] == "clinic_neurorio"
    assert data["doctor"]["id"] == "doctor_ana"
