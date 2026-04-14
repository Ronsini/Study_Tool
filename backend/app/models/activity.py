from datetime import datetime
from typing import Any, Optional

from beanie import Document
from pydantic import Field


class ActivityEvent(Document):
    user_id: str
    session_id: str
    event_type: str
    timestamp_ms: int
    payload: dict[str, Any] = Field(default_factory=dict)

    class Settings:
        name = "activity_events"
        indexes = [
            "user_id",
            "session_id",
            "event_type",
        ]
