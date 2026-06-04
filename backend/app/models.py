from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime
from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

class Passport(Base):
    __tablename__ = "passports"

    wallet = Column(String, primary_key=True, index=True)

    checkin_xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_checkin_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    wallet = Column(String, index=True)
    contract_address = Column(String)
    tx_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)