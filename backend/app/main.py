from time import sleep

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.routers import (
    circle,
    deployments,
    leaderboard,
    passport,
    stats,
)


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

app.include_router(passport.router)
app.include_router(leaderboard.router)
app.include_router(stats.router)
app.include_router(deployments.router)
app.include_router(circle.router)


@app.get("/")
def root():
    return {"message": "ArcPassport API running"}
