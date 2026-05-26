from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, JSON, String

from app.db.database import Base


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String, primary_key=True)
    access_request_id = Column(
        String,
        ForeignKey("access_requests.id"),
        nullable=False,
    )
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    allowed_scopes = Column(JSON, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="active")
    transaction_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
