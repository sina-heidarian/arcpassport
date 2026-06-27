from fastapi import APIRouter

from app.http_errors import raise_bad_request
from app.schemas import (
    CircleDeployRequest,
    CircleDeployResponse,
    CircleStatusResponse,
    CircleWalletCreateRequest,
    CircleWalletCreateResponse,
    CircleWalletsStatusResponse,
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

router = APIRouter(tags=["Circle Blueprints"])


@router.get(
    "/circle/status",
    response_model=CircleStatusResponse,
    summary="Circle configuration status",
    description="Report whether backend-only Circle API configuration is present without exposing secrets.",
)
def circle_status():
    return get_circle_status()


@router.post(
    "/circle/contracts/deploy",
    response_model=CircleDeployResponse,
    summary="Prepare mock Circle contract deploy",
    description="Validate and return a mock Circle Contracts deployment preparation response.",
)
def prepare_circle_contract_deploy(payload: CircleDeployRequest):
    try:
        return prepare_contract_deploy(
            wallet=payload.wallet,
            contract_type=payload.contract_type,
        )
    except ValueError as error:
        raise_bad_request(error)


@router.get(
    "/circle/wallets/status",
    response_model=CircleWalletsStatusResponse,
    summary="Circle Wallets blueprint status",
    description="Return mock readiness status for future Circle Wallets integration.",
)
def circle_wallets_status():
    return get_wallets_status()


@router.post(
    "/circle/wallets/create",
    response_model=CircleWalletCreateResponse,
    summary="Prepare mock Circle wallet create",
    description="Validate and return a mock Circle Wallets creation preparation response.",
)
def prepare_circle_wallet_create(payload: CircleWalletCreateRequest):
    try:
        return prepare_wallet_create(
            owner_wallet=payload.owner_wallet,
            wallet_type=payload.wallet_type,
        )
    except ValueError as error:
        raise_bad_request(error)


@router.get(
    "/circle/paymaster/status",
    response_model=GasSponsorshipStatusResponse,
    summary="Paymaster blueprint status",
    description="Return mock readiness status for future gas sponsorship support.",
)
def circle_paymaster_status():
    return get_paymaster_status()


@router.post(
    "/circle/paymaster/estimate",
    response_model=GasSponsorshipEstimateResponse,
    summary="Prepare mock gas sponsorship estimate",
    description="Validate and return a mock paymaster estimate response.",
)
def estimate_circle_paymaster(payload: GasSponsorshipEstimateRequest):
    try:
        return estimate_gas_sponsorship(
            wallet=payload.wallet,
            action=payload.action,
        )
    except ValueError as error:
        raise_bad_request(error)
