from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MedicalDataResponse(BaseModel):
    id: str
    patient_id: str
    category: str
    label: str
    data_hash: str
    sensitivity: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
