import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.focus import FocusPrediction
from app.routers.deps import CurrentUser

router = APIRouter(prefix="/focus", tags=["focus"])


class FocusStatus(BaseModel):
    session_id: str
    is_focused: bool
    focus_score: float
    distraction_type: str | None


@router.get("/status/{session_id}", response_model=FocusStatus | None)
async def get_focus_status(session_id: str, current_user: CurrentUser):
    """Returns the most recent focus prediction for the active session."""
    prediction = await FocusPrediction.find(
        FocusPrediction.session_id == session_id,
        FocusPrediction.user_id == str(current_user.id),
    ).sort(-FocusPrediction.window_end).first_or_none()

    if not prediction:
        return None

    from app.services.focus_service import compute_focus_score
    _, _, distraction_type = compute_focus_score(prediction.signals)

    return FocusStatus(
        session_id=session_id,
        is_focused=prediction.is_focused,
        focus_score=prediction.focus_score,
        distraction_type=distraction_type,
    )


@router.get("/history/{session_id}")
async def get_focus_history(session_id: str, current_user: CurrentUser):
    """Returns all focus predictions for a session — used to build the timeline."""
    predictions = await FocusPrediction.find(
        FocusPrediction.session_id == session_id,
        FocusPrediction.user_id == str(current_user.id),
    ).sort(FocusPrediction.window_start).to_list()

    return [
        {
            "window_start": p.window_start,
            "window_end": p.window_end,
            "focus_score": p.focus_score,
            "is_focused": p.is_focused,
        }
        for p in predictions
    ]
