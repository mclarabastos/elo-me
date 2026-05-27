from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audit_log import AuditLog
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


def save_audit_log(
    *,
    db: Session,
    response: dict[str, object],
    clinic_id: str,
    doctor_id: str,
    consent_id: str,
    requested_scopes: list[str],
    consent: Consent | None,
) -> dict[str, object]:
    audit_log = AuditLog(
        id=f"audit_{uuid4().hex[:8]}",
        patient_id=consent.patient_id if consent is not None else None,
        clinic_id=clinic_id,
        doctor_id=doctor_id,
        consent_id=consent_id,
        requested_scopes=requested_scopes,
        decision=str(response["decision"]),
        reason=str(response["reason"]),
        validated_by=VALIDATED_BY,
    )
    db.add(audit_log)
    db.commit()

    return response


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
    consent = db.get(Consent, consent_id)

    clinic = db.get(Clinic, clinic_id)
    if clinic is None:
        response = denied_response(
            reason="Clinic not found",
            requested_scopes=requested_scope_list,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    clinic_authorized = clinic.authorized and clinic.license_status == "active"
    if not clinic_authorized:
        response = denied_response(
            reason="Clinic is not authorized",
            requested_scopes=requested_scope_list,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        response = denied_response(
            reason="Doctor not found",
            clinic_authorized=True,
            requested_scopes=requested_scope_list,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    doctor_authorized = doctor.authorized and doctor.crm_status == "active"
    if not doctor_authorized:
        response = denied_response(
            reason="Doctor is not authorized",
            clinic_authorized=True,
            requested_scopes=requested_scope_list,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    doctor_belongs_to_clinic = doctor.clinic_id == clinic_id
    if not doctor_belongs_to_clinic:
        response = denied_response(
            reason="Doctor does not belong to clinic",
            clinic_authorized=True,
            doctor_authorized=True,
            requested_scopes=requested_scope_list,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    if consent is None:
        response = denied_response(
            reason="Consent not found",
            clinic_authorized=True,
            doctor_authorized=True,
            doctor_belongs_to_clinic=True,
            requested_scopes=requested_scope_list,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    consent_valid = is_consent_valid(consent)
    if not consent_valid:
        response = denied_response(
            reason="Consent is not valid",
            clinic_authorized=True,
            doctor_authorized=True,
            doctor_belongs_to_clinic=True,
            requested_scopes=requested_scope_list,
            allowed_scopes=consent.allowed_scopes,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    allowed_scopes = consent.allowed_scopes
    scope_valid = set(requested_scope_list).issubset(set(allowed_scopes))
    if not scope_valid:
        response = denied_response(
            reason="Requested scopes are outside consent",
            clinic_authorized=True,
            doctor_authorized=True,
            doctor_belongs_to_clinic=True,
            consent_valid=True,
            requested_scopes=requested_scope_list,
            allowed_scopes=allowed_scopes,
        )
        return save_audit_log(
            db=db,
            response=response,
            clinic_id=clinic_id,
            doctor_id=doctor_id,
            consent_id=consent_id,
            requested_scopes=requested_scope_list,
            consent=consent,
        )

    response = build_access_validation_response(
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
    return save_audit_log(
        db=db,
        response=response,
        clinic_id=clinic_id,
        doctor_id=doctor_id,
        consent_id=consent_id,
        requested_scopes=requested_scope_list,
        consent=consent,
    )
