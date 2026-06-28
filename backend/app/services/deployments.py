import logging

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Deployment

logger = logging.getLogger(__name__)


def get_deployment_count(db: Session, wallet: str):
    return (
        db.query(func.count(func.distinct(Deployment.contract_address)))
        .filter(Deployment.wallet == wallet.lower())
        .scalar()
    )


def save_deployment(db: Session, payload: dict):
    from app.services.passport import get_or_create_passport

    wallet = payload["wallet"].lower()
    contract_address = payload["contract_address"].lower()
    tx_hash = payload["tx_hash"]
    logger.info("Deployment save requested wallet=%s tx_hash=%s", wallet, tx_hash)

    existing_deployment = (
        db.query(Deployment)
        .filter(
            Deployment.wallet == wallet,
            (
                (Deployment.tx_hash == tx_hash)
                | (Deployment.contract_address == contract_address)
            ),
        )
        .first()
    )

    if existing_deployment:
        logger.info(
            "Deployment already saved wallet=%s contract_address=%s tx_hash=%s",
            wallet,
            contract_address,
            tx_hash,
        )
        return {
            "success": True,
            "reward_xp": 0,
            "message": "Deployment already saved",
            "deployment": serialize_deployment(existing_deployment),
        }

    deployment = Deployment(
        wallet=wallet,
        contract_address=contract_address,
        tx_hash=tx_hash,
    )

    db.add(deployment)
    get_or_create_passport(db, wallet)
    db.commit()
    logger.info(
        "Deployment saved wallet=%s contract_address=%s tx_hash=%s",
        wallet,
        contract_address,
        tx_hash,
    )

    return {
        "success": True,
        "reward_xp": 100,
        "deployment": serialize_deployment(deployment),
    }


def list_deployments(db: Session, wallet: str):
    deployments = (
        db.query(Deployment)
        .filter(Deployment.wallet == wallet.lower())
        .all()
    )

    return {
        "deployments": [
            serialize_deployment(deployment)
            for deployment in deployments
        ]
    }


def serialize_deployment(deployment: Deployment):
    return {
        "contract_address": deployment.contract_address,
        "tx_hash": deployment.tx_hash,
        "created_at": deployment.created_at,
    }
