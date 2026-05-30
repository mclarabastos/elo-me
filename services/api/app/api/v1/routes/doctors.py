from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.routes.clinics import ensure_demo_clinic
from app.core.text import normalize_payload_text
from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.doctor import Doctor
from app.schemas.access_request import AccessRequestResponse
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


@router.get(
    "/{doctor_id}/sent-requests",
    response_model=list[AccessRequestResponse],
)
def get_doctor_sent_requests(
    doctor_id: str,
    db: Session = Depends(get_db),
) -> list[dict[str, object]]:
    access_requests = (
        db.query(AccessRequest)
        .filter(AccessRequest.doctor_id == doctor_id)
        .order_by(AccessRequest.created_at.desc())
        .all()
    )

    return [
        normalize_payload_text(
            AccessRequestResponse.model_validate(item).model_dump(mode="json")
        )
        for item in access_requests
    ]
