from fastapi import APIRouter, HTTPException

from app.schemas import (
    CircleDeployRequest,
    CircleDeployResponse,
    CircleWalletCreateRequest,
    CircleWalletCreateResponse,
    GasSponsorshipEstimateRequest,
    GasSponsorshipEstimateResponse,
    GasSponsorshipStatusResponse,
)
from app.services.circle import (
    estimate_gas_sponsorship,
    get_circle_status,
    get_paymaster_status,
    get_wallets_status,
    prepare_contract_deploy,
    prepare_wallet_create,
)

router = APIRouter()


def bad_request_from_value_error(error: ValueError):
    raise HTTPException(status_code=400, detail=str(error))


@router.get("/circle/status")
def circle_status():
    return get_circle_status()


@router.post("/circle/contracts/deploy", response_model=CircleDeployResponse)
def prepare_circle_contract_deploy(payload: CircleDeployRequest):
    try:
        return prepare_contract_deploy(
            wallet=payload.wallet,
            contract_type=payload.contract_type,
        )
    except ValueError as error:
        bad_request_from_value_error(error)


@router.get("/circle/wallets/status")
def circle_wallets_status():
    return get_wallets_status()


@router.post("/circle/wallets/create", response_model=CircleWalletCreateResponse)
def prepare_circle_wallet_create(payload: CircleWalletCreateRequest):
    try:
        return prepare_wallet_create(
            owner_wallet=payload.owner_wallet,
            wallet_type=payload.wallet_type,
        )
    except ValueError as error:
        bad_request_from_value_error(error)


@router.get("/circle/paymaster/status", response_model=GasSponsorshipStatusResponse)
def circle_paymaster_status():
    return get_paymaster_status()


@router.post(
    "/circle/paymaster/estimate",
    response_model=GasSponsorshipEstimateResponse,
)
def estimate_circle_paymaster(payload: GasSponsorshipEstimateRequest):
    try:
        return estimate_gas_sponsorship(
            wallet=payload.wallet,
            action=payload.action,
        )
    except ValueError as error:
        bad_request_from_value_error(error)
