from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Elo.me API"
    API_VERSION: str = "0.1.0"
    DATABASE_URL: str = "sqlite:///./elome.db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
