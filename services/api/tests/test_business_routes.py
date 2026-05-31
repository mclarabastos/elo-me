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


def test_business_model() -> None:
    with TestClient(app) as client:
        response = client.get("/business/model")

    data = response.json()
    assert response.status_code == 200
    assert "pricingPlans" in data
    assert len(data["pricingPlans"]) >= 6
    assert_public_payload(data)


def test_market_sizing() -> None:
    with TestClient(app) as client:
        response = client.get("/business/market-sizing")

    data = response.json()
    assert response.status_code == 200
    assert data["tam"]["people"] == 52969610
    assert data["sam"]["people"] == 10593922
    assert data["som"]["people"] == 10594
    assert data["revenueSimulation"]["monthlyPotentialBRL"] == 634581
    assert_public_payload(data)


def test_break_even() -> None:
    with TestClient(app) as client:
        response = client.get("/business/break-even")

    data = response.json()
    targets = {scenario["monthlyTargetBRL"] for scenario in data["scenarios"]}
    assert response.status_code == 200
    assert targets == {5000, 10000, 25000}
    assert_public_payload(data)


def test_pitch_business_data() -> None:
    with TestClient(app) as client:
        response = client.get("/business/pitch-business-data")

    data = response.json()
    assert response.status_code == 200
    assert any("52 milhões" in item for item in data["slides"])
    assert "controle" in data["commercialArgument"]
    assert_public_payload(data)


def test_integration_business_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/integration/business-contract")

    data = response.json()
    business_paths = {item["path"] for item in data["businessEndpoints"]}
    notification_paths = {item["path"] for item in data["notificationEndpoints"]}
    journey_paths = {item["path"] for item in data["journeyEndpoints"]}

    assert response.status_code == 200
    assert "/business/model" in business_paths
    assert "/business/market-sizing" in business_paths
    assert "/business/break-even" in business_paths
    assert "/access-requests/demo-notify-patient" in notification_paths
    assert "/notifications/{identity_id}" in notification_paths
    assert "/user-journey/routes" in journey_paths
    assert_public_payload(data)
