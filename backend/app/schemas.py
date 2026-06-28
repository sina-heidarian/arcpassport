from typing import Literal

from pydantic import BaseModel


class RootResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str


class HealthReadyResponse(BaseModel):
    database: bool
    circle: bool
    ready: bool


class PassportNftAttribute(BaseModel):
    trait_type: str
    value: str | int


class PassportNftMetadataResponse(BaseModel):
    name: str
    description: str
    image: str
    external_url: str
    attributes: list[PassportNftAttribute]


class PassportNftRequirement(BaseModel):
    label: str
    met: bool
    current: int
    target: int


class PassportNftEligibilityResponse(BaseModel):
    eligible: bool
    reason: str
    requirements: list[PassportNftRequirement]


class PassportNftStatusResponse(BaseModel):
    configured: bool
    contract_address: str | None
    network: str
    explorer_url: str | None


class PassportNftContractInfoResponse(BaseModel):
    name: str | None
    symbol: str | None
    owner: str | None
    totalSupply: int | None
    contract_address: str
    network: str
    explorer_url: str


class PassportNftOwnershipResponse(BaseModel):
    wallet: str
    owns_passport: bool
    token_id: int | None
    token_uri: str | None
    contract_address: str
    explorer_url: str


class PassportNftTokenUriResponse(BaseModel):
    wallet: str
    token_uri: str


class PassportNftMintResponse(BaseModel):
    success: bool
    wallet: str
    tx_hash: str | None
    receipt_tx_hash: str | None = None
    block_number: int | None = None
    contract_address: str
    token_id: int | None
    token_uri: str | None
    explorer_url: str
    already_minted: bool = False
    message: str


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


class CircleWallet(BaseModel):
    id: str | None = None
    state: str | None = None
    walletSetId: str | None = None
    custodyType: str | None = None
    address: str | None = None
    blockchain: str | None = None
    accountType: str | None = None
    createDate: str | None = None
    updateDate: str | None = None
    scaCore: str | None = None


class CircleWalletsListResponse(BaseModel):
    success: bool
    mode: Literal["real"]
    wallets: list[CircleWallet]


class CircleContract(BaseModel):
    id: str | None = None
    name: str | None = None
    description: str | None = None
    contractAddress: str | None = None
    blockchain: str | None = None
    deployerAddress: str | None = None
    status: str | None = None
    updateDate: str | None = None
    createDate: str | None = None


class CircleContractsListResponse(BaseModel):
    success: bool
    mode: Literal["real"]
    contracts: list[CircleContract]


class CircleContractImportRequest(BaseModel):
    wallet: str
    contract_id: str


class CircleContractImportResponse(BaseModel):
    success: bool
    imported: bool
    message: str
    deployment: dict


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
