from datetime import date
import logging

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Quest, QuestCompletion
from app.services.arcscan import build_wallet_stats
from app.services.deployments import get_deployment_count
from app.services.passport import get_or_create_passport

logger = logging.getLogger(__name__)

QUEST_CATEGORIES = {"Onchain", "Deploy", "Social", "Learning", "Builder"}
QUEST_REQUIREMENT_TYPES = {
    "first_transaction",
    "first_deployment",
    "deploy_3_contracts",
    "claim_faucet",
    "mint_passport",
    "daily_checkin",
    "streak_7",
    "streak_30",
}


class QuestRequirementNotMetError(Exception):
    pass


class QuestAlreadyCompletedError(Exception):
    pass

DEFAULT_QUESTS = [
    {
        "title": "Make Your First Arc Transaction",
        "description": "Complete one transaction on Arc Testnet.",
        "category": "Onchain",
        "xp_reward": 25,
        "requirement_type": "first_transaction",
        "requirement_value": 1,
        "is_repeatable": False,
    },
    {
        "title": "Deploy Your First Contract",
        "description": "Deploy one smart contract and start building on Arc.",
        "category": "Deploy",
        "xp_reward": 100,
        "requirement_type": "first_deployment",
        "requirement_value": 1,
        "is_repeatable": False,
    },
    {
        "title": "Deploy 3 Contracts",
        "description": "Ship three contracts to prove consistent builder activity.",
        "category": "Deploy",
        "xp_reward": 250,
        "requirement_type": "deploy_3_contracts",
        "requirement_value": 3,
        "is_repeatable": False,
    },
    {
        "title": "Claim Testnet Assets",
        "description": "Use the faucet to prepare your builder wallet.",
        "category": "Builder",
        "xp_reward": 25,
        "requirement_type": "claim_faucet",
        "requirement_value": 1,
        "is_repeatable": False,
    },
    {
        "title": "Prepare Builder Passport Mint",
        "description": "Prepare your Builder Passport NFT metadata.",
        "category": "Builder",
        "xp_reward": 50,
        "requirement_type": "mint_passport",
        "requirement_value": 1,
        "is_repeatable": False,
    },
    {
        "title": "Daily Builder Check-in",
        "description": "Check in today and keep your builder rhythm alive.",
        "category": "Builder",
        "xp_reward": 10,
        "requirement_type": "daily_checkin",
        "requirement_value": 1,
        "is_repeatable": True,
    },
    {
        "title": "Build a 7 Day Streak",
        "description": "Check in for seven consecutive days.",
        "category": "Builder",
        "xp_reward": 100,
        "requirement_type": "streak_7",
        "requirement_value": 7,
        "is_repeatable": False,
    },
    {
        "title": "Build a 30 Day Streak",
        "description": "Check in for thirty consecutive days.",
        "category": "Builder",
        "xp_reward": 500,
        "requirement_type": "streak_30",
        "requirement_value": 30,
        "is_repeatable": False,
    },
]


def seed_default_quests():
    db = SessionLocal()

    try:
        for quest_data in DEFAULT_QUESTS:
            existing_quest = (
                db.query(Quest)
                .filter(Quest.requirement_type == quest_data["requirement_type"])
                .first()
            )

            if existing_quest:
                continue

            db.add(Quest(**quest_data))

        db.commit()
    finally:
        db.close()


def list_quests(db: Session):
    quests = db.query(Quest).order_by(Quest.id.asc()).all()

    return {
        "quests": [serialize_quest(quest) for quest in quests]
    }


def build_wallet_quests(db: Session, wallet: str):
    wallet = wallet.lower()
    passport = get_or_create_passport(db, wallet)
    stats = build_wallet_stats(wallet)
    deployment_count = get_deployment_count(db, wallet)
    quests = db.query(Quest).order_by(Quest.id.asc()).all()
    completions = get_completion_map(db, wallet)
    quest_states = [
        build_quest_state(
            quest,
            passport,
            stats,
            deployment_count,
            completions,
        )
        for quest in quests
    ]

    completed_count = len([
        quest for quest in quest_states if quest["status"] == "completed"
    ])
    in_progress_count = len([
        quest for quest in quest_states if quest["status"] == "in_progress"
    ])
    locked_count = len([
        quest for quest in quest_states if quest["status"] == "locked"
    ])
    total_xp_available = sum(quest["xp_reward"] for quest in quest_states)
    total_xp_completed = sum(
        completion.xp_reward for completion in completions.values()
    )

    return {
        "wallet": wallet,
        "summary": {
            "total": len(quest_states),
            "completed": completed_count,
            "in_progress": in_progress_count,
            "locked": locked_count,
            "total_xp_available": total_xp_available,
            "total_xp_completed": total_xp_completed,
        },
        "quests": quest_states,
    }


