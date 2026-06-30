from datetime import datetime, timezone
import logging

import requests
from sqlalchemy.orm import Session

from app.models import Deployment, SyncStatus
from app.services.arcscan import (
    build_wallet_stats,
    get_wallet_token_transfers,
    get_wallet_transactions,
)
from app.services.deployments import get_deployment_count, save_deployment

NETWORK_NAME = "Arc Testnet"
logger = logging.getLogger(__name__)


def sync_wallet_activity(db: Session, wallet: str):
    wallet = wallet.lower()
    status = get_or_create_sync_status(db, wallet)
    status.syncing = True
    status.updated_at = utc_now()
    db.commit()

    try:
        stats = build_wallet_stats(wallet)
        transactions_response = get_wallet_transactions(wallet)
        try:
            token_transfers_response = get_wallet_token_transfers(wallet)
        except requests.RequestException as error:
            logger.warning(
                "Arc token transfers unavailable during sync wallet=%s error=%s",
                wallet,
                error,
            )
            token_transfers_response = {"items": []}
        tx_items = transactions_response.get("items", [])
        token_transfer_items = token_transfers_response.get("items", [])
        imported_deployments = import_contract_deployments(db, wallet, tx_items)
        latest_block = latest_block_from_transactions(tx_items)

        status.last_sync_at = utc_now()
        status.syncing = False
        status.latest_block = latest_block
        status.network = NETWORK_NAME
        status.latest_stats = stats
        status.last_error = None
        status.updated_at = utc_now()
        db.commit()

        from app.services.passport import build_passport_response

        passport = build_passport_response(db, wallet)

        logger.info(
            "Arc activity synced wallet=%s tx_count=%s deployments=%s latest_block=%s",
            wallet,
            stats["tx_count"],
            imported_deployments,
            latest_block,
        )

        return {
            "wallet": wallet,
            "synced": True,
            "cached": False,
            "transactions": stats["tx_count"],
            "latest_transactions": stats["recent_transactions"],
            "contract_calls": stats["contract_calls"],
            "token_transfers": len(token_transfer_items),
            "balance": stats["balance"],
            "deployments": get_deployment_count(db, wallet),
            "imported_deployments": imported_deployments,
            "xp": passport["xp"],
            "reputation": passport["reputation"],
            "rank": passport["rank"],
            "deployment_xp": passport["deployment_xp"],
            "achievements": passport["achievements"],
            "latest_block": latest_block,
            "network": NETWORK_NAME,
            "timestamp": status.last_sync_at,
        }
    except requests.RequestException as error:
        logger.warning("Arc sync unavailable wallet=%s error=%s", wallet, error)
        return build_cached_sync_response(db, wallet, str(error))
    except Exception as error:
        logger.exception("Arc sync failed wallet=%s", wallet)
        return build_cached_sync_response(db, wallet, "Arc sync failed")


def get_sync_status_response(db: Session, wallet: str):
    status = get_sync_status(db, wallet.lower())

    return {
        "wallet": wallet.lower(),
        "last_sync": status.last_sync_at if status else None,
        "syncing": bool(status.syncing) if status else False,
        "latest_block": status.latest_block if status else None,
        "network": status.network if status else NETWORK_NAME,
    }


def get_wallet_stats_with_cache(db: Session, wallet: str):
    wallet = wallet.lower()

    try:
        stats = build_wallet_stats(wallet)
        save_stats_snapshot(db, wallet, stats)
        return stats
    except requests.RequestException as error:
        logger.warning(
            "Using cached Arc stats wallet=%s reason=%s",
            wallet,
            error,
        )
        cached_stats = get_cached_wallet_stats(db, wallet)
        if cached_stats:
            return cached_stats

        return empty_wallet_stats(wallet)


