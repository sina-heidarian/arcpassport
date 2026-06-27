from datetime import datetime, date
from sqlalchemy import Boolean, Column, String, Integer, Date, DateTime, UniqueConstraint
from app.database import Base

class Passport(Base):
    __tablename__ = "passports"

    wallet = Column(String, primary_key=True, index=True)

    checkin_xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_checkin_date = Column(Date, nullable=True)

    display_name = Column(String(40), nullable=True)
    bio = Column(String(160), nullable=True)
    x_handle = Column(String(30), nullable=True)
    website = Column(String(120), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, index=True)
    contract_address = Column(String)
    tx_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    xp_reward = Column(Integer, nullable=False)
    requirement_type = Column(String, unique=True, index=True, nullable=False)
    requirement_value = Column(Integer, nullable=False)
    is_repeatable = Column(Boolean, default=False)


class QuestCompletion(Base):
    __tablename__ = "quest_completions"
    __table_args__ = (
        UniqueConstraint("wallet", "quest_id", name="uq_quest_completion_wallet_quest"),
    )

    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, index=True, nullable=False)
    quest_id = Column(Integer, index=True, nullable=False)
    xp_reward = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
