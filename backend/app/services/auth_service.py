from datetime import datetime, timedelta
from typing import Optional
import uuid

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: uuid.UUID) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    result = await session.exec(select(User).where(User.email == email))
    return result.first()


async def get_user_by_id(session: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    return await session.get(User, user_id)


async def authenticate_user(
    session: AsyncSession, email: str, password: str
) -> Optional[User]:
    user = await get_user_by_email(session, email)
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
