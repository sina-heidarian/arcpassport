import os
import uuid


DEFAULT_CIRCLE_BASE_URL = "https://api-sandbox.circle.com"


def get_circle_base_url():
    return os.getenv("CIRCLE_BASE_URL", DEFAULT_CIRCLE_BASE_URL)


def is_circle_configured():
    return bool(os.getenv("CIRCLE_API_KEY"))


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


def list_wallets():
    # Placeholder for future Circle Wallets API integration.
    raise NotImplementedError("Circle Wallets API integration is planned for V2")


def list_contracts():
    # Placeholder for future Circle Contracts API integration.
    raise NotImplementedError("Circle Contracts API integration is planned for V2")


def deploy_contract_placeholder():
    # Placeholder for future backend-only Circle contract deployment flow.
    raise NotImplementedError("Circle contract deployment is planned for V2")
