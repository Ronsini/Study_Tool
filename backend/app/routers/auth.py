from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.config import settings
from app.db import get_session
from app.models.user import User, UserCreate, UserPublic
from app.routers.deps import DBSession
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_by_email,
    get_user_by_id,
    hash_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    code: str


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, session: DBSession):
    existing = await get_user_by_email(session, body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: DBSession):
    user = await authenticate_user(session, body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, session: DBSession):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    import uuid
    user = await get_user_by_id(session, uuid.UUID(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest, session: DBSession):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": body.code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": "postmessage",
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Google code")

        google_token = token_resp.json()["access_token"]

        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {google_token}"},
        )
        userinfo = userinfo_resp.json()

    google_id = userinfo["id"]
    email = userinfo["email"]
    name = userinfo.get("name", email.split("@")[0])
    avatar_url = userinfo.get("picture")

    from sqlmodel import select
    result = await session.exec(select(User).where(User.google_id == google_id))
    user = result.first()

    if not user:
        user = await get_user_by_email(session, email)
        if user:
            user.google_id = google_id
            user.avatar_url = avatar_url or user.avatar_url
        else:
            user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                google_id=google_id,
            )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    # JWT is stateless — client discards tokens
    # Future: add token to Redis denylist here
    return
