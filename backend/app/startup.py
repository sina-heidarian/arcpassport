import logging
from time import sleep

from sqlalchemy import text

from app.database import Base, engine
from app.services.quests import seed_default_quests

logger = logging.getLogger(__name__)


def wait_for_database(max_retries=30, delay_seconds=1):
    """Wait for PostgreSQL to accept connections before table setup."""
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect():
                logger.info("Database connection established")
                return
        except Exception as error:
            last_error = error
            logger.warning(
                "Database not ready (%s/%s): %s",
                attempt,
                max_retries,
                error,
            )
            sleep(delay_seconds)

    raise RuntimeError(
        "Database did not become available after "
        f"{max_retries} retries. Last error: {last_error}"
    )


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
        """
        CREATE TABLE IF NOT EXISTS quests (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            description VARCHAR NOT NULL,
            category VARCHAR NOT NULL,
            xp_reward INTEGER NOT NULL,
            requirement_type VARCHAR NOT NULL UNIQUE,
            requirement_value INTEGER NOT NULL,
            is_repeatable BOOLEAN DEFAULT FALSE
        )
        """,
        "CREATE INDEX IF NOT EXISTS ix_quests_id ON quests (id)",
        """
        CREATE INDEX IF NOT EXISTS ix_quests_requirement_type
        ON quests (requirement_type)
        """,
        """
        CREATE TABLE IF NOT EXISTS quest_completions (
            id SERIAL PRIMARY KEY,
            wallet VARCHAR NOT NULL,
            quest_id INTEGER NOT NULL,
            xp_reward INTEGER NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_quest_completion_wallet_quest UNIQUE (wallet, quest_id)
        )
        """,
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_quest_completion_wallet_quest
        ON quest_completions (wallet, quest_id)
        """,
        "CREATE INDEX IF NOT EXISTS ix_quest_completions_id ON quest_completions (id)",
        """
        CREATE INDEX IF NOT EXISTS ix_quest_completions_wallet
        ON quest_completions (wallet)
        """,
        """
        CREATE INDEX IF NOT EXISTS ix_quest_completions_quest_id
        ON quest_completions (quest_id)
        """,
        """
        CREATE TABLE IF NOT EXISTS sync_statuses (
            wallet VARCHAR PRIMARY KEY,
            last_sync_at TIMESTAMP NULL,
            syncing BOOLEAN DEFAULT FALSE,
            latest_block INTEGER NULL,
            network VARCHAR DEFAULT 'Arc Testnet',
            latest_stats JSON NULL,
            last_error VARCHAR(240) NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        "CREATE INDEX IF NOT EXISTS ix_sync_statuses_wallet ON sync_statuses (wallet)",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP NULL",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS syncing BOOLEAN DEFAULT FALSE",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS latest_block INTEGER NULL",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS network VARCHAR DEFAULT 'Arc Testnet'",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS latest_stats JSON NULL",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS last_error VARCHAR(240) NULL",
        "ALTER TABLE sync_statuses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    ]

    with engine.begin() as connection:
        for migration in migrations:
            connection.execute(text(migration))
    logger.info("Local additive migrations checked")


def initialize_backend():
    wait_for_database()
    Base.metadata.create_all(bind=engine)
    logger.info("Database metadata checked")
    run_local_migrations()
    seed_default_quests()
    logger.info("Default quests checked")
