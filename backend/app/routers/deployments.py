from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.deployments import list_deployments, save_deployment

router = APIRouter()


@router.post("/deployment")
def post_deployment(payload: dict, db: Session = Depends(get_db)):
    return save_deployment(db, payload)


@router.get("/deployments/{wallet}")
def get_deployments(wallet: str, db: Session = Depends(get_db)):
    return list_deployments(db, wallet)
