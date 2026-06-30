import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas import SyncResponse, SyncStatusResponse
from app.services.sync_engine import (
    get_sync_status_response,
    sync_wallet_activity,
)

router = APIRouter(tags=["Sync"])
logger = logging.getLogger(__name__)


@router.post(
    "/sync/{wallet}",
    response_model=SyncResponse,
    summary="Synchronize Arc builder activity",
    description="Fetch latest Arc Testnet activity for a wallet, update sync cache, and return recalculated builder progress.",
)
def post_sync_wallet(wallet: str, db: Session = Depends(get_db)):
    logger.info("Sync requested wallet=%s", wallet)
    return sync_wallet_activity(db, wallet)


@router.get(
    "/sync/{wallet}/status",
    response_model=SyncStatusResponse,
    summary="Get wallet sync status",
    description="Return last Arc activity sync timestamp and latest known block for a wallet.",
)
def get_sync_status(wallet: str, db: Session = Depends(get_db)):
    return get_sync_status_response(db, wallet)
