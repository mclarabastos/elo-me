from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String

from app.db.database import Base


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    requester_type = Column(String, nullable=False)
    clinic_id = Column(String, ForeignKey("clinics.id"), nullable=True)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=True)
    requested_scopes = Column(JSON, nullable=False)
    purpose = Column(String, nullable=False)
    duration_hours = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
