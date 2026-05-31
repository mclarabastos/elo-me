from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.routes.clinics import ensure_demo_clinic
from app.api.v1.routes.doctors import ensure_demo_doctor
from app.api.v1.routes.patients import ensure_demo_medical_data, ensure_demo_patient
from app.core.text import normalize_payload_text
from app.core.time import utc_now
from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.auth_identity import AuthIdentity
from app.models.clinic import Clinic
from app.models.doctor import Doctor
from app.models.notification import Notification
from app.models.user import User
from app.schemas.access_request import (
    AccessRequestCreate,
    AccessRequestResponse,
    AccessRequestStatusUpdate,
)
from app.schemas.notification import NotificationResponse


router = APIRouter()

ALLOWED_STATUSES = {"pending", "approved", "denied", "cancelled"}

DEMO_PATIENT_IDENTITY = {
    "id": "auth_patient_rose_demo",
    "provider": "privy",
    "provider_user_id": "did:privy:patient_rose_demo",
    "email": "roseane@example.com",
    "phone": None,
    "wallet_address": "0x1111111111111111111111111111111111111111",
    "display_name": "Roseane Carreiro",
    "role": "patient",
}


def get_access_request_or_404(db: Session, request_id: str) -> AccessRequest:
    access_request = db.get(AccessRequest, request_id)

    if access_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found",
        )

    return access_request


def ensure_demo_patient_identity(db: Session) -> AuthIdentity:
    identity = db.get(AuthIdentity, DEMO_PATIENT_IDENTITY["id"])

    if identity is None:
        identity = (
            db.query(AuthIdentity)
            .filter(
                AuthIdentity.provider == DEMO_PATIENT_IDENTITY["provider"],
                AuthIdentity.provider_user_id
                == DEMO_PATIENT_IDENTITY["provider_user_id"],
            )
            .first()
        )

    if identity is None:
        identity = AuthIdentity(id=DEMO_PATIENT_IDENTITY["id"])
        db.add(identity)

    for field, value in DEMO_PATIENT_IDENTITY.items():
        setattr(identity, field, value)

    identity.updated_at = utc_now()
    db.commit()
    db.refresh(identity)

    return identity


def serialize_access_request(access_request: AccessRequest) -> dict[str, object]:
    return normalize_payload_text(
        AccessRequestResponse.model_validate(access_request).model_dump(mode="json")
    )


def serialize_notification(notification: Notification) -> dict[str, object]:
    return normalize_payload_text(
        NotificationResponse.model_validate(notification).model_dump(mode="json")
    )


@router.post(
    "",
    response_model=AccessRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_access_request(
    payload: AccessRequestCreate,
    db: Session = Depends(get_db),
) -> AccessRequest:
    if db.get(User, payload.patient_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    if payload.clinic_id is not None and db.get(Clinic, payload.clinic_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found",
        )

    if payload.doctor_id is not None and db.get(Doctor, payload.doctor_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    if not payload.requested_scopes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="requested_scopes must not be empty",
        )

    if payload.duration_hours <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="duration_hours must be greater than 0",
        )

    access_request = AccessRequest(
        id=f"req_{uuid4().hex[:8]}",
        patient_id=payload.patient_id,
        requester_type=payload.requester_type,
        clinic_id=payload.clinic_id,
        doctor_id=payload.doctor_id,
        requested_scopes=payload.requested_scopes,
        purpose=payload.purpose,
        duration_hours=payload.duration_hours,
        status="pending",
    )
    db.add(access_request)
    db.commit()
    db.refresh(access_request)

    return access_request


@router.get("/{request_id}", response_model=AccessRequestResponse)
def get_access_request(
    request_id: str,
    db: Session = Depends(get_db),
) -> AccessRequest:
    return get_access_request_or_404(db, request_id)


@router.patch("/{request_id}/status", response_model=AccessRequestResponse)
def update_access_request_status(
    request_id: str,
    payload: AccessRequestStatusUpdate,
    db: Session = Depends(get_db),
) -> AccessRequest:
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid access request status",
        )

    access_request = get_access_request_or_404(db, request_id)
    access_request.status = payload.status
    access_request.updated_at = utc_now()

    db.commit()
    db.refresh(access_request)

    return access_request


@router.post("/demo-notify-patient", status_code=status.HTTP_201_CREATED)
def create_demo_access_request_notification(
    db: Session = Depends(get_db),
) -> dict[str, object]:
    ensure_demo_patient(db)
    clinic = ensure_demo_clinic(db)
    doctor = ensure_demo_doctor(db)
    ensure_demo_medical_data(db)
    identity = ensure_demo_patient_identity(db)

    access_request = AccessRequest(
        id=f"req_{uuid4().hex[:8]}",
        patient_id="patient_rose",
        requester_type="clinic",
        clinic_id=clinic.id,
        doctor_id=doctor.id,
        requested_scopes=["allergies", "medications"],
        purpose="Consulta neurológica",
        duration_hours=24,
        status="pending",
    )
    db.add(access_request)
    db.commit()
    db.refresh(access_request)

    notification = Notification(
        id=f"notif_{uuid4().hex[:8]}",
        recipient_identity_id=identity.id,
        recipient_role="patient",
        patient_id="patient_rose",
        clinic_id=clinic.id,
        doctor_id=doctor.id,
        title="Nova solicitação de acesso ao prontuário",
        message=(
            "Dra. Ana Martins solicitou acesso ao seu prontuário médico. "
            "Escopos solicitados: alergias, medicamentos. Você pode aprovar, "
            "recusar ou compartilhar apenas dados selecionados."
        ),
        type="access_request",
        status="unread",
        related_access_request_id=access_request.id,
        channel="platform",
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    return normalize_payload_text(
        {
            "access_request": serialize_access_request(access_request),
            "notification": serialize_notification(notification),
            "uxCopy": [
                "Você recebeu uma nova solicitação de acesso ao prontuário.",
                "Revise os dados solicitados antes de autorizar.",
                "Você pode compartilhar apenas o necessário.",
                "Sua decisão será registrada para auditoria.",
                "Dados médicos sensíveis não são gravados em blockchain.",
            ],
            "nextSteps": [
                "Abrir notificações da paciente.",
                "Revisar clínica, médica, escopos e finalidade.",
                "Aprovar tudo, aprovar parcialmente ou recusar.",
                "Validar o consentimento pela API externa e Chainlink CRE.",
            ],
        }
    )
