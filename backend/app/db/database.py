"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    # Fix for Pydantic + SQLAlchemy 2.0 compatibility issue
    future=True
)

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    # Disable join_transaction_mode parameter to avoid Pydantic validation error
    expire_on_commit=False
)

# Create Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session
    Yields database session and closes it after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
