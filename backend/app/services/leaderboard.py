from sqlalchemy.orm import Session

from app.models import Passport
from app.services.achievements import build_achievements
from app.services.arcscan import build_wallet_stats
from app.services.deployments import get_deployment_count
from app.services.passport import calculate_scores, get_builder_rank
from app.services.quests import get_quest_xp


def build_leaderboard_entries(db: Session):
    passports = db.query(Passport).all()
    leaderboard = []

    for passport in passports:
        stats = build_wallet_stats(passport.wallet)
        deployment_count = get_deployment_count(db, passport.wallet)
        quest_xp = get_quest_xp(db, passport.wallet)
        scores = calculate_scores(stats, passport, deployment_count, quest_xp)
        achievements = build_achievements(
            passport,
            stats,
            deployment_count,
            scores["xp"],
        )

        leaderboard.append({
            "wallet": passport.wallet,
            "xp": scores["xp"],
            "streak": passport.streak,
            "checkin_xp": passport.checkin_xp,
            "deployment_count": deployment_count,
            "deployment_xp": scores["deployment_xp"],
            "builder_rank": get_builder_rank(scores["xp"]),
            "achievements_unlocked": len([
                achievement
                for achievement in achievements
                if achievement["unlocked"]
            ]),
        })

    leaderboard.sort(
        key=lambda user: (
            user["xp"],
            user["deployment_count"],
            user["streak"],
        ),
        reverse=True,
    )

    for index, user in enumerate(leaderboard, start=1):
        user["rank"] = index

    return leaderboard


def calculate_user_rank(db: Session, wallet: str):
    ranked_users = build_leaderboard_entries(db)
    wallet = wallet.lower()

    for user in ranked_users:
        if user["wallet"] == wallet:
            return user["rank"]

    return 0


def get_leaderboard_response(db: Session):
    return {
        "leaderboard": build_leaderboard_entries(db)
    }
