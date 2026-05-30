from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: str
    recipient_identity_id: str
    recipient_role: str
    patient_id: str | None
    clinic_id: str | None
    doctor_id: str | None
    title: str
    message: str
    type: str
    status: str
    related_access_request_id: str | None
    channel: str
    created_at: datetime
    read_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