def build_cached_sync_response(db: Session, wallet: str, message: str):
    wallet = wallet.lower()
    status = get_or_create_sync_status(db, wallet)
    cached_stats = get_cached_wallet_stats(db, wallet) or empty_wallet_stats(wallet)
    status.syncing = False
    status.last_error = message[:240]
    status.updated_at = utc_now()
    db.commit()

    from app.services.passport import build_passport_response

    passport = build_passport_response(db, wallet)

    return {
        "wallet": wallet,
        "synced": False,
        "cached": True,
        "transactions": cached_stats["tx_count"],
        "latest_transactions": cached_stats["recent_transactions"],
        "contract_calls": cached_stats["contract_calls"],
        "token_transfers": cached_stats["token_transfers"],
        "balance": cached_stats["balance"],
        "deployments": get_deployment_count(db, wallet),
        "imported_deployments": 0,
        "xp": passport["xp"],
        "reputation": passport["reputation"],
        "rank": passport["rank"],
        "deployment_xp": passport["deployment_xp"],
        "achievements": passport["achievements"],
        "latest_block": status.latest_block,
        "network": status.network or NETWORK_NAME,
        "timestamp": status.last_sync_at,
        "message": "Arc RPC unavailable; returned cached data.",
    }


def import_contract_deployments(db: Session, wallet: str, transactions: list[dict]):
    imported = 0

    for transaction in transactions:
        contract_address = extract_created_contract_address(transaction)
        tx_hash = transaction.get("hash")

        if not contract_address or not tx_hash:
            continue

        existing = (
            db.query(Deployment)
            .filter(
                Deployment.wallet == wallet,
                Deployment.contract_address == contract_address.lower(),
            )
            .first()
        )

        if existing:
            continue

        save_deployment(
            db,
            {
                "wallet": wallet,
                "contract_address": contract_address,
                "tx_hash": tx_hash,
            },
        )
        imported += 1

    return imported


def extract_created_contract_address(transaction: dict):
    candidates = [
        transaction.get("created_contract_address"),
        transaction.get("created_contract"),
        transaction.get("created_contract_hash"),
    ]

    for candidate in candidates:
        if isinstance(candidate, str) and candidate.startswith("0x"):
            return candidate
        if isinstance(candidate, dict):
            value = candidate.get("hash") or candidate.get("address")
            if isinstance(value, str) and value.startswith("0x"):
                return value

    to_value = transaction.get("to")
    if to_value is None:
        created_contract = transaction.get("created_contract")
        if isinstance(created_contract, dict):
            return created_contract.get("hash") or created_contract.get("address")

    return None


def latest_block_from_transactions(transactions: list[dict]):
    blocks = []

    for transaction in transactions:
        block_number = transaction.get("block_number") or transaction.get("block")

        try:
            if block_number is not None:
                blocks.append(int(block_number))
        except (TypeError, ValueError):
            continue

    return max(blocks) if blocks else None


def save_stats_snapshot(db: Session, wallet: str, stats: dict):
    status = get_or_create_sync_status(db, wallet)
    status.latest_stats = stats
    status.updated_at = utc_now()
    db.commit()


def get_cached_wallet_stats(db: Session, wallet: str):
    status = get_sync_status(db, wallet)
    return status.latest_stats if status and status.latest_stats else None


def get_sync_status(db: Session, wallet: str):
    return db.query(SyncStatus).filter(SyncStatus.wallet == wallet.lower()).first()


def get_or_create_sync_status(db: Session, wallet: str):
    wallet = wallet.lower()
    status = get_sync_status(db, wallet)

    if status:
        return status

    status = SyncStatus(wallet=wallet, network=NETWORK_NAME, syncing=False)
    db.add(status)
    db.commit()
    db.refresh(status)
    return status


def empty_wallet_stats(wallet: str):
    return {
        "wallet": wallet,
        "tx_count": 0,
        "contract_calls": 0,
        "token_transfers": 0,
        "tokens_count": 0,
        "balance": 0,
        "recent_transactions": [],
        "raw_info": {},
    }


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)
