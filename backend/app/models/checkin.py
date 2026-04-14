import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class CheckIn(SQLModel, table=True):
    __tablename__ = "checkins"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    session_id: uuid.UUID = Field(foreign_key="sessions.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    question: str
    user_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    asked_at: datetime = Field(default_factory=datetime.utcnow)
    answered_at: Optional[datetime] = None
    skipped: bool = Field(default=False)


class CheckInAnswer(SQLModel):
    checkin_id: uuid.UUID
    answer: str


class CheckInPublic(SQLModel):
    id: uuid.UUID
    session_id: uuid.UUID
    question: str
    user_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    asked_at: datetime
    answered_at: Optional[datetime] = None
    skipped: bool
