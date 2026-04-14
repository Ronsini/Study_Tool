import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class StudyMode(str, Enum):
    mac_pc = "mac_pc"
    physical_book = "physical_book"
    physical_writing = "physical_writing"
    ipad = "ipad"
    lecture = "lecture"
    mix = "mix"


class SessionBase(SQLModel):
    subject_id: uuid.UUID = Field(foreign_key="subjects.id")
    topic: str
    section: Optional[str] = None
    study_mode: StudyMode
    duration_goal_min: int
    goal: Optional[str] = None


class Session(SessionBase, table=True):
    __tablename__ = "sessions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    total_minutes: Optional[int] = None
    real_focus_min: Optional[int] = None
    focus_score: Optional[float] = None
    distraction_count: int = Field(default=0)
    ai_feedback: Optional[str] = None


class SessionStart(SQLModel):
    subject_id: uuid.UUID
    topic: str
    section: Optional[str] = None
    study_mode: StudyMode
    duration_goal_min: int
    goal: Optional[str] = None


class SessionPublic(SessionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    started_at: datetime
    ended_at: Optional[datetime] = None
    total_minutes: Optional[int] = None
    real_focus_min: Optional[int] = None
    focus_score: Optional[float] = None
    distraction_count: int
    ai_feedback: Optional[str] = None
