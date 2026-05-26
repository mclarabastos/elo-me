from fastapi import APIRouter

from app.api.v1.routes import users


api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])


@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "elo-me-api",
    }
