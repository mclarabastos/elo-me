from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.routes.demo import ensure_base_demo_data
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.clinic import Clinic
from app.models.consent import Consent
from app.models.doctor import Doctor
from app.models.medical_data import MedicalData


router = APIRouter()

RECOMMENDED_SCOPES = {"allergies", "medications"}


def get_demo_medical_data(db: Session) -> list[MedicalData]:
    return (
        db.query(MedicalData)
        .filter(MedicalData.patient_id == "patient_rose")
        .order_by(MedicalData.category)
        .all()
    )


def medical_data_category_item(medical_data: MedicalData) -> dict[str, object]:
    return {
        "id": medical_data.id,
        "category": medical_data.category,
        "label": medical_data.label,
        "sensitivity": medical_data.sensitivity,
        "available": True,
    }


def shareable_scope_item(medical_data: MedicalData) -> dict[str, object]:
    return {
        "category": medical_data.category,
        "label": medical_data.label,
        "sensitivity": medical_data.sensitivity,
        "recommended": medical_data.category in RECOMMENDED_SCOPES,
    }


def get_scope_label_map(db: Session) -> dict[str, str]:
    return {
        item.category: item.label
        for item in db.query(MedicalData)
        .filter(MedicalData.patient_id == "patient_rose")
        .all()
    }


def format_scope_list(scopes: list[str], label_map: dict[str, str]) -> str:
    labels = [label_map.get(scope, scope) for scope in scopes]

    if not labels:
        return "dados médicos"

    if len(labels) == 1:
        return labels[0]

    return f"{', '.join(labels[:-1])} e {labels[-1]}"


def audit_log_item(db: Session, audit_log: AuditLog) -> dict[str, object]:
    clinic = db.get(Clinic, audit_log.clinic_id)
    doctor = db.get(Doctor, audit_log.doctor_id)
    label_map = get_scope_label_map(db)
    scope_text = format_scope_list(audit_log.requested_scopes, label_map)
    clinic_name = clinic.name if clinic is not None else audit_log.clinic_id
    doctor_name = doctor.name if doctor is not None else audit_log.doctor_id
    action = "acessou" if audit_log.decision == "AUTHORIZED" else "tentou acessar"

    return {
        "id": audit_log.id,
        "title": f"{clinic_name} {action} {scope_text}",
        "decision": audit_log.decision,
        "statusLabel": (
            "Autorizado" if audit_log.decision == "AUTHORIZED" else "Negado"
        ),
        "clinicName": clinic_name,
        "doctorName": doctor_name,
        "requestedScopes": audit_log.requested_scopes,
        "createdAt": audit_log.created_at,
    }


@router.get("/patient-dashboard")
def get_patient_dashboard(db: Session = Depends(get_db)) -> dict[str, object]:
    patient, clinic, doctor = ensure_base_demo_data(db)
    medical_data = get_demo_medical_data(db)
    active_consents_count = (
        db.query(Consent)
        .filter(Consent.patient_id == patient.id)
        .filter(Consent.status == "active")
        .filter(Consent.expires_at > datetime.utcnow())
        .count()
    )
    recent_audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.patient_id == patient.id)
        .order_by(AuditLog.created_at.desc())
        .limit(5)
        .all()
    )
    recent_access_count = (
        db.query(AuditLog).filter(AuditLog.patient_id == patient.id).count()
    )

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "role": patient.role,
            "identityVerified": True,
        },
        "summary": {
            "medicalDataCount": len(medical_data),
            "activeConsentsCount": active_consents_count,
            "recentAccessCount": recent_access_count,
        },
        "medicalDataCategories": [
            medical_data_category_item(item) for item in medical_data
        ],
        "recentActivity": [
            audit_log_item(db, audit_log) for audit_log in recent_audit_logs
        ],
        "quickActions": [
            {
                "label": "Compartilhar dados",
                "action": "start_share_flow",
            },
            {
                "label": "Ver auditoria",
                "action": "view_audit_logs",
            },
        ],
    }


@router.get("/share-flow")
def get_share_flow(db: Session = Depends(get_db)) -> dict[str, object]:
    patient, clinic, doctor = ensure_base_demo_data(db)
    medical_data = get_demo_medical_data(db)

    return {
        "patientId": patient.id,
        "availableClinic": {
            "id": clinic.id,
            "name": clinic.name,
            "authorized": clinic.authorized,
            "licenseStatus": clinic.license_status,
        },
        "availableDoctor": {
            "id": doctor.id,
            "name": doctor.name,
            "authorized": doctor.authorized,
            "crmStatus": doctor.crm_status,
        },
        "shareableScopes": [
            shareable_scope_item(item) for item in medical_data
        ],
        "defaultPurpose": "Consulta neurológica",
        "defaultDurationHours": 24,
    }


@router.get("/audit-timeline")
def get_audit_timeline(db: Session = Depends(get_db)) -> dict[str, object]:
    ensure_base_demo_data(db)
    audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.patient_id == "patient_rose")
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    return {
        "patientId": "patient_rose",
        "items": [audit_log_item(db, audit_log) for audit_log in audit_logs],
    }


@router.get("/cre-status")
def get_cre_status() -> dict[str, object]:
    return {
        "system": "Elo.me CRE Readiness",
        "items": [
            {
                "name": "Backend API",
                "status": "online",
                "description": "API FastAPI operacional",
            },
            {
                "name": "External Validation API",
                "status": "ready",
                "description": "Endpoint pronto para consumo pelo Chainlink CRE",
            },
            {
                "name": "Consent Verification",
                "status": "ready",
                "description": "Consentimentos seletivos podem ser verificados",
            },
            {
                "name": "Audit Logs",
                "status": "ready",
                "description": "Validações geram registros de auditoria",
            },
        ],
        "mainCreEndpoint": "/external/access/validate",
    }
