from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AccessRequestCreate(BaseModel):
    patient_id: str
    requester_type: str
    clinic_id: str | None = None
    doctor_id: str | None = None
    requested_scopes: list[str]
    purpose: str
    duration_hours: int


class AccessRequestStatusUpdate(BaseModel):
    status: str


class AccessRequestResponse(BaseModel):
    id: str
    patient_id: str
    requester_type: str
    clinic_id: str | None
    doctor_id: str | None
    requested_scopes: list[str]
    purpose: str
    duration_hours: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
