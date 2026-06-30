import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.error_handlers import register_error_handlers
from app.logging_config import configure_logging
from app.routers import (
    circle,
    deployments,
    health,
    leaderboard,
    passport,
    quests,
    stats,
    sync,
)
from app.startup import initialize_backend

API_V1_PREFIX = "/api/v1"

configure_logging(settings.log_level)

logger = logging.getLogger(__name__)

initialize_backend()

app = FastAPI(
    title="ArcPassport API",
    description="Backend API for ArcPassport builder identity, XP, quests, deployments, and Circle integrations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)


def include_api_router(router):
    app.include_router(router, prefix=API_V1_PREFIX)
    app.include_router(router, include_in_schema=False)


include_api_router(passport.router)
include_api_router(leaderboard.router)
include_api_router(stats.router)
include_api_router(deployments.router)
include_api_router(circle.router)
include_api_router(quests.router)
include_api_router(sync.router)
app.include_router(health.router)

logger.info("ArcPassport API startup complete")
