from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Deployment, Passport
from app.services.leaderboard import build_leaderboard_entries


def get_stats_response(db: Session):
    total_builders = db.query(Passport).count()
    total_deployments = db.query(Deployment).count()
    total_checkin_xp = db.query(
        func.coalesce(func.sum(Passport.checkin_xp), 0)
    ).scalar()

    top_builder = {
        "wallet": None,
        "xp": 0,
        "streak": 0,
    }

    leaderboard = build_leaderboard_entries(db)

    if leaderboard:
        top_user = leaderboard[0]
        top_builder = {
            "wallet": top_user["wallet"],
            "xp": top_user["xp"],
            "streak": top_user["streak"],
        }

    return {
        "total_builders": total_builders,
        "total_deployments": total_deployments,
        "total_checkin_xp": total_checkin_xp,
        "top_builder": top_builder,
    }
