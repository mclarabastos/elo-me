from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


ALLOWED_AUTH_ROLES = {"patient", "doctor", "clinic", "admin"}


def normalize_required_text(value: str) -> str:
    normalized = value.strip()

    if not normalized:
        raise ValueError("Field must not be empty")

    return normalized


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    return normalized or None


class AuthIdentityCreate(BaseModel):
    provider: str
    provider_user_id: str
    email: str | None = None
    phone: str | None = None
    wallet_address: str
    role: str
    display_name: str

    model_config = ConfigDict(extra="ignore")

    @field_validator(
        "provider",
        "provider_user_id",
        "wallet_address",
        "display_name",
    )
    @classmethod
    def required_text_must_not_be_empty(cls, value: str) -> str:
        return normalize_required_text(value)

    @field_validator("email", "phone")
    @classmethod
    def optional_text_can_be_blank(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)

    @field_validator("role")
    @classmethod
    def role_must_be_supported(cls, value: str) -> str:
        normalized = normalize_required_text(value)

        if normalized not in ALLOWED_AUTH_ROLES:
            raise ValueError("Invalid role")

        return normalized


class AuthIdentityRoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def role_must_be_supported(cls, value: str) -> str:
        normalized = normalize_required_text(value)

        if normalized not in ALLOWED_AUTH_ROLES:
            raise ValueError("Invalid role")

        return normalized


class AuthIdentityResponse(BaseModel):
    id: str
    provider: str
    provider_user_id: str
    email: str | None
    phone: str | None
    wallet_address: str
    display_name: str
    role: str
    available_actions: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WalletSessionResponse(AuthIdentityResponse):
    message: str
