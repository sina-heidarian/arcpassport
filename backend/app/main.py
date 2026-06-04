from datetime import date, timedelta

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.services.arcscan import build_wallet_stats
from app.models import Passport, Deployment

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ArcPassport API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_or_create_passport(db: Session, wallet: str):
    wallet = wallet.lower()

    passport = db.query(Passport).filter(Passport.wallet == wallet).first()

    if not passport:
        passport = Passport(wallet=wallet)
        db.add(passport)
        db.commit()
        db.refresh(passport)

    return passport


def calculate_scores(stats: dict, passport: Passport):
    tx_count = stats["tx_count"]
    contract_calls = stats["contract_calls"]
    token_transfers = stats["token_transfers"]
    tokens_count = stats["tokens_count"]

    onchain_xp = (
        tx_count * 2
        + contract_calls * 5
        + token_transfers * 2
        + tokens_count * 5
    )

    total_xp = onchain_xp + passport.checkin_xp

    level = max(1, total_xp // 100 + 1)

    reputation = (
        tx_count
        + contract_calls * 3
        + token_transfers
        + tokens_count * 2
        + passport.streak * 2
    )

    return {
        "xp": total_xp,
        "level": level,
        "reputation": reputation,
    }
def calculate_user_rank(db: Session, wallet: str):
    passports = db.query(Passport).all()

    ranked_users = sorted(
        passports,
        key=lambda p: (p.checkin_xp, p.streak),
        reverse=True
    )

    wallet = wallet.lower()

    for index, passport in enumerate(ranked_users, start=1):
        if passport.wallet == wallet:
            return index

    return 0

@app.get("/")
def root():
    return {"message": "ArcPassport API running"}


@app.get("/passport/{wallet}")
def get_passport(wallet: str, db: Session = Depends(get_db)):
    try:
        passport = get_or_create_passport(db, wallet)
        stats = build_wallet_stats(wallet)

        scores = calculate_scores(stats, passport)

        today = date.today()
        checkin_available = passport.last_checkin_date != today

        return {
            "wallet": wallet,
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
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/checkin/{wallet}")
def daily_checkin(wallet: str, db: Session = Depends(get_db)):
    passport = get_or_create_passport(db, wallet)

    today = date.today()

    if passport.last_checkin_date == today:
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

    return {
        "success": True,
        "message": "Daily check-in completed",
        "reward_xp": reward_xp,
        "streak": passport.streak,
        "checkin_xp": passport.checkin_xp,
    }


@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    passports = db.query(Passport).all()

    leaderboard = []

    for passport in passports:
        leaderboard.append({
            "wallet": passport.wallet,
            "xp": passport.checkin_xp,
            "streak": passport.streak,
            "checkin_xp": passport.checkin_xp,
        })

    leaderboard.sort(key=lambda x: (x["xp"], x["streak"]), reverse=True)

    for index, user in enumerate(leaderboard, start=1):
        user["rank"] = index

    return {
        "leaderboard": leaderboard
    }

@app.post("/deployment")
def save_deployment(payload: dict, db: Session = Depends(get_db)):
    wallet = payload["wallet"].lower()
    contract_address = payload["contract_address"]
    tx_hash = payload["tx_hash"]

    deployment = Deployment(
        wallet=wallet,
        contract_address=contract_address,
        tx_hash=tx_hash,
    )

    db.add(deployment)

    passport = get_or_create_passport(db, wallet)

    passport.checkin_xp += 100

    db.commit()

    return {
        "success": True,
        "reward_xp": 100,
    }

@app.get("/deployments/{wallet}")
def get_deployments(wallet: str, db: Session = Depends(get_db)):
    deployments = (
        db.query(Deployment)
        .filter(Deployment.wallet == wallet.lower())
        .all()
    )

    return {
        "deployments": [
            {
                "contract_address": d.contract_address,
                "tx_hash": d.tx_hash,
                "created_at": d.created_at,
            }
            for d in deployments
        ]
    }