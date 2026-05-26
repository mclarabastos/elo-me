from fastapi import APIRouter

from app.api.v1.routes import access_requests
from app.api.v1.routes import clinics, doctors, patients
from app.api.v1.routes import users


api_router = APIRouter()

api_router.include_router(clinics.router, prefix="/clinics", tags=["clinics"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(
    access_requests.router,
    prefix="/access-requests",
    tags=["access-requests"],
)
api_router.include_router(users.router, prefix="/users", tags=["users"])


@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "elo-me-api",
    }
