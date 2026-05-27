from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConsentApproveRequest(BaseModel):
    access_request_id: str
    allowed_scopes: list[str]
    transaction_hash: str | None = None


class ConsentRevokeRequest(BaseModel):
    consent_id: str
    transaction_hash: str | None = None


class ConsentResponse(BaseModel):
    id: str
    access_request_id: str
    patient_id: str
    allowed_scopes: list[str]
    expires_at: datetime
    status: str
    transaction_hash: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConsentVerifyResponse(BaseModel):
    consentId: str
    status: str
    patientId: str
    allowedScopes: list[str]
    expiresAt: datetime
    isValid: bool
