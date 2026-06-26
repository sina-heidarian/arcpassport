from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.passport import (
    build_passport_response,
    daily_checkin,
    prepare_passport_mint,
    update_passport_profile,
)

router = APIRouter()


def bad_request_from_value_error(error: ValueError):
    raise HTTPException(status_code=400, detail=str(error))


@router.get("/passport/{wallet}")
def get_passport(wallet: str, db: Session = Depends(get_db)):
    try:
        return build_passport_response(db, wallet)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.patch("/passport/{wallet}/profile")
def patch_passport_profile(
    wallet: str,
    payload: dict,
    db: Session = Depends(get_db),
):
    try:
        return update_passport_profile(db, wallet, payload)
    except ValueError as error:
        bad_request_from_value_error(error)


@router.post("/passport/{wallet}/mint")
def post_passport_mint(wallet: str, db: Session = Depends(get_db)):
    try:
        return prepare_passport_mint(db, wallet)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/checkin/{wallet}")
def post_daily_checkin(wallet: str, db: Session = Depends(get_db)):
    return daily_checkin(db, wallet)
