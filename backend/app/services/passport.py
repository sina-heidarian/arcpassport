from datetime import date, timedelta
import logging

from sqlalchemy.orm import Session

from app.models import Passport
from app.services.achievements import build_achievements
from app.services.arcscan import build_wallet_stats
from app.services.deployments import get_deployment_count

logger = logging.getLogger(__name__)


def get_or_create_passport(db: Session, wallet: str):
    wallet = wallet.lower()

    passport = db.query(Passport).filter(Passport.wallet == wallet).first()

    if not passport:
        passport = Passport(wallet=wallet)
        db.add(passport)
        db.commit()
        db.refresh(passport)

    return passport


def passport_profile(passport: Passport):
    return {
        "display_name": passport.display_name,
        "bio": passport.bio,
        "x_handle": passport.x_handle,
        "website": passport.website,
    }


def validate_profile_field(value, field_name: str, max_length: int):
    if value is not None and len(value) > max_length:
        raise ValueError(
            f"{field_name} must be {max_length} characters or less"
        )

    return value or None


def calculate_scores(
    stats: dict,
    passport: Passport,
    deployment_count: int,
    quest_xp: int = 0,
):
    tx_count = stats["tx_count"]
    contract_calls = stats["contract_calls"]
    token_transfers = stats["token_transfers"]
    tokens_count = stats["tokens_count"]
    deployment_xp = deployment_count * 100

    onchain_xp = (
        tx_count * 2
        + contract_calls * 5
        + token_transfers * 2
        + tokens_count * 5
    )

    total_xp = onchain_xp + passport.checkin_xp + deployment_xp + quest_xp
    level = max(1, total_xp // 100 + 1)

    reputation = (
        tx_count
        + contract_calls * 3
        + token_transfers
        + tokens_count * 2
        + passport.streak * 2
        + deployment_count * 10
    )

    return {
        "xp": total_xp,
        "level": level,
        "reputation": reputation,
        "onchain_xp": onchain_xp,
        "deployment_xp": deployment_xp,
        "quest_xp": quest_xp,
    }


def get_builder_rank(total_xp: int):
    if total_xp >= 500:
        return "Elite Builder"
    if total_xp >= 250:
        return "Advanced Builder"
    if total_xp >= 100:
        return "Active Builder"
    return "New Builder"


def build_passport_response(db: Session, wallet: str):
    from app.services.leaderboard import calculate_user_rank

    passport = get_or_create_passport(db, wallet)
    stats = build_wallet_stats(wallet)
    deployment_count = get_deployment_count(db, wallet)
    from app.services.quests import get_quest_xp

    quest_xp = get_quest_xp(db, wallet)
    scores = calculate_scores(stats, passport, deployment_count, quest_xp)
    achievements = build_achievements(
        passport,
        stats,
        deployment_count,
        scores["xp"],
    )

    today = date.today()
    checkin_available = passport.last_checkin_date != today

    return {
        "wallet": wallet,
        **passport_profile(passport),
        "level": scores["level"],
        "xp": scores["xp"],
        "reputation": scores["reputation"],
        "tx_count": stats["tx_count"],
        "nft_count": 0,
        "streak": passport.streak,
        "rank": calculate_user_rank(db, wallet),
        "contract_calls": stats["contract_calls"],
        "token_transfers": stats["token_transfers"],
        "tokens_count": stats["tokens_count"],
        "balance": stats["balance"],
        "recent_transactions": stats["recent_transactions"],
        "checkin_available": checkin_available,
        "checkin_xp": passport.checkin_xp,
        "deployment_count": deployment_count,
        "deployment_xp": scores["deployment_xp"],
        "quest_xp": scores["quest_xp"],
        "xp_breakdown": {
            "onchain_xp": scores["onchain_xp"],
            "deployment_xp": scores["deployment_xp"],
            "checkin_xp": passport.checkin_xp,
            "quest_xp": scores["quest_xp"],
            "total_xp": scores["xp"],
        },
        "achievements": achievements,
    }


def update_passport_profile(db: Session, wallet: str, payload: dict):
    passport = get_or_create_passport(db, wallet)

    passport.display_name = validate_profile_field(
        payload.get("display_name"),
        "display_name",
        40,
    )
    passport.bio = validate_profile_field(payload.get("bio"), "bio", 160)
    passport.x_handle = validate_profile_field(
        payload.get("x_handle"),
        "x_handle",
        30,
    )
    passport.website = validate_profile_field(
        payload.get("website"),
        "website",
        120,
    )

    db.commit()
    db.refresh(passport)

    return {
        "wallet": passport.wallet,
        **passport_profile(passport),
    }


def prepare_passport_mint(db: Session, wallet: str):
    from app.services.leaderboard import calculate_user_rank

    passport = get_or_create_passport(db, wallet)
    stats = build_wallet_stats(wallet)
    deployment_count = get_deployment_count(db, wallet)
    from app.services.quests import get_quest_xp

    quest_xp = get_quest_xp(db, wallet)
    scores = calculate_scores(stats, passport, deployment_count, quest_xp)
    rank = calculate_user_rank(db, wallet)

    return {
        "success": True,
        "message": "Builder Passport mint prepared",
        "wallet": passport.wallet,
        "status": "ready",
        "metadata": {
            "name": "Arc Builder Passport",
            "description": "Persistent builder identity for Arc",
            "level": scores["level"],
            "xp": scores["xp"],
            "reputation": scores["reputation"],
            "rank": rank,
        },
    }


def daily_checkin(db: Session, wallet: str):
    passport = get_or_create_passport(db, wallet)
    today = date.today()
    logger.info("Daily check-in requested wallet=%s", passport.wallet)

    if passport.last_checkin_date == today:
        logger.info("Daily check-in skipped wallet=%s reason=already_checked_in", passport.wallet)
        return {
            "success": False,
            "message": "Already checked in today",
            "streak": passport.streak,
            "checkin_xp": passport.checkin_xp,
        }

    yesterday = today - timedelta(days=1)

    if passport.last_checkin_date == yesterday:
        passport.streak += 1
    else:
        passport.streak = 1

    reward_xp = 10

    if passport.streak % 7 == 0:
        reward_xp += 50

    passport.checkin_xp += reward_xp
    passport.last_checkin_date = today

    db.commit()
    db.refresh(passport)
    logger.info(
        "Daily check-in completed wallet=%s reward_xp=%s streak=%s",
        passport.wallet,
        reward_xp,
        passport.streak,
    )

    return {
        "success": True,
        "message": "Daily check-in completed",
        "reward_xp": reward_xp,
        "streak": passport.streak,
        "checkin_xp": passport.checkin_xp,
    }
