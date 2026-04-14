from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.models.activity import ActivityEvent
from app.routers.deps import CurrentUser
from app.services.focus_service import compute_focus_score, save_focus_prediction

router = APIRouter(prefix="/activity", tags=["activity"])


class ActivityPayload(BaseModel):
    session_id: str
    event_type: str
    timestamp_ms: int
    signals: dict
    window_start: int
    window_end: int


class ActivityResponse(BaseModel):
    is_focused: bool
    focus_score: float
    distraction_type: str | None
    fire_checkin: bool


@router.post("", response_model=ActivityResponse)
async def ingest_activity(body: ActivityPayload, current_user: CurrentUser):
    """
    Receives focus signals from the desktop app every 30 seconds.
    Returns whether user is focused and if a check-in should fire.
    Check-ins ONLY fire when is_focused is False.
    """
    # Store raw event in MongoDB
    event = ActivityEvent(
        user_id=str(current_user.id),
        session_id=body.session_id,
        event_type=body.event_type,
        timestamp_ms=body.timestamp_ms,
        payload=body.signals,
    )
    await event.insert()

    # Score the focus window
    score, is_focused, distraction_type = compute_focus_score(body.signals)

    # Save prediction to MongoDB
    await save_focus_prediction(
        user_id=str(current_user.id),
        session_id=body.session_id,
        window_start=body.window_start,
        window_end=body.window_end,
        signals=body.signals,
    )

    # Check-in fires ONLY when distracted — never during focus
    fire_checkin = not is_focused and distraction_type is not None

    return ActivityResponse(
        is_focused=is_focused,
        focus_score=score,
        distraction_type=distraction_type,
        fire_checkin=fire_checkin,
    )
