from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.stats import get_stats_response

router = APIRouter(tags=["Stats"])


@router.get(
    "/stats",
    response_model=dict,
    summary="Get platform stats",
    description="Return high-level ArcPassport platform overview metrics.",
)
def get_stats(db: Session = Depends(get_db)):
    return get_stats_response(db)
