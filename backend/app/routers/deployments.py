from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.deployments import list_deployments, save_deployment

router = APIRouter(tags=["Deployments"])


@router.post(
    "/deployment",
    response_model=dict,
    summary="Save deployment",
    description="Record a successful onchain deployment transaction if it has not already been saved.",
)
def post_deployment(payload: dict, db: Session = Depends(get_db)):
    return save_deployment(db, payload)


@router.post(
    "/deployments",
    response_model=dict,
    summary="Save deployment",
    description="Versioned alias for recording a successful onchain deployment transaction.",
)
def post_deployments(payload: dict, db: Session = Depends(get_db)):
    return save_deployment(db, payload)


@router.get(
    "/deployments/{wallet}",
    response_model=dict,
    summary="List wallet deployments",
    description="Return saved deployment records for a wallet.",
)
def get_deployments(wallet: str, db: Session = Depends(get_db)):
    return list_deployments(db, wallet)
