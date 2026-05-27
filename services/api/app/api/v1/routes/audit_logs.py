from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse


router = APIRouter()


@router.get("/audit-logs", response_model=list[AuditLogResponse])
def list_audit_logs(db: Session = Depends(get_db)) -> list[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()


@router.get(
    "/patients/{patient_id}/audit-logs",
    response_model=list[AuditLogResponse],
)
def list_patient_audit_logs(
    patient_id: str,
    db: Session = Depends(get_db),
) -> list[AuditLog]:
    return (
        db.query(AuditLog)
        .filter(AuditLog.patient_id == patient_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


@router.get("/audit-logs/{audit_log_id}", response_model=AuditLogResponse)
def get_audit_log(
    audit_log_id: str,
    db: Session = Depends(get_db),
) -> AuditLog:
    audit_log = db.get(AuditLog, audit_log_id)

    if audit_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    return audit_log
