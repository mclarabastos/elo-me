from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse


router = APIRouter()


@router.get("/demo", response_model=UserResponse)
def get_demo_user(db: Session = Depends(get_db)) -> User:
    demo_user = db.get(User, "patient_rose")

    if demo_user is None:
        demo_user = User(
            id="patient_rose",
            name="Roseane Carreiro",
            email="roseane@demo.elome",
            role="patient",
            wallet_address="0x0000000000000000000000000000000000000001",
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    return demo_user