def claim_quest(db: Session, wallet: str, quest_id: int):
    wallet = wallet.lower()
    logger.info("Quest claim requested wallet=%s quest_id=%s", wallet, quest_id)
    quest = db.query(Quest).filter(Quest.id == quest_id).first()

    if not quest:
        raise ValueError("Quest not found")

    existing_completion = get_completion(db, wallet, quest_id)

    if existing_completion:
        logger.info("Quest already claimed wallet=%s quest_id=%s", wallet, quest_id)
        raise QuestAlreadyCompletedError("Quest already claimed")

    passport = get_or_create_passport(db, wallet)
    stats = build_wallet_stats(wallet)
    deployment_count = get_deployment_count(db, wallet)
    progress = quest_progress(
        quest.requirement_type,
        passport,
        stats,
        deployment_count,
    )

    if progress < quest.requirement_value:
        logger.info(
            "Quest requirement not met wallet=%s quest_id=%s progress=%s target=%s",
            wallet,
            quest_id,
            progress,
            quest.requirement_value,
        )
        raise QuestRequirementNotMetError("Quest requirement not met")

    completion = QuestCompletion(
        wallet=wallet,
        quest_id=quest.id,
        xp_reward=quest.xp_reward,
    )

    db.add(completion)
    db.commit()
    db.refresh(completion)
    logger.info(
        "Quest XP claimed wallet=%s quest_id=%s xp_reward=%s",
        wallet,
        quest.id,
        completion.xp_reward,
    )

    return {
        "success": True,
        "message": "Quest XP claimed",
        "wallet": wallet,
        "quest_id": quest.id,
        "xp_reward": completion.xp_reward,
        "completed_at": completion.completed_at,
    }


def serialize_quest(quest: Quest):
    return {
        "id": quest.id,
        "title": quest.title,
        "description": quest.description,
        "category": quest.category,
        "xp_reward": quest.xp_reward,
        "requirement_type": quest.requirement_type,
        "requirement_value": quest.requirement_value,
        "is_repeatable": quest.is_repeatable,
    }


def build_quest_state(
    quest: Quest,
    passport,
    stats: dict,
    deployment_count: int,
    completions: dict[int, QuestCompletion],
):
    progress = quest_progress(
        quest.requirement_type,
        passport,
        stats,
        deployment_count,
    )
    target = quest.requirement_value
    completion = completions.get(quest.id)
    requirement_met = progress >= target
    claimable = requirement_met and completion is None
    status = quest_status(completion is not None, requirement_met, progress)

    return {
        **serialize_quest(quest),
        "progress": min(progress, target),
        "target": target,
        "status": status,
        "completed": status == "completed",
        "in_progress": status == "in_progress",
        "locked": status == "locked",
        "claimable": claimable,
        "claimed_xp": completion.xp_reward if completion else 0,
        "completed_at": completion.completed_at if completion else None,
    }


def quest_progress(
    requirement_type: str,
    passport,
    stats: dict,
    deployment_count: int,
):
    if requirement_type == "first_transaction":
        return stats["tx_count"]
    if requirement_type == "first_deployment":
        return deployment_count
    if requirement_type == "deploy_3_contracts":
        return deployment_count
    if requirement_type == "daily_checkin":
        return 1 if passport.last_checkin_date == date.today() else 0
    if requirement_type == "streak_7":
        return passport.streak
    if requirement_type == "streak_30":
        return passport.streak

    # claim_faucet and mint_passport do not have persisted automation yet.
    return 0


def quest_status(completed: bool, requirement_met: bool, progress: int):
    if completed:
        return "completed"
    if requirement_met or progress > 0:
        return "in_progress"
    return "locked"


def get_completion(db: Session, wallet: str, quest_id: int):
    return (
        db.query(QuestCompletion)
        .filter(
            QuestCompletion.wallet == wallet.lower(),
            QuestCompletion.quest_id == quest_id,
        )
        .first()
    )


def get_completion_map(db: Session, wallet: str):
    completions = (
        db.query(QuestCompletion)
        .filter(QuestCompletion.wallet == wallet.lower())
        .all()
    )

    return {completion.quest_id: completion for completion in completions}


def get_quest_xp(db: Session, wallet: str):
    return db.query(
        func.coalesce(func.sum(QuestCompletion.xp_reward), 0)
    ).filter(QuestCompletion.wallet == wallet.lower()).scalar()
