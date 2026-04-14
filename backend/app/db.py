from typing import AsyncGenerator

import redis.asyncio as aioredis
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.config import settings

# ── PostgreSQL ────────────────────────────────────────────────

engine = create_async_engine(
    settings.database_url,
    echo=not settings.is_production,
    future=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_postgres() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


# ── MongoDB ───────────────────────────────────────────────────

mongo_client: AsyncIOMotorClient | None = None


async def init_mongo() -> None:
    global mongo_client
    from app.models.activity import ActivityEvent
    from app.models.focus import FocusPrediction

    mongo_client = AsyncIOMotorClient(settings.mongo_url)
    await init_beanie(
        database=mongo_client[settings.mongo_db_name],
        document_models=[ActivityEvent, FocusPrediction],
    )


async def close_mongo() -> None:
    if mongo_client:
        mongo_client.close()


# ── Redis ─────────────────────────────────────────────────────

redis_client: aioredis.Redis | None = None


async def init_redis() -> None:
    global redis_client
    redis_client = await aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )


async def close_redis() -> None:
    if redis_client:
        await redis_client.aclose()


def get_redis() -> aioredis.Redis:
    if redis_client is None:
        raise RuntimeError("Redis not initialized")
    return redis_client
