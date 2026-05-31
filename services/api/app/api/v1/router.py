from fastapi import APIRouter

from app.api.v1.routes import access_requests
from app.api.v1.routes import audit_logs
from app.api.v1.routes import auth
from app.api.v1.routes import business
from app.api.v1.routes import clinics, doctors, patients
from app.api.v1.routes import consents
from app.api.v1.routes import demo
from app.api.v1.routes import external
from app.api.v1.routes import frontend
from app.api.v1.routes import integration
from app.api.v1.routes import notifications
from app.api.v1.routes import user_journey
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
api_router.include_router(audit_logs.router, tags=["audit-logs"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(business.router, prefix="/business", tags=["business"])
api_router.include_router(consents.router, prefix="/consents", tags=["consents"])
api_router.include_router(demo.router, prefix="/demo", tags=["demo"])
api_router.include_router(external.router, prefix="/external", tags=["external"])
api_router.include_router(frontend.router, prefix="/frontend", tags=["frontend"])
api_router.include_router(
    integration.router,
    prefix="/integration",
    tags=["integration"],
)
api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["notifications"],
)
api_router.include_router(
    user_journey.router,
    prefix="/user-journey",
    tags=["user-journey"],
)
api_router.include_router(users.router, prefix="/users", tags=["users"])


@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "elo-me-api",
    }
