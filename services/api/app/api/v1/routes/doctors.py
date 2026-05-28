from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.routes.clinics import ensure_demo_clinic
from app.db.database import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorResponse


router = APIRouter()


DEMO_DOCTOR = {
    "id": "doctor_ana",
    "name": "Dra. Ana Martins",
    "crm": "CRM-SP 123456",
    "authorized": True,
    "crm_status": "active",
    "clinic_id": "clinic_neurorio",
}


def ensure_demo_doctor(db: Session) -> Doctor:
    ensure_demo_clinic(db)
    demo_doctor = db.get(Doctor, "doctor_ana")

    if demo_doctor is None:
        demo_doctor = Doctor(**DEMO_DOCTOR)
        db.add(demo_doctor)
        db.commit()
        db.refresh(demo_doctor)
    else:
        for field, value in DEMO_DOCTOR.items():
            setattr(demo_doctor, field, value)
        db.commit()
        db.refresh(demo_doctor)

    return demo_doctor


@router.get("/demo", response_model=DoctorResponse)
def get_demo_doctor(db: Session = Depends(get_db)) -> Doctor:
    return ensure_demo_doctor(db)
