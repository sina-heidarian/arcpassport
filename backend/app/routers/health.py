from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine
from app.schemas import HealthReadyResponse, HealthResponse, RootResponse
from app.services.circle import is_circle_configured

router = APIRouter(tags=["Health"])


@router.get(
    "/",
    response_model=RootResponse,
    summary="API root",
    description="Health-neutral root response.",
)
def root():
    return {"message": "ArcPassport API running"}


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="API health check",
    description="Container health endpoint.",
)
def health():
    return {"status": "ok"}


@router.get(
    "/health/ready",
    response_model=HealthReadyResponse,
    summary="API readiness check",
    description="Check database connectivity and backend-only Circle configuration.",
)
def readiness():
    database_ready = check_database()
    circle_ready = is_circle_configured()

    return {
        "database": database_ready,
        "circle": circle_ready,
        "ready": database_ready and circle_ready,
    }


def check_database():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
