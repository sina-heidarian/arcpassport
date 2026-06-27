import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.http_errors import raise_bad_request
from app.services.passport import (
    build_passport_response,
    daily_checkin,
    prepare_passport_mint,
    update_passport_profile,
)

router = APIRouter(tags=["Passport"])
logger = logging.getLogger(__name__)


@router.get(
    "/passport/{wallet}",
    summary="Get builder passport",
    description="Return XP, reputation, achievements, quests XP, and recent Arc activity for a wallet.",
)
def get_passport(wallet: str, db: Session = Depends(get_db)):
    try:
        return build_passport_response(db, wallet)
    except Exception as error:
        logger.exception("Failed to build passport wallet=%s", wallet)
        raise HTTPException(status_code=500, detail="Failed to load passport")


@router.patch(
    "/passport/{wallet}/profile",
    summary="Update passport profile",
    description="Update public profile fields for a wallet passport.",
)
def patch_passport_profile(
    wallet: str,
    payload: dict,
    db: Session = Depends(get_db),
):
    try:
        return update_passport_profile(db, wallet, payload)
    except ValueError as error:
        raise_bad_request(error)


@router.post(
    "/passport/{wallet}/mint",
    summary="Prepare passport mint",
    description="Return mock Builder Passport NFT metadata for future minting.",
)
def post_passport_mint(wallet: str, db: Session = Depends(get_db)):
    try:
        return prepare_passport_mint(db, wallet)
    except Exception as error:
        logger.exception("Failed to prepare passport mint wallet=%s", wallet)
        raise HTTPException(status_code=500, detail="Failed to prepare passport mint")


@router.post(
    "/checkin/{wallet}",
    summary="Daily check-in",
    description="Claim daily check-in XP and update streak state.",
)
def post_daily_checkin(wallet: str, db: Session = Depends(get_db)):
    return daily_checkin(db, wallet)
