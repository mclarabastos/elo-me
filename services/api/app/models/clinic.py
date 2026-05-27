from sqlalchemy import Boolean, Column, DateTime, String

from app.core.time import utc_now
from app.db.database import Base


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    cnpj = Column(String, nullable=True)
    authorized = Column(Boolean, default=True)
    license_status = Column(String, default="active")
    risk_level = Column(String, default="low")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )
