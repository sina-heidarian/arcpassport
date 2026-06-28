from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import QuestCompletion
from app.services.passport import build_passport_response

PASSPORT_NFT_NAME = "ArcPassport Builder Passport"
PASSPORT_NFT_DESCRIPTION = (
    "Soulbound builder identity for ArcPassport, representing builder XP, "
    "deployments, quests, reputation, and onchain progress."
)
PASSPORT_NFT_IMAGE_PLACEHOLDER = "placeholder://arcpassport-builder-passport"


def build_passport_nft_metadata(db: Session, wallet: str):
    """Build read-only NFT metadata from the current passport state."""
    passport = build_passport_response(db, wallet)

    return {
        "name": PASSPORT_NFT_NAME,
        "description": PASSPORT_NFT_DESCRIPTION,
        "image": PASSPORT_NFT_IMAGE_PLACEHOLDER,
        "attributes": [
            {
                "trait_type": "Level",
                "value": passport["level"],
            },
            {
                "trait_type": "XP",
                "value": passport["xp"],
            },
            {
                "trait_type": "Builder Rank",
                "value": passport["rank"],
            },
            {
                "trait_type": "Deployments",
                "value": passport["deployment_count"],
            },
            {
                "trait_type": "Quest XP",
                "value": passport["quest_xp"],
            },
            {
                "trait_type": "Check-in Streak",
                "value": passport["streak"],
            },
        ],
    }


def build_passport_nft_eligibility(db: Session, wallet: str):
    """Evaluate mint readiness without minting or touching the chain."""
    passport = build_passport_response(db, wallet)
    completed_quests = get_completed_quest_count(db, wallet)

    requirements = [
        {
            "label": "Reach Level 5",
            "met": passport["level"] >= 5,
            "current": passport["level"],
            "target": 5,
        },
        {
            "label": "Import or deploy one contract",
            "met": passport["deployment_count"] >= 1,
            "current": passport["deployment_count"],
            "target": 1,
        },
        {
            "label": "Complete one quest",
            "met": completed_quests >= 1,
            "current": completed_quests,
            "target": 1,
        },
    ]
    eligible = all(requirement["met"] for requirement in requirements)

    return {
        "eligible": eligible,
        "reason": (
            "Builder Passport mint architecture is ready."
            if eligible
            else "Complete the remaining requirements to prepare for minting."
        ),
        "requirements": requirements,
    }


def build_future_verifier_context(db: Session, wallet: str):
    """Prepare non-sensitive values a future mint verifier can sign or check."""
    metadata = build_passport_nft_metadata(db, wallet)
    eligibility = build_passport_nft_eligibility(db, wallet)

    return {
        "wallet": wallet.lower(),
        "eligible": eligibility["eligible"],
        "metadata_name": metadata["name"],
        "requirements": eligibility["requirements"],
    }


def get_completed_quest_count(db: Session, wallet: str):
    return (
        db.query(func.count(QuestCompletion.id))
        .filter(QuestCompletion.wallet == wallet.lower())
        .scalar()
        or 0
    )
