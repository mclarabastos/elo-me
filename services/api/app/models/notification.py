from sqlalchemy import Column, DateTime, String

from app.core.time import utc_now
from app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    recipient_identity_id = Column(String, nullable=False, index=True)
    recipient_role = Column(String, nullable=False)
    patient_id = Column(String, nullable=True, index=True)
    clinic_id = Column(String, nullable=True)
    doctor_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="unread")
    related_access_request_id = Column(String, nullable=True, index=True)
    channel = Column(String, nullable=False, default="platform")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    read_at = Column(DateTime(timezone=True), nullable=True)
