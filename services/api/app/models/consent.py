from sqlalchemy import Column, DateTime, ForeignKey, JSON, String

from app.core.time import utc_now
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
    expires_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False, default="active")
    transaction_hash = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )
