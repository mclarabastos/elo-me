from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: str
    patient_id: str | None
    clinic_id: str | None
    doctor_id: str | None
    consent_id: str | None
    requested_scopes: list[str]
    decision: str
    reason: str
    validated_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
