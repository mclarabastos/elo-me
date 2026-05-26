from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.consent import Consent
from app.models.medical_data import MedicalData
from app.schemas.consent import (
    ConsentApproveRequest,
    ConsentResponse,
    ConsentRevokeRequest,
    ConsentVerifyResponse,
)
from app.schemas.medical_data import MedicalDataResponse


router = APIRouter()


def get_consent_or_404(db: Session, consent_id: str) -> Consent:
    consent = db.get(Consent, consent_id)

    if consent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found",
        )

    return consent


@router.post(
    "/approve",
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED,
)
def approve_consent(
    payload: ConsentApproveRequest,
    db: Session = Depends(get_db),
) -> Consent:
    access_request = db.get(AccessRequest, payload.access_request_id)

    if access_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access request not found",
        )

    if access_request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Access request is not pending",
        )

    if not payload.allowed_scopes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="allowed_scopes must not be empty",
        )

    requested_scopes = set(access_request.requested_scopes)
    allowed_scopes = set(payload.allowed_scopes)

    if not allowed_scopes.issubset(requested_scopes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="allowed_scopes must be contained in requested_scopes",
        )

    now = datetime.utcnow()
    consent = Consent(
        id=f"consent_{uuid4().hex[:8]}",
        access_request_id=payload.access_request_id,
        patient_id=access_request.patient_id,
        allowed_scopes=payload.allowed_scopes,
        expires_at=now + timedelta(hours=access_request.duration_hours),
        status="active",
        transaction_hash=payload.transaction_hash,
    )
    access_request.status = "approved"
    access_request.updated_at = now

    db.add(consent)
    db.commit()
    db.refresh(consent)

    return consent


@router.post("/revoke", response_model=ConsentResponse)
def revoke_consent(
    payload: ConsentRevokeRequest,
    db: Session = Depends(get_db),
) -> Consent:
    consent = get_consent_or_404(db, payload.consent_id)
    consent.status = "revoked"

    if payload.transaction_hash is not None:
        consent.transaction_hash = payload.transaction_hash

    consent.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(consent)

    return consent


@router.get("/{consent_id}", response_model=ConsentResponse)
def get_consent(
    consent_id: str,
    db: Session = Depends(get_db),
) -> Consent:
    return get_consent_or_404(db, consent_id)


@router.get("/{consent_id}/verify", response_model=ConsentVerifyResponse)
def verify_consent(
    consent_id: str,
    db: Session = Depends(get_db),
) -> ConsentVerifyResponse:
    consent = get_consent_or_404(db, consent_id)
    is_valid = consent.status == "active" and consent.expires_at > datetime.utcnow()

    return ConsentVerifyResponse(
        consentId=consent.id,
        status=consent.status,
        patientId=consent.patient_id,
        allowedScopes=consent.allowed_scopes,
        expiresAt=consent.expires_at,
        isValid=is_valid,
    )


@router.get(
    "/{consent_id}/authorized-medical-data",
    response_model=list[MedicalDataResponse],
)
def get_authorized_medical_data(
    consent_id: str,
    db: Session = Depends(get_db),
) -> list[MedicalData]:
    consent = get_consent_or_404(db, consent_id)

    if consent.status != "active" or consent.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Consent is not valid",
        )

    return (
        db.query(MedicalData)
        .filter(MedicalData.patient_id == consent.patient_id)
        .filter(MedicalData.category.in_(consent.allowed_scopes))
        .order_by(MedicalData.id)
        .all()
    )
