from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClinicResponse(BaseModel):
    id: str
    name: str
    cnpj: str | None
    authorized: bool
    license_status: str
    risk_level: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
