from datetime import date, timedelta
from time import sleep

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.services.achievements import build_achievements
from app.services.arcscan import build_wallet_stats
from app.services.circle import (
    get_circle_base_url,
    is_circle_configured,
    prepare_contract_deploy,
    prepare_wallet_create,
)
from app.models import Passport, Deployment
from app.schemas import (
    CircleDeployRequest,
    CircleDeployResponse,
    CircleWalletCreateRequest,
    CircleWalletCreateResponse,
    GasSponsorshipEstimateRequest,
    GasSponsorshipEstimateResponse,
    GasSponsorshipStatusResponse,
)


SUPPORTED_CIRCLE_CONTRACT_TYPES = {"counter", "erc20", "erc721"}
SUPPORTED_CIRCLE_WALLET_TYPES = {"developer", "user"}
SUPPORTED_GAS_SPONSORSHIP_ACTIONS = ["deploy_contract", "mint_passport", "checkin"]


def wait_for_database(max_retries=30, delay_seconds=1):
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect():
                return
        except Exception as error:
            last_error = error
            print(
                f"Database not ready "
                f"({attempt}/{max_retries}): {error}",
                flush=True,
            )
            sleep(delay_seconds)

    raise RuntimeError(
        "Database did not become available after "
        f"{max_retries} retries. Last error: {last_error}"
    )


wait_for_database()
Base.metadata.create_all(bind=engine)


def run_local_migrations():
    # create_all creates tables for fresh local databases, but it does not
    # alter existing tables. Keep these additive, non-destructive fixes here
    # for local Docker development until Alembic is introduced for production
    # migrations.
    migrations = [
        "ALTER TABLE passports ADD COLUMN IF NOT EXISTS display_name VARCHAR(40)",
        "ALTER TABLE passports ADD COLUMN IF NOT EXISTS bio VARCHAR(160)",
        "ALTER TABLE passports ADD COLUMN IF NOT EXISTS x_handle VARCHAR(30)",
        "ALTER TABLE passports ADD COLUMN IF NOT EXISTS website VARCHAR(120)",
    ]

    with engine.begin() as connection:
        for migration in migrations:
            connection.execute(text(migration))


run_local_migrations()

app = FastAPI(title="ArcPassport API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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


def get_deployment_count(db: Session, wallet: str):
    return (
        db.query(Deployment)
        .filter(Deployment.wallet == wallet.lower())
        .count()
    )


def passport_profile(passport: Passport):
    return {
        "display_name": passport.display_name,
        "bio": passport.bio,
        "x_handle": passport.x_handle,
        "website": passport.website,
    }


def validate_profile_field(value, field_name: str, max_length: int):
    if value is not None and len(value) > max_length:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must be {max_length} characters or less",
        )

    return value or None


def calculate_scores(stats: dict, passport: Passport, deployment_count: int):
    tx_count = stats["tx_count"]
    contract_calls = stats["contract_calls"]
    token_transfers = stats["token_transfers"]
    tokens_count = stats["tokens_count"]
    deployment_xp = deployment_count * 100

    onchain_xp = (
        tx_count * 2
        + contract_calls * 5
        + token_transfers * 2
        + tokens_count * 5
    )

    total_xp = onchain_xp + passport.checkin_xp + deployment_xp

    level = max(1, total_xp // 100 + 1)

    reputation = (
        tx_count
        + contract_calls * 3
        + token_transfers
        + tokens_count * 2
        + passport.streak * 2
        + deployment_count * 10
    )

    return {
        "xp": total_xp,
        "level": level,
        "reputation": reputation,
        "onchain_xp": onchain_xp,
        "deployment_xp": deployment_xp,
    }


def get_builder_rank(total_xp: int):
    if total_xp >= 500:
        return "Elite Builder"
    if total_xp >= 250:
        return "Advanced Builder"
    if total_xp >= 100:
        return "Active Builder"
    return "New Builder"


def build_leaderboard_entries(db: Session):
    passports = db.query(Passport).all()
    leaderboard = []

    for passport in passports:
        stats = build_wallet_stats(passport.wallet)
        deployment_count = get_deployment_count(db, passport.wallet)
        scores = calculate_scores(stats, passport, deployment_count)
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

@app.get("/")
def root():
    return {"message": "ArcPassport API running"}


@app.get("/circle/status")
def circle_status():
    configured = is_circle_configured()

    return {
        "configured": configured,
        "base_url": get_circle_base_url(),
        "message": (
            "Circle API key configured"
            if configured
            else "Circle API key missing"
        ),
    }


@app.post("/circle/contracts/deploy", response_model=CircleDeployResponse)
def prepare_circle_contract_deploy(payload: CircleDeployRequest):
    contract_type = payload.contract_type.lower()

    if contract_type not in SUPPORTED_CIRCLE_CONTRACT_TYPES:
        supported_types = ", ".join(sorted(SUPPORTED_CIRCLE_CONTRACT_TYPES))
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported contract_type '{payload.contract_type}'. "
                f"Supported values: {supported_types}"
            ),
        )

    return prepare_contract_deploy(
        wallet=payload.wallet,
        contract_type=contract_type,
    )


@app.get("/circle/wallets/status")
def circle_wallets_status():
    return {
        "ready": True,
        "mode": "mock",
        "message": "Circle Wallets blueprint is ready",
    }


