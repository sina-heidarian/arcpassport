from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.services.quests import (
    QuestAlreadyCompletedError,
    QuestRequirementNotMetError,
    build_wallet_quests,
    claim_quest,
    list_quests,
)

router = APIRouter(tags=["Quests"])


@router.get(
    "/quests",
    summary="List quest definitions",
    description="Return all available ArcPassport quest definitions.",
)
def get_quests(db: Session = Depends(get_db)):
    return list_quests(db)


@router.get(
    "/quests/{wallet}",
    summary="Get wallet quest progress",
    description="Return dynamic quest progress and claim state for a wallet.",
)
def get_wallet_quests(wallet: str, db: Session = Depends(get_db)):
    return build_wallet_quests(db, wallet)


@router.post(
    "/quests/{wallet}/claim/{quest_id}",
    summary="Claim quest XP",
    description="Claim XP for a completed quest once per wallet.",
)
def post_claim_quest(wallet: str, quest_id: int, db: Session = Depends(get_db)):
    try:
        return claim_quest(db, wallet, quest_id)
    except QuestRequirementNotMetError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except QuestAlreadyCompletedError as error:
        raise HTTPException(status_code=409, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
