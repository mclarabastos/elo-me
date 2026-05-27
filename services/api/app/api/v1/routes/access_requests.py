from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.time import utc_now
from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.clinic import Clinic
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.access_request import (
    AccessRequestCreate,
    AccessRequestResponse,
    AccessRequestStatusUpdate,
)


router = APIRouter()

ALLOWED_STATUSES = {"pending", "approved", "denied", "cancelled"}


def get_access_request_or_404(db: Session, request_id: str) -> AccessRequest:
    access_request = db.get(AccessRequest, request_id)

    if access_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found",
        )

    return access_request


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
