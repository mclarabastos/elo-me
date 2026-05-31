from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.text import normalize_payload_text
from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.clinic import Clinic
from app.schemas.access_request import AccessRequestResponse
from app.schemas.clinic import ClinicResponse


router = APIRouter()


DEMO_CLINIC = {
    "id": "clinic_neurorio",
    "name": "Clínica NeuroRio",
    "cnpj": "33.123.456/0001-89",
    "authorized": True,
    "license_status": "active",
    "risk_level": "low",
}


def ensure_demo_clinic(db: Session) -> Clinic:
    demo_clinic = db.get(Clinic, "clinic_neurorio")

    if demo_clinic is None:
        demo_clinic = Clinic(**DEMO_CLINIC)
        db.add(demo_clinic)
        db.commit()
        db.refresh(demo_clinic)
    else:
        for field, value in DEMO_CLINIC.items():
            setattr(demo_clinic, field, value)
        db.commit()
        db.refresh(demo_clinic)

    return demo_clinic


@router.get("/demo", response_model=ClinicResponse)
def get_demo_clinic(db: Session = Depends(get_db)) -> Clinic:
    return ensure_demo_clinic(db)


@router.get(
    "/{clinic_id}/sent-requests",
    response_model=list[AccessRequestResponse],
)
def get_clinic_sent_requests(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> list[dict[str, object]]:
    access_requests = (
        db.query(AccessRequest)
        .filter(AccessRequest.clinic_id == clinic_id)
        .order_by(AccessRequest.created_at.desc())
        .all()
    )

    return [
        normalize_payload_text(
            AccessRequestResponse.model_validate(item).model_dump(mode="json")
        )
        for item in access_requests
    ]
