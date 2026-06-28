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
    PassportNftContractInfoResponse,
    PassportNftMetadataResponse,
    PassportNftOwnershipResponse,
    PassportNftStatusResponse,
    PassportNftTokenUriResponse,
    PassportNftMintResponse,
)
from app.services.passport_nft import (
    PassportNftMintError,
    PassportNftReadError,
    build_passport_nft_eligibility,
    build_passport_nft_metadata,
    build_passport_nft_token_uri,
    get_passport_nft_contract_info,
    get_passport_nft_ownership,
    get_passport_nft_status as build_passport_nft_status,
    mint_passport_nft,
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
    "/passport/{wallet}/token-uri",
    response_model=PassportNftTokenUriResponse,
    summary="Get Builder Passport NFT token URI",
    description="Return base64 data URI metadata for future ArcPassportSBT minting.",
)
def get_passport_token_uri(wallet: str, db: Session = Depends(get_db)):
    try:
        return build_passport_nft_token_uri(db, wallet)
    except Exception:
        logger.exception("Failed to build passport NFT token URI wallet=%s", wallet)
        raise HTTPException(status_code=500, detail="Failed to load passport token URI")


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


@router.get(
    "/passport-nft/status",
    response_model=PassportNftStatusResponse,
    summary="Get Builder Passport NFT contract status",
    description="Return deployed ArcPassportSBT contract registration status for Arc Testnet.",
)
def get_passport_nft_status():
    return build_passport_nft_status()


@router.get(
    "/passport-nft/contract-info",
    response_model=PassportNftContractInfoResponse,
    summary="Read Builder Passport NFT contract info",
    description="Read ArcPassportSBT name, symbol, owner, and optional totalSupply from Arc Testnet without sending transactions.",
)
def get_passport_nft_contract_info_endpoint():
    try:
        return get_passport_nft_contract_info()
    except PassportNftReadError as error:
        raise HTTPException(status_code=503, detail=str(error))


@router.get(
    "/passport-nft/{wallet}/ownership",
    response_model=PassportNftOwnershipResponse,
    summary="Read Builder Passport NFT ownership",
    description="Check whether a wallet owns an ArcPassportSBT without sending transactions.",
)
def get_passport_nft_ownership_endpoint(wallet: str):
    try:
        return get_passport_nft_ownership(wallet)
    except PassportNftReadError as error:
        raise HTTPException(status_code=503, detail=str(error))


@router.post(
    "/passport-nft/{wallet}/mint",
    response_model=PassportNftMintResponse,
    summary="Mint Builder Passport NFT",
    description="Mint ArcPassportSBT from the backend admin wallet after eligibility and ownership checks.",
)
def post_passport_nft_mint(wallet: str, db: Session = Depends(get_db)):
    try:
        return mint_passport_nft(db, wallet)
    except PassportNftMintError as error:
        message = str(error)
        status_code = 400

        if "not configured" in message or "unavailable" in message:
            status_code = 503
        if "already minted" in message.lower():
            status_code = 409

        raise HTTPException(status_code=status_code, detail=message)
    except PassportNftReadError as error:
        raise HTTPException(status_code=503, detail=str(error))


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
