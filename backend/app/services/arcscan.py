import logging

import requests

ARCSCAN_BASE_URL = "https://testnet.arcscan.app/api/v2"
logger = logging.getLogger(__name__)


def fetch_json(path: str):
    url = f"{ARCSCAN_BASE_URL}{path}"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return response.json()


def get_wallet_info(wallet: str):
    return fetch_json(f"/addresses/{wallet}")


def get_wallet_transactions(wallet: str):
    return fetch_json(f"/addresses/{wallet}/transactions")


def get_wallet_token_transfers(wallet: str):
    return fetch_json(f"/addresses/{wallet}/token-transfers")


def get_wallet_tokens(wallet: str):
    return fetch_json(f"/addresses/{wallet}/tokens")


def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def short_hash(value: str):
    if not value:
        return ""
    return f"{value[:8]}...{value[-6:]}"


def normalize_transaction(tx: dict):
    tx_hash = tx.get("hash", "")
    to_obj = tx.get("to")
    from_obj = tx.get("from")

    to_address = to_obj.get("hash") if isinstance(to_obj, dict) else None
    from_address = from_obj.get("hash") if isinstance(from_obj, dict) else None

    tx_type = "Transfer"
    if isinstance(to_obj, dict) and to_obj.get("is_contract"):
        tx_type = "Contract Call"

    return {
        "hash": tx_hash,
        "short_hash": short_hash(tx_hash),
        "type": tx_type,
        "status": tx.get("status", "unknown"),
        "timestamp": tx.get("timestamp"),
        "from": from_address,
        "to": to_address,
    }


def build_wallet_stats(wallet: str):
    info = get_wallet_info(wallet)
    txs = get_wallet_transactions(wallet)

    try:
        token_transfers = get_wallet_token_transfers(wallet)
    except requests.RequestException as error:
        logger.warning(
            "ArcScan token transfers unavailable wallet=%s error=%s",
            wallet,
            error,
        )
        token_transfers = {"items": []}

    try:
        tokens = get_wallet_tokens(wallet)
    except requests.RequestException as error:
        logger.warning(
            "ArcScan tokens unavailable wallet=%s error=%s",
            wallet,
            error,
        )
        tokens = {"items": []}

    tx_items = txs.get("items", [])
    token_transfer_items = token_transfers.get("items", [])
    token_items = tokens.get("items", [])

    tx_count = info.get("transactions_count") or len(tx_items)

    contract_calls = 0
    for tx in tx_items:
        to_obj = tx.get("to")
        if isinstance(to_obj, dict) and to_obj.get("is_contract"):
            contract_calls += 1

    balance_raw = info.get("coin_balance") or "0"
    balance_usdc = safe_int(balance_raw) / 10**18

    recent_transactions = [
        normalize_transaction(tx) for tx in tx_items[:10]
    ]

    return {
        "wallet": wallet,
        "tx_count": safe_int(tx_count),
        "contract_calls": contract_calls,
        "token_transfers": len(token_transfer_items),
        "tokens_count": len(token_items),
        "balance": round(balance_usdc, 6),
        "recent_transactions": recent_transactions,
        "raw_info": info,
    }
