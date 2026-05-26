from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.clinic import Clinic
from app.schemas.clinic import ClinicResponse


router = APIRouter()


def ensure_demo_clinic(db: Session) -> Clinic:
    demo_clinic = db.get(Clinic, "clinic_neurorio")

    if demo_clinic is None:
        demo_clinic = Clinic(
            id="clinic_neurorio",
            name="Clínica NeuroRio",
            cnpj="33.123.456/0001-89",
            authorized=True,
            license_status="active",
            risk_level="low",
        )
        db.add(demo_clinic)
        db.commit()
        db.refresh(demo_clinic)

    return demo_clinic


@router.get("/demo", response_model=ClinicResponse)
def get_demo_clinic(db: Session = Depends(get_db)) -> Clinic:
    return ensure_demo_clinic(db)
