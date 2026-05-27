from sqlalchemy import Column, DateTime, JSON, String

from app.core.time import utc_now
from app.db.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True)
    patient_id = Column(String, nullable=True)
    clinic_id = Column(String, nullable=True)
    doctor_id = Column(String, nullable=True)
    consent_id = Column(String, nullable=True)
    requested_scopes = Column(JSON, nullable=False)
    decision = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    validated_by = Column(String, default="external-api-for-chainlink-cre")
    created_at = Column(DateTime(timezone=True), default=utc_now)
