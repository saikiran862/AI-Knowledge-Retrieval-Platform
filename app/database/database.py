"""
SQLite Database Connection and Session Management
"""

import os
from typing import Any
from app.config.settings import settings

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, declarative_base
    HAVE_SQLALCHEMY = True
    DATABASE_URL = f"sqlite:///{settings.DATABASE_PATH}"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except ImportError:
    HAVE_SQLALCHEMY = False
    DATABASE_URL = ""
    engine = None
    SessionLocal = None
    class Base:  # type: ignore
        pass


def get_db():
    """FastAPI Dependency for database session injection."""
    if not SessionLocal:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables on startup."""
    Base.metadata.create_all(bind=engine)
