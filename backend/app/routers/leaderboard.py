from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.leaderboard import get_leaderboard_response

router = APIRouter()


@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return get_leaderboard_response(db)
