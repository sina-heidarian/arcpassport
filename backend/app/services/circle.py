import logging
import uuid

import requests

from app.config import settings

logger = logging.getLogger(__name__)

SUPPORTED_CIRCLE_CONTRACT_TYPES = {"counter", "erc20", "erc721"}
SUPPORTED_CIRCLE_WALLET_TYPES = {"developer", "user"}
SUPPORTED_GAS_SPONSORSHIP_ACTIONS = ["deploy_contract", "mint_passport", "checkin"]
CIRCLE_AUTH_CHECK_ENDPOINT = "/v1/w3s/wallets"
AUTH_HEADER_REDACTION = "Bearer <redacted>"


def get_circle_base_url():
    return settings.circle_base_url


def is_circle_configured():
    return bool(settings.circle_api_key)


def check_circle_auth_status():
    """Check Circle auth with a safe non-mutating API request."""
    configured = is_circle_configured()
    base_url = get_circle_base_url()

    if not configured:
        logger.info("Circle auth status checked without API key")
        status = {
            "configured": False,
            "base_url": base_url,
            "auth_checked": False,
            "auth_ok": False,
            "status_code": None,
            "endpoint_used": CIRCLE_AUTH_CHECK_ENDPOINT,
            "message": "Circle API key missing",
        }
        return maybe_include_circle_debug(
            status,
            request_url=None,
            request_headers=None,
            response_body=None,
        )

    auth_check_url = f"{base_url.rstrip('/')}{CIRCLE_AUTH_CHECK_ENDPOINT}"
    auth_headers = get_circle_auth_headers()
    safe_auth_headers = redact_circle_headers(auth_headers)

    try:
        response = requests.get(
            auth_check_url,
            headers=auth_headers,
            timeout=10,
        )
    except requests.RequestException as error:
        logger.warning("Circle auth check network error: %s", error.__class__.__name__)
        status = {
            "configured": True,
            "base_url": base_url,
            "auth_checked": True,
            "auth_ok": False,
            "status_code": None,
            "endpoint_used": CIRCLE_AUTH_CHECK_ENDPOINT,
            "message": "Circle auth check failed due to a network error",
        }
        return maybe_include_circle_debug(
            status,
            request_url=auth_check_url,
            request_headers=safe_auth_headers,
            response_body=None,
        )

    safe_response_body = truncate_response_body(response.text)

    if response.ok:
        logger.info("Circle auth check succeeded with status=%s", response.status_code)
        status = {
            "configured": True,
            "base_url": base_url,
            "auth_checked": True,
            "auth_ok": True,
            "status_code": response.status_code,
            "endpoint_used": CIRCLE_AUTH_CHECK_ENDPOINT,
            "message": "Circle API key configured and authentication succeeded",
        }
        return maybe_include_circle_debug(
            status,
            request_url=auth_check_url,
            request_headers=safe_auth_headers,
            response_body=safe_response_body,
        )

    if response.status_code in {401, 403}:
        logger.warning("Circle auth check rejected with status=%s", response.status_code)
        status = {
            "configured": True,
            "base_url": base_url,
            "auth_checked": True,
            "auth_ok": False,
            "status_code": response.status_code,
            "endpoint_used": CIRCLE_AUTH_CHECK_ENDPOINT,
            "message": "Circle API key configured but authentication failed",
        }
        return maybe_include_circle_debug(
            status,
            request_url=auth_check_url,
            request_headers=safe_auth_headers,
            response_body=safe_response_body,
        )

    if response.status_code == 404:
        logger.warning("Circle auth check endpoint not found with status=404")
        status = {
            "configured": True,
            "base_url": base_url,
            "auth_checked": True,
            "auth_ok": False,
            "status_code": response.status_code,
            "endpoint_used": CIRCLE_AUTH_CHECK_ENDPOINT,
            "message": "Circle auth check endpoint was not found",
        }
        return maybe_include_circle_debug(
            status,
            request_url=auth_check_url,
            request_headers=safe_auth_headers,
            response_body=safe_response_body,
        )

    logger.warning("Circle auth check failed with status=%s", response.status_code)
    status = {
        "configured": True,
        "base_url": base_url,
        "auth_checked": True,
        "auth_ok": False,
        "status_code": response.status_code,
        "endpoint_used": CIRCLE_AUTH_CHECK_ENDPOINT,
        "message": "Circle auth check failed",
    }
    return maybe_include_circle_debug(
        status,
        request_url=auth_check_url,
        request_headers=safe_auth_headers,
        response_body=safe_response_body,
    )


def get_circle_status():
    status = check_circle_auth_status()
    logger.info(
        "Circle status checked: configured=%s auth_checked=%s auth_ok=%s",
        status["configured"],
        status["auth_checked"],
        status["auth_ok"],
    )
    return status


def get_circle_headers():
    api_key = settings.circle_api_key

    if not api_key:
        logger.warning("Circle headers requested without CIRCLE_API_KEY")
        raise RuntimeError("CIRCLE_API_KEY is not configured")

    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def get_circle_auth_headers():
    api_key = settings.circle_api_key

    if not api_key:
        logger.warning("Circle auth headers requested without CIRCLE_API_KEY")
        raise RuntimeError("CIRCLE_API_KEY is not configured")

    return {
        "accept": "application/json",
        "Authorization": f"Bearer {api_key}",
    }


def redact_circle_headers(headers: dict[str, str]) -> dict[str, str]:
    safe_headers = dict(headers)

    if "Authorization" in safe_headers:
        safe_headers["Authorization"] = AUTH_HEADER_REDACTION

    return safe_headers


def maybe_include_circle_debug(
    status: dict,
    request_url: str | None,
    request_headers: dict[str, str] | None,
    response_body: str | None,
):
    if not settings.circle_debug:
        return status

    return {
        **status,
        "request_url": request_url,
        "request_headers": request_headers,
        "response_body": response_body,
    }


def truncate_response_body(response_body: str, max_length: int = 1000) -> str:
    if len(response_body) <= max_length:
        return response_body

    return f"{response_body[:max_length]}..."


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
