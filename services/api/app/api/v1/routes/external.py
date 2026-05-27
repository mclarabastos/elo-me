from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.clinic import Clinic
from app.models.consent import Consent
from app.models.doctor import Doctor


router = APIRouter()

VALIDATED_BY = "external-api-for-chainlink-cre"


def parse_requested_scopes(requested_scopes: str) -> list[str]:
    return [
        scope.strip()
        for scope in requested_scopes.split(",")
        if scope.strip()
    ]


def is_consent_valid(consent: Consent) -> bool:
    return consent.status == "active" and consent.expires_at > datetime.utcnow()


def build_access_validation_response(
    *,
    decision: str,
    reason: str,
    clinic_authorized: bool,
    doctor_authorized: bool,
    doctor_belongs_to_clinic: bool,
    consent_valid: bool,
    scope_valid: bool,
    requested_scopes: list[str],
    allowed_scopes: list[str],
) -> dict[str, object]:
    return {
        "decision": decision,
        "reason": reason,
        "validatedBy": VALIDATED_BY,
        "clinicAuthorized": clinic_authorized,
        "doctorAuthorized": doctor_authorized,
        "doctorBelongsToClinic": doctor_belongs_to_clinic,
        "consentValid": consent_valid,
        "scopeValid": scope_valid,
        "requestedScopes": requested_scopes,
        "allowedScopes": allowed_scopes,
    }


def denied_response(
    *,
    reason: str,
    clinic_authorized: bool = False,
    doctor_authorized: bool = False,
    doctor_belongs_to_clinic: bool = False,
    consent_valid: bool = False,
    scope_valid: bool = False,
    requested_scopes: list[str],
    allowed_scopes: list[str] | None = None,
) -> dict[str, object]:
    return build_access_validation_response(
        decision="DENIED",
        reason=reason,
        clinic_authorized=clinic_authorized,
        doctor_authorized=doctor_authorized,
        doctor_belongs_to_clinic=doctor_belongs_to_clinic,
        consent_valid=consent_valid,
        scope_valid=scope_valid,
        requested_scopes=requested_scopes,
        allowed_scopes=allowed_scopes or [],
    )


@router.get("/clinics/{clinic_id}/verify")
def verify_clinic(
    clinic_id: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    clinic = db.get(Clinic, clinic_id)

    if clinic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found",
        )

    return {
        "clinicId": clinic.id,
        "name": clinic.name,
        "authorized": clinic.authorized,
        "licenseStatus": clinic.license_status,
        "riskLevel": clinic.risk_level,
    }


@router.get("/doctors/{doctor_id}/verify")
def verify_doctor(
    doctor_id: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    doctor = db.get(Doctor, doctor_id)

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    return {
        "doctorId": doctor.id,
        "name": doctor.name,
        "authorized": doctor.authorized,
        "crmStatus": doctor.crm_status,
        "clinicId": doctor.clinic_id,
    }


@router.get("/consents/{consent_id}/verify")
def verify_external_consent(
    consent_id: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    consent = db.get(Consent, consent_id)

    if consent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found",
        )

    return {
        "consentId": consent.id,
        "status": consent.status,
        "patientId": consent.patient_id,
        "allowedScopes": consent.allowed_scopes,
        "expiresAt": consent.expires_at,
        "isValid": is_consent_valid(consent),
    }


@router.get("/access/validate")
def validate_external_access(
    clinic_id: str,
    doctor_id: str,
    consent_id: str,
    requested_scopes: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    requested_scope_list = parse_requested_scopes(requested_scopes)

    clinic = db.get(Clinic, clinic_id)
    if clinic is None:
        return denied_response(
            reason="Clinic not found",
            requested_scopes=requested_scope_list,
        )

    clinic_authorized = clinic.authorized and clinic.license_status == "active"
    if not clinic_authorized:
        return denied_response(
            reason="Clinic is not authorized",
            requested_scopes=requested_scope_list,
        )

    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        return denied_response(
            reason="Doctor not found",
            clinic_authorized=True,
            requested_scopes=requested_scope_list,
        )

    doctor_authorized = doctor.authorized and doctor.crm_status == "active"
    if not doctor_authorized:
        return denied_response(
            reason="Doctor is not authorized",
            clinic_authorized=True,
            requested_scopes=requested_scope_list,
        )

    doctor_belongs_to_clinic = doctor.clinic_id == clinic_id
    if not doctor_belongs_to_clinic:
        return denied_response(
            reason="Doctor does not belong to clinic",
            clinic_authorized=True,
            doctor_authorized=True,
            requested_scopes=requested_scope_list,
        )

    consent = db.get(Consent, consent_id)
    if consent is None:
        return denied_response(
            reason="Consent not found",
            clinic_authorized=True,
            doctor_authorized=True,
            doctor_belongs_to_clinic=True,
            requested_scopes=requested_scope_list,
        )

    consent_valid = is_consent_valid(consent)
    if not consent_valid:
        return denied_response(
            reason="Consent is not valid",
            clinic_authorized=True,
            doctor_authorized=True,
            doctor_belongs_to_clinic=True,
            requested_scopes=requested_scope_list,
            allowed_scopes=consent.allowed_scopes,
        )

    allowed_scopes = consent.allowed_scopes
    scope_valid = set(requested_scope_list).issubset(set(allowed_scopes))
    if not scope_valid:
        return denied_response(
            reason="Requested scopes are outside consent",
            clinic_authorized=True,
            doctor_authorized=True,
            doctor_belongs_to_clinic=True,
            consent_valid=True,
            requested_scopes=requested_scope_list,
            allowed_scopes=allowed_scopes,
        )

    return build_access_validation_response(
        decision="AUTHORIZED",
        reason="Access granted by valid consent",
        clinic_authorized=True,
        doctor_authorized=True,
        doctor_belongs_to_clinic=True,
        consent_valid=True,
        scope_valid=True,
        requested_scopes=requested_scope_list,
        allowed_scopes=allowed_scopes,
    )
