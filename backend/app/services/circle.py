import os
import uuid


DEFAULT_CIRCLE_BASE_URL = "https://api-sandbox.circle.com"
SUPPORTED_CIRCLE_CONTRACT_TYPES = {"counter", "erc20", "erc721"}
SUPPORTED_CIRCLE_WALLET_TYPES = {"developer", "user"}
SUPPORTED_GAS_SPONSORSHIP_ACTIONS = ["deploy_contract", "mint_passport", "checkin"]


def get_circle_base_url():
    return os.getenv("CIRCLE_BASE_URL", DEFAULT_CIRCLE_BASE_URL)


def is_circle_configured():
    return bool(os.getenv("CIRCLE_API_KEY"))


def get_circle_status():
    configured = is_circle_configured()

    return {
        "configured": configured,
        "base_url": get_circle_base_url(),
        "message": (
            "Circle API key configured"
            if configured
            else "Circle API key missing"
        ),
    }


def get_circle_headers():
    api_key = os.getenv("CIRCLE_API_KEY")

    if not api_key:
        raise RuntimeError("CIRCLE_API_KEY is not configured")

    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def generate_idempotency_key():
    return str(uuid.uuid4())


def prepare_contract_deploy(wallet: str, contract_type: str):
    original_contract_type = contract_type
    contract_type = contract_type.lower()

    if contract_type not in SUPPORTED_CIRCLE_CONTRACT_TYPES:
        supported_types = ", ".join(sorted(SUPPORTED_CIRCLE_CONTRACT_TYPES))
        raise ValueError(
            f"Unsupported contract_type '{original_contract_type}'. "
            f"Supported values: {supported_types}"
        )

    return {
        "success": True,
        "mode": "mock",
        "message": "Circle contract deployment prepared",
        "idempotency_key": generate_idempotency_key(),
        "wallet": wallet,
        "contract_type": contract_type,
        "next_step": "Add Circle Contracts API call when API key is configured",
    }


def prepare_wallet_create(owner_wallet: str, wallet_type: str):
    original_wallet_type = wallet_type
    wallet_type = wallet_type.lower()

    if wallet_type not in SUPPORTED_CIRCLE_WALLET_TYPES:
        supported_types = ", ".join(sorted(SUPPORTED_CIRCLE_WALLET_TYPES))
        raise ValueError(
            f"Unsupported wallet_type '{original_wallet_type}'. "
            f"Supported values: {supported_types}"
        )

    return {
        "success": True,
        "mode": "mock",
        "message": "Circle wallet creation prepared",
        "idempotency_key": generate_idempotency_key(),
        "owner_wallet": owner_wallet,
        "wallet_type": wallet_type,
        "circle_wallet_id": None,
        "circle_wallet_address": None,
        "next_step": "Add Circle Wallets API call when API key is configured",
    }


def get_wallets_status():
    return {
        "ready": True,
        "mode": "mock",
        "message": "Circle Wallets blueprint is ready",
    }


def get_paymaster_status():
    return {
        "ready": True,
        "mode": "mock",
        "message": "Paymaster blueprint is ready",
        "supported_actions": SUPPORTED_GAS_SPONSORSHIP_ACTIONS,
    }


def estimate_gas_sponsorship(wallet: str, action: str):
    original_action = action
    action = action.lower()

    if action not in SUPPORTED_GAS_SPONSORSHIP_ACTIONS:
        supported_actions = ", ".join(SUPPORTED_GAS_SPONSORSHIP_ACTIONS)
        raise ValueError(
            f"Unsupported action '{original_action}'. "
            f"Supported values: {supported_actions}"
        )

    return {
        "success": True,
        "mode": "mock",
        "wallet": wallet,
        "action": action,
        "sponsored": False,
        "estimated_gas_usdc": None,
        "message": (
            "Gas sponsorship estimate prepared. Real Paymaster integration "
            "will be added later."
        ),
    }


def list_wallets():
    # Placeholder for future Circle Wallets API integration.
    raise NotImplementedError("Circle Wallets API integration is planned for V2")


def list_contracts():
    # Placeholder for future Circle Contracts API integration.
    raise NotImplementedError("Circle Contracts API integration is planned for V2")


def deploy_contract_placeholder():
    # Placeholder for future backend-only Circle contract deployment flow.
    raise NotImplementedError("Circle contract deployment is planned for V2")
