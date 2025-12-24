"""
Database engine/session setup.

This module centralizes SQLAlchemy async engine creation, session lifecycle,
and schema initialization.
"""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from src.core.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


engine = create_async_engine(settings.DATABASE_URL)

async_session_maker = async_sessionmaker(
    bind=engine, expire_on_commit=False, autocommit=False, autoflush=False
)


async def create_db_and_tables() -> None:
    """
    Create all database tables for registered ORM models.

    Intended to be called at application startup.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Ensures sessions are always closed after request completion.
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
