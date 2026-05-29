from uuid import uuid4

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.routes.clinics import ensure_demo_clinic
from app.api.v1.routes.consents import approve_consent
from app.api.v1.routes.doctors import ensure_demo_doctor
from app.api.v1.routes.external import validate_external_access
from app.api.v1.routes.patients import ensure_demo_medical_data, ensure_demo_patient
from app.core.text import normalize_payload_text, normalize_text
from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.audit_log import AuditLog
from app.models.consent import Consent
from app.models.medical_data import MedicalData
from app.schemas.access_request import AccessRequestResponse
from app.schemas.audit_log import AuditLogResponse
from app.schemas.consent import ConsentApproveRequest, ConsentResponse


router = APIRouter()


def ensure_base_demo_data(db: Session) -> tuple:
    patient = ensure_demo_patient(db)
    clinic = ensure_demo_clinic(db)
    doctor = ensure_demo_doctor(db)
    ensure_demo_medical_data(db)
    normalize_demo_audit_logs(db)

    return patient, clinic, doctor


def normalize_demo_audit_logs(db: Session) -> None:
    audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.patient_id == "patient_rose")
        .all()
    )
    changed = False

    for audit_log in audit_logs:
        normalized_reason = normalize_text(audit_log.reason)
        if normalized_reason != audit_log.reason:
            audit_log.reason = normalized_reason
            changed = True

    if changed:
        db.commit()


def serialize_access_request(access_request: AccessRequest) -> dict:
    return AccessRequestResponse.model_validate(access_request).model_dump(
        mode="json"
    )


def serialize_consent(consent: Consent) -> dict:
    return ConsentResponse.model_validate(consent).model_dump(mode="json")


def serialize_audit_log(audit_log: AuditLog | None) -> dict | None:
    if audit_log is None:
        return None

    return normalize_payload_text(
        AuditLogResponse.model_validate(audit_log).model_dump(mode="json")
    )


def medical_data_summary(medical_data: MedicalData) -> dict[str, str]:
    return {
        "category": medical_data.category,
        "label": normalize_text(medical_data.label),
        "sensitivity": normalize_text(medical_data.sensitivity),
    }


def get_latest_audit_log(db: Session, consent_id: str | None = None) -> AuditLog | None:
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())

    if consent_id is not None:
        query = query.filter(AuditLog.consent_id == consent_id)

    return query.first()


def create_demo_access_request(
    *,
    db: Session,
    requested_scopes: list[str],
    purpose: str,
) -> AccessRequest:
    access_request = AccessRequest(
        id=f"req_{uuid4().hex[:8]}",
        patient_id="patient_rose",
        requester_type="clinic",
        clinic_id="clinic_neurorio",
        doctor_id="doctor_ana",
        requested_scopes=requested_scopes,
        purpose=purpose,
        duration_hours=24,
        status="pending",
    )
    db.add(access_request)
    db.commit()
    db.refresh(access_request)

    return access_request


def approve_demo_consent(
    *,
    db: Session,
    access_request: AccessRequest,
    transaction_hash: str,
) -> Consent:
    return approve_consent(
        ConsentApproveRequest(
            access_request_id=access_request.id,
            allowed_scopes=["allergies", "medications"],
            transaction_hash=transaction_hash,
        ),
        db,
    )


@router.get("/overview")
def get_demo_overview(db: Session = Depends(get_db)) -> dict[str, object]:
    patient, clinic, doctor = ensure_base_demo_data(db)
    medical_data = (
        db.query(MedicalData)
        .filter(MedicalData.patient_id == "patient_rose")
        .order_by(MedicalData.category)
        .all()
    )
    last_audit_log = get_latest_audit_log(db)

    return normalize_payload_text({
        "project": "Elo.me",
        "description": (
            "Prontuário médico portátil com consentimento verificável, "
            "privacidade seletiva e auditoria."
        ),
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "role": patient.role,
        },
        "clinic": {
            "id": clinic.id,
            "name": clinic.name,
            "authorized": clinic.authorized,
            "licenseStatus": clinic.license_status,
        },
        "doctor": {
            "id": doctor.id,
            "name": doctor.name,
            "authorized": doctor.authorized,
            "crmStatus": doctor.crm_status,
        },
        "medicalDataCategories": [
            medical_data_summary(item) for item in medical_data
        ],
        "lastAuditLog": serialize_audit_log(last_audit_log),
        "availableFlows": ["authorized", "denied"],
    })


