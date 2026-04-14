from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import close_mongo, close_redis, init_mongo, init_postgres, init_redis
from app.routers import auth, users, subjects, sessions, activity, focus, checkins, insights


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_postgres()
    await init_mongo()
    await init_redis()
    yield
    # Shutdown
    await close_mongo()
    await close_redis()


app = FastAPI(
    title="Study Tool API",
    description="Backend for the Study Tool focus tracking app",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subjects.router)
app.include_router(sessions.router)
app.include_router(activity.router)
app.include_router(focus.router)
app.include_router(checkins.router)
app.include_router(insights.router)


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.environment}
