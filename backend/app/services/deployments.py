from sqlalchemy.orm import Session

from app.models import Deployment


def get_deployment_count(db: Session, wallet: str):
    return (
        db.query(Deployment)
        .filter(Deployment.wallet == wallet.lower())
        .count()
    )


def save_deployment(db: Session, payload: dict):
    from app.services.passport import get_or_create_passport

    wallet = payload["wallet"].lower()
    contract_address = payload["contract_address"]
    tx_hash = payload["tx_hash"]

    existing_deployment = (
        db.query(Deployment)
        .filter(Deployment.tx_hash == tx_hash)
        .first()
    )

    if existing_deployment:
        return {
            "success": True,
            "reward_xp": 0,
            "message": "Deployment already saved",
        }

    deployment = Deployment(
        wallet=wallet,
        contract_address=contract_address,
        tx_hash=tx_hash,
    )

    db.add(deployment)
    get_or_create_passport(db, wallet)
    db.commit()

    return {
        "success": True,
        "reward_xp": 100,
    }


def list_deployments(db: Session, wallet: str):
    deployments = (
        db.query(Deployment)
        .filter(Deployment.wallet == wallet.lower())
        .all()
    )

    return {
        "deployments": [
            {
                "contract_address": deployment.contract_address,
                "tx_hash": deployment.tx_hash,
                "created_at": deployment.created_at,
            }
            for deployment in deployments
        ]
    }
