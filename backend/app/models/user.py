import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class SubscriptionTier(str, Enum):
    free = "free"
    pro = "pro"
    university = "university"


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    name: str
    avatar_url: Optional[str] = None
    subscription: SubscriptionTier = SubscriptionTier.free
    daily_goal_min: int = Field(default=120)
    google_id: Optional[str] = Field(default=None, index=True)
    apple_id: Optional[str] = Field(default=None, index=True)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    hashed_password: Optional[str] = None
    active_session_id: Optional[uuid.UUID] = Field(default=None)  # no FK — avoids circular dependency with sessions
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    email: str
    name: str
    password: str


class UserUpdate(SQLModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    daily_goal_min: Optional[int] = None


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime
