from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DoctorResponse(BaseModel):
    id: str
    name: str
    crm: str
    authorized: bool
    crm_status: str
    clinic_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
