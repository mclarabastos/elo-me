from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.access_request import AccessRequest
from app.models.medical_data import MedicalData
from app.models.user import User
from app.schemas.access_request import AccessRequestResponse
from app.schemas.medical_data import MedicalDataResponse


router = APIRouter()


DEMO_MEDICAL_DATA = [
    {
        "id": "data_identification",
        "category": "identification",
        "label": "Identificação básica",
        "sensitivity": "low",
        "encrypted_payload": "encrypted::identification::Roseane Carreiro",
    },
    {
        "id": "data_allergies",
        "category": "allergies",
        "label": "Alergias",
        "sensitivity": "medium",
        "encrypted_payload": "encrypted::allergies::Alergia fictícia a dipirona",
    },
    {
        "id": "data_medications",
        "category": "medications",
        "label": "Medicamentos em uso",
        "sensitivity": "medium",
        "encrypted_payload": "encrypted::medications::Medicamento fictício de uso contínuo",
    },
    {
        "id": "data_recent_exams",
        "category": "recent_exams",
        "label": "Exames recentes",
        "sensitivity": "high",
        "encrypted_payload": "encrypted::recent_exams::Exame neurológico fictício",
    },
    {
        "id": "data_special_needs",
        "category": "special_needs",
        "label": "Necessidades especiais",
        "sensitivity": "medium",
        "encrypted_payload": "encrypted::special_needs::Informação fictícia de acessibilidade",
    },
    {
        "id": "data_emergency_contact",
        "category": "emergency_contact",
        "label": "Contato de emergência",
        "sensitivity": "low",
        "encrypted_payload": "encrypted::emergency_contact::Contato fictício",
    },
]


def ensure_demo_patient(db: Session) -> User:
    demo_patient = db.get(User, "patient_rose")

    if demo_patient is None:
        demo_patient = User(
            id="patient_rose",
            name="Roseane Carreiro",
            email="roseane@demo.elome",
            role="patient",
            wallet_address="0x0000000000000000000000000000000000000001",
        )
        db.add(demo_patient)
        db.commit()
        db.refresh(demo_patient)

    return demo_patient


def ensure_demo_medical_data(db: Session) -> None:
    ensure_demo_patient(db)

    for item in DEMO_MEDICAL_DATA:
        encrypted_payload = item["encrypted_payload"]
        data_hash = sha256(encrypted_payload.encode("utf-8")).hexdigest()
        medical_data = db.get(MedicalData, item["id"])

        if medical_data is not None:
            medical_data.patient_id = "patient_rose"
            medical_data.category = item["category"]
            medical_data.label = item["label"]
            medical_data.encrypted_payload = encrypted_payload
            medical_data.data_hash = data_hash
            medical_data.sensitivity = item["sensitivity"]
            continue

        db.add(
            MedicalData(
                id=item["id"],
                patient_id="patient_rose",
                category=item["category"],
                label=item["label"],
                encrypted_payload=encrypted_payload,
                data_hash=data_hash,
                sensitivity=item["sensitivity"],
            )
        )

    db.commit()


@router.get("/{patient_id}/medical-data", response_model=list[MedicalDataResponse])
def get_patient_medical_data(
    patient_id: str,
    db: Session = Depends(get_db),
) -> list[MedicalData]:
    if patient_id == "patient_rose":
        ensure_demo_medical_data(db)

    return (
        db.query(MedicalData)
        .filter(MedicalData.patient_id == patient_id)
        .order_by(MedicalData.id)
        .all()
    )


@router.get(
    "/{patient_id}/access-requests",
    response_model=list[AccessRequestResponse],
)
def get_patient_access_requests(
    patient_id: str,
    db: Session = Depends(get_db),
) -> list[AccessRequest]:
    patient = db.get(User, patient_id)

    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return (
        db.query(AccessRequest)
        .filter(AccessRequest.patient_id == patient_id)
        .order_by(AccessRequest.created_at.desc())
        .all()
    )
