from typing import Literal

from pydantic import BaseModel


class RootResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str


class CircleStatusResponse(BaseModel):
    configured: bool
    base_url: str
    auth_checked: bool
    auth_ok: bool
    status_code: int | None
    endpoint_used: str | None
    request_url: str | None = None
    request_headers: dict[str, str] | None = None
    response_body: str | None = None
    message: str


class CircleWalletsStatusResponse(BaseModel):
    ready: bool
    mode: Literal["mock"]
    message: str


class CircleDeployRequest(BaseModel):
    wallet: str
    contract_type: str
    name: str | None = None
    description: str | None = None


class CircleDeployResponse(BaseModel):
    success: bool
    mode: Literal["mock"]
    message: str
    idempotency_key: str
    wallet: str
    contract_type: str
    next_step: str


class CircleWalletCreateRequest(BaseModel):
    owner_wallet: str
    wallet_type: str


class CircleWalletCreateResponse(BaseModel):
    success: bool
    mode: Literal["mock"]
    message: str
    idempotency_key: str
    owner_wallet: str
    wallet_type: str
    circle_wallet_id: str | None
    circle_wallet_address: str | None
    next_step: str


class GasSponsorshipStatusResponse(BaseModel):
    ready: bool
    mode: Literal["mock"]
    message: str
    supported_actions: list[str]


class GasSponsorshipEstimateRequest(BaseModel):
    wallet: str
    action: str


class GasSponsorshipEstimateResponse(BaseModel):
    success: bool
    mode: Literal["mock"]
    wallet: str
    action: str
    sponsored: bool
    estimated_gas_usdc: str | None
    message: str
