from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app


def clear_settings_env(monkeypatch) -> None:
    for key in (
        "APP_NAME",
        "APP_ENV",
        "DEBUG",
        "DATABASE_URL",
        "SECRET_KEY",
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "BACKEND_CORS_ORIGINS",
        "PORT",
    ):
        monkeypatch.delenv(key, raising=False)


def test_settings_defaults_without_env_file(monkeypatch) -> None:
    clear_settings_env(monkeypatch)
    local_settings = Settings(_env_file=None)

    assert local_settings.APP_NAME == "Elo.me API"
    assert local_settings.DATABASE_URL == "sqlite:///./elome.db"
    assert local_settings.BACKEND_CORS_ORIGINS == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


def test_settings_parses_comma_separated_cors_origins(monkeypatch) -> None:
    clear_settings_env(monkeypatch)
    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        "https://front.example.com, http://localhost:3000",
    )
    local_settings = Settings(_env_file=None)

    assert local_settings.BACKEND_CORS_ORIGINS == [
        "https://front.example.com",
        "http://localhost:3000",
    ]


def test_health_still_works_with_settings() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
