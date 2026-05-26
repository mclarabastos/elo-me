from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text

from app.db.database import Base


class MedicalData(Base):
    __tablename__ = "medical_data"

    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("users.id"))
    category = Column(String, nullable=False)
    label = Column(String, nullable=False)
    encrypted_payload = Column(Text, nullable=False)
    data_hash = Column(String, nullable=False)
    sensitivity = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
