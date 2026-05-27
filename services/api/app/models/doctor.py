from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String

from app.core.time import utc_now
from app.db.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    crm = Column(String, nullable=False)
    authorized = Column(Boolean, default=True)
    crm_status = Column(String, default="active")
    clinic_id = Column(String, ForeignKey("clinics.id"))
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )
