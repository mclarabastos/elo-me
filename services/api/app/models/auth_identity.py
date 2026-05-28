from sqlalchemy import Column, DateTime, String, UniqueConstraint

from app.core.time import utc_now
from app.db.database import Base


class AuthIdentity(Base):
    __tablename__ = "auth_identities"
    __table_args__ = (
        UniqueConstraint(
            "provider",
            "provider_user_id",
            name="uq_auth_identities_provider_user_id",
        ),
    )

    id = Column(String, primary_key=True)
    provider = Column(String, nullable=False, index=True)
    provider_user_id = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    wallet_address = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, default="patient")
    display_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )
