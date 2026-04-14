import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class SubjectBase(SQLModel):
    name: str
    color: str = Field(default="#6366f1")


class Subject(SubjectBase, table=True):
    __tablename__ = "subjects"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(SQLModel):
    name: Optional[str] = None
    color: Optional[str] = None


class SubjectPublic(SubjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
