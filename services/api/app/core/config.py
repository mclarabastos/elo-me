from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"


class Settings(BaseSettings):
    APP_NAME: str = "Elo.me API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "0.1.0"
    DATABASE_URL: str = "sqlite:///./elome.db"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BACKEND_CORS_ORIGINS_RAW: str = Field(
        default=DEFAULT_CORS_ORIGINS,
        validation_alias="BACKEND_CORS_ORIGINS",
    )
    PORT: int = 8000
    ELO_CONSENT_REGISTRY_ADDRESS: str | None = None
    ELO_CHAIN_ID: int | None = None
    ELO_CHAIN_NAME: str | None = None
    ELO_BLOCK_EXPLORER_URL: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def PROJECT_NAME(self) -> str:
        return self.APP_NAME

    @property
    def BACKEND_CORS_ORIGINS(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS_RAW.split(",")
            if origin.strip()
        ]

        if origins:
            return origins

        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]


settings = Settings()
