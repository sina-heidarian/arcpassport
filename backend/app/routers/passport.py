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
from app.schemas import (
    PassportNftEligibilityResponse,
    PassportNftMetadataResponse,
)
from app.services.passport_nft import (
    build_passport_nft_eligibility,
    build_passport_nft_metadata,
)

router = APIRouter(tags=["Passport"])
logger = logging.getLogger(__name__)


@router.get(
    "/passport/{wallet}",
    response_model=dict,
    summary="Get builder passport",
    description="Return XP, reputation, achievements, quests XP, and recent Arc activity for a wallet.",
)
def get_passport(wallet: str, db: Session = Depends(get_db)):
    try:
        return build_passport_response(db, wallet)
    except Exception as error:
        logger.exception("Failed to build passport wallet=%s", wallet)
        raise HTTPException(status_code=500, detail="Failed to load passport")


@router.get(
    "/passport/{wallet}/metadata",
    response_model=PassportNftMetadataResponse,
    summary="Get Builder Passport NFT metadata",
    description="Return read-only Soulbound Builder Passport NFT metadata preview for a wallet.",
)
def get_passport_metadata(wallet: str, db: Session = Depends(get_db)):
    try:
        return build_passport_nft_metadata(db, wallet)
    except Exception:
        logger.exception("Failed to build passport NFT metadata wallet=%s", wallet)
        raise HTTPException(status_code=500, detail="Failed to load passport metadata")


@router.get(
    "/passport/{wallet}/eligibility",
    response_model=PassportNftEligibilityResponse,
    summary="Get Builder Passport NFT eligibility",
    description="Return read-only mint readiness checks for the future Soulbound Builder Passport NFT.",
)
def get_passport_eligibility(wallet: str, db: Session = Depends(get_db)):
    try:
        return build_passport_nft_eligibility(db, wallet)
    except Exception:
        logger.exception("Failed to build passport NFT eligibility wallet=%s", wallet)
        raise HTTPException(status_code=500, detail="Failed to load passport eligibility")


@router.patch(
    "/passport/{wallet}/profile",
    response_model=dict,
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
    response_model=dict,
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
    response_model=dict,
    summary="Daily check-in",
    description="Claim daily check-in XP and update streak state.",
)
def post_daily_checkin(wallet: str, db: Session = Depends(get_db)):
    return daily_checkin(db, wallet)