@app.post("/circle/wallets/create", response_model=CircleWalletCreateResponse)
def prepare_circle_wallet_create(payload: CircleWalletCreateRequest):
    wallet_type = payload.wallet_type.lower()

    if wallet_type not in SUPPORTED_CIRCLE_WALLET_TYPES:
        supported_types = ", ".join(sorted(SUPPORTED_CIRCLE_WALLET_TYPES))
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported wallet_type '{payload.wallet_type}'. "
                f"Supported values: {supported_types}"
            ),
        )

    return prepare_wallet_create(
        owner_wallet=payload.owner_wallet,
        wallet_type=wallet_type,
    )


@app.get("/circle/paymaster/status", response_model=GasSponsorshipStatusResponse)
def circle_paymaster_status():
    return {
        "ready": True,
        "mode": "mock",
        "message": "Paymaster blueprint is ready",
        "supported_actions": SUPPORTED_GAS_SPONSORSHIP_ACTIONS,
    }


@app.post(
    "/circle/paymaster/estimate",
    response_model=GasSponsorshipEstimateResponse,
)
def estimate_circle_paymaster(payload: GasSponsorshipEstimateRequest):
    action = payload.action.lower()

    if action not in SUPPORTED_GAS_SPONSORSHIP_ACTIONS:
        supported_actions = ", ".join(SUPPORTED_GAS_SPONSORSHIP_ACTIONS)
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported action '{payload.action}'. "
                f"Supported values: {supported_actions}"
            ),
        )

    return {
        "success": True,
        "mode": "mock",
        "wallet": payload.wallet,
        "action": action,
        "sponsored": False,
        "estimated_gas_usdc": None,
        "message": (
            "Gas sponsorship estimate prepared. Real Paymaster integration "
            "will be added later."
        ),
    }


@app.get("/passport/{wallet}")
def get_passport(wallet: str, db: Session = Depends(get_db)):
    try:
        passport = get_or_create_passport(db, wallet)
        stats = build_wallet_stats(wallet)
        deployment_count = get_deployment_count(db, wallet)

        scores = calculate_scores(stats, passport, deployment_count)
        achievements = build_achievements(
            passport,
            stats,
            deployment_count,
            scores["xp"],
        )

        today = date.today()
        checkin_available = passport.last_checkin_date != today

        return {
            "wallet": wallet,
            **passport_profile(passport),
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
            "deployment_count": deployment_count,
            "deployment_xp": scores["deployment_xp"],
            "xp_breakdown": {
                "onchain_xp": scores["onchain_xp"],
                "deployment_xp": scores["deployment_xp"],
                "checkin_xp": passport.checkin_xp,
                "total_xp": scores["xp"],
            },
            "achievements": achievements,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/passport/{wallet}/profile")
def update_passport_profile(
    wallet: str,
    payload: dict,
    db: Session = Depends(get_db),
):
    passport = get_or_create_passport(db, wallet)

    passport.display_name = validate_profile_field(
        payload.get("display_name"),
        "display_name",
        40,
    )
    passport.bio = validate_profile_field(payload.get("bio"), "bio", 160)
    passport.x_handle = validate_profile_field(
        payload.get("x_handle"),
        "x_handle",
        30,
    )
    passport.website = validate_profile_field(
        payload.get("website"),
        "website",
        120,
    )

    db.commit()
    db.refresh(passport)

    return {
        "wallet": passport.wallet,
        **passport_profile(passport),
    }


@app.post("/passport/{wallet}/mint")
def prepare_passport_mint(wallet: str, db: Session = Depends(get_db)):
    try:
        passport = get_or_create_passport(db, wallet)
        stats = build_wallet_stats(wallet)
        deployment_count = get_deployment_count(db, wallet)
        scores = calculate_scores(stats, passport, deployment_count)
        rank = calculate_user_rank(db, wallet)

        return {
            "success": True,
            "message": "Builder Passport mint prepared",
            "wallet": passport.wallet,
            "status": "ready",
            "metadata": {
                "name": "Arc Builder Passport",
                "description": "Persistent builder identity for Arc",
                "level": scores["level"],
                "xp": scores["xp"],
                "reputation": scores["reputation"],
                "rank": rank,
            },
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
    return {
        "leaderboard": build_leaderboard_entries(db)
    }


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_builders = db.query(Passport).count()
    total_deployments = db.query(Deployment).count()
    total_checkin_xp = db.query(func.coalesce(func.sum(Passport.checkin_xp), 0)).scalar()

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


@app.post("/deployment")
def save_deployment(payload: dict, db: Session = Depends(get_db)):
    wallet = payload["wallet"].lower()
    contract_address = payload["contract_address"]
    tx_hash = payload["tx_hash"]

    existing_deployment = (
        db.query(Deployment)
        .filter(Deployment.tx_hash == tx_hash)
        .first()
    )

    if existing_deployment:
        return {
            "success": True,
            "reward_xp": 0,
            "message": "Deployment already saved",
        }

    deployment = Deployment(
        wallet=wallet,
        contract_address=contract_address,
        tx_hash=tx_hash,
    )

    db.add(deployment)

    get_or_create_passport(db, wallet)

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