@router.post("/run-authorized-flow", status_code=status.HTTP_201_CREATED)
def run_authorized_flow(db: Session = Depends(get_db)) -> dict[str, object]:
    ensure_base_demo_data(db)
    access_request = create_demo_access_request(
        db=db,
        requested_scopes=["allergies", "medications", "special_needs"],
        purpose="Consulta neurológica",
    )
    consent = approve_demo_consent(
        db=db,
        access_request=access_request,
        transaction_hash="0xmocked-authorized-demo",
    )
    external_validation = validate_external_access(
        clinic_id="clinic_neurorio",
        doctor_id="doctor_ana",
        consent_id=consent.id,
        requested_scopes="allergies,medications",
        db=db,
    )
    audit_log = get_latest_audit_log(db, consent.id)
    authorized_medical_data = (
        db.query(MedicalData)
        .filter(MedicalData.patient_id == consent.patient_id)
        .filter(MedicalData.category.in_(consent.allowed_scopes))
        .order_by(MedicalData.category)
        .all()
    )

    return normalize_payload_text({
        "flow": "authorized",
        "message": "Fluxo autorizado executado com sucesso.",
        "accessRequest": serialize_access_request(access_request),
        "consent": serialize_consent(consent),
        "externalValidation": external_validation,
        "authorizedMedicalData": [
            medical_data_summary(item) for item in authorized_medical_data
        ],
        "auditLog": serialize_audit_log(audit_log),
    })


@router.post("/run-denied-flow", status_code=status.HTTP_201_CREATED)
def run_denied_flow(db: Session = Depends(get_db)) -> dict[str, object]:
    ensure_base_demo_data(db)
    access_request = create_demo_access_request(
        db=db,
        requested_scopes=["allergies", "medications", "recent_exams"],
        purpose="Consulta neurológica com tentativa de acesso ampliado",
    )
    consent = approve_demo_consent(
        db=db,
        access_request=access_request,
        transaction_hash="0xmocked-denied-demo",
    )
    external_validation = validate_external_access(
        clinic_id="clinic_neurorio",
        doctor_id="doctor_ana",
        consent_id=consent.id,
        requested_scopes="allergies,recent_exams",
        db=db,
    )
    audit_log = get_latest_audit_log(db, consent.id)
    blocked_scopes = [
        scope
        for scope in external_validation["requestedScopes"]
        if scope not in external_validation["allowedScopes"]
    ]

    return normalize_payload_text({
        "flow": "denied",
        "message": "Fluxo negado executado com sucesso.",
        "accessRequest": serialize_access_request(access_request),
        "consent": serialize_consent(consent),
        "externalValidation": external_validation,
        "blockedScopes": blocked_scopes,
        "auditLog": serialize_audit_log(audit_log),
    })


@router.post("/reset-local-demo-data")
def reset_local_demo_data(db: Session = Depends(get_db)) -> dict[str, object]:
    deleted_audit_logs = db.query(AuditLog).delete(synchronize_session=False)
    deleted_consents = db.query(Consent).delete(synchronize_session=False)
    deleted_access_requests = db.query(AccessRequest).delete(
        synchronize_session=False
    )
    db.commit()

    return {
        "message": "Demo data reset successfully.",
        "deleted": {
            "auditLogs": deleted_audit_logs,
            "consents": deleted_consents,
            "accessRequests": deleted_access_requests,
        },
    }
