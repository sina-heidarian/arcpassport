from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.stats import get_stats_response

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return get_stats_response(db)
