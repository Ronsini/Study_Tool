import uuid
from datetime import datetime
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select

from app.models.session import Session, SessionPublic, SessionStart
from app.models.checkin import CheckIn
from app.models.subject import Subject
from app.models.focus import FocusPrediction
from app.routers.deps import CurrentUser, DBSession
from app.services.ai_service import generate_session_questions, generate_session_feedback
from app.services.focus_service import compute_focus_score, DISTRACTION_TYPES

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ── Distraction breakdown models ─────────────────────────────────────────────

class DistractionEvent(BaseModel):
    """One row in the distraction breakdown — grouped by type + source."""
    type: str            # internal key: "social_media", "video_site", "idle", etc.
    label: str           # human-readable: "Social media", "Video site", etc.
    source: str | None   # the specific app or domain, e.g. "youtube.com", "Discord"
    windows: int         # number of 30-second windows this distraction was detected
    minutes: float       # windows × 0.5


class SessionStopResponse(SessionPublic):
    """Session stop response — all SessionPublic fields plus distraction breakdown."""
    distraction_breakdown: list[DistractionEvent]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _extract_source(distraction_type: str, signals: dict) -> str | None:
    """Pull a human-readable source name from the raw signals."""
    if distraction_type not in ("social_media", "video_site"):
        return None
    browser_url = (signals.get("browser_url") or "").strip()
    active_app = (signals.get("active_app") or "").strip()
    if browser_url:
        try:
            netloc = urlparse(browser_url).netloc
            return netloc.replace("www.", "") or None
        except Exception:
            pass
    return active_app or None


def _build_breakdown(predictions: list[FocusPrediction]) -> list[DistractionEvent]:
    """
    Aggregate distracted windows into a breakdown list sorted by minutes desc.
    Groups by (type, source) so "youtube.com" and "reddit.com" are separate rows.
    """
    # key → {"windows": int}
    counts: dict[tuple[str, str | None], int] = {}

    for p in predictions:
        if p.is_focused:
            continue
        _, _, distraction_type = compute_focus_score(p.signals)
        if not distraction_type:
            continue
        source = _extract_source(distraction_type, p.signals)
        key = (distraction_type, source)
        counts[key] = counts.get(key, 0) + 1

    events: list[DistractionEvent] = []
    for (dtype, source), windows in counts.items():
        events.append(DistractionEvent(
            type=dtype,
            label=DISTRACTION_TYPES.get(dtype, dtype.replace("_", " ").title()),
            source=source,
            windows=windows,
            minutes=round(windows * 0.5, 1),
        ))

    return sorted(events, key=lambda e: e.minutes, reverse=True)


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=SessionPublic, status_code=status.HTTP_201_CREATED)
async def start_session(body: SessionStart, current_user: CurrentUser, session: DBSession):
    if current_user.active_session_id:
        raise HTTPException(status_code=400, detail="A session is already active")

    subject = await session.get(Subject, body.subject_id)
    if not subject or subject.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subject not found")

    new_session = Session(**body.model_dump(), user_id=current_user.id)
    session.add(new_session)
    await session.flush()

    # Generate check-in questions upfront — asked only when distraction detected
    questions = await generate_session_questions(body.topic, subject.name)
    for question_text in questions:
        checkin = CheckIn(
            session_id=new_session.id,
            user_id=current_user.id,
            question=question_text,
        )
        session.add(checkin)

    current_user.active_session_id = new_session.id
    session.add(current_user)
    await session.commit()
    await session.refresh(new_session)
    return new_session


@router.post("/stop", response_model=SessionStopResponse)
async def stop_session(current_user: CurrentUser, session: DBSession):
    if not current_user.active_session_id:
        raise HTTPException(status_code=400, detail="No active session")

    active_session = await session.get(Session, current_user.active_session_id)
    if not active_session:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.utcnow()
    active_session.ended_at = now
    total_minutes = int((now - active_session.started_at).total_seconds() / 60)
    active_session.total_minutes = total_minutes

    # Aggregate focus predictions from MongoDB
    predictions = await FocusPrediction.find(
        FocusPrediction.session_id == str(active_session.id)
    ).to_list()

    if predictions:
        avg_score = sum(p.focus_score for p in predictions) / len(predictions)
        focused_windows = sum(1 for p in predictions if p.is_focused)
        real_focus_min = min(round(focused_windows * 30 / 60), total_minutes)
        active_session.focus_score = avg_score
        active_session.real_focus_min = real_focus_min
        active_session.distraction_count = len(predictions) - focused_windows
    else:
        active_session.focus_score = 0.0
        active_session.real_focus_min = 0

    # Build distraction breakdown from predictions
    breakdown = _build_breakdown(predictions)

    # Get checkin stats for feedback
    result = await session.exec(
        select(CheckIn).where(CheckIn.session_id == active_session.id)
    )
    checkins = result.all()
    correct = sum(1 for c in checkins if c.is_correct)
    total_asked = sum(1 for c in checkins if c.user_answer or c.skipped)

    # Generate AI feedback — only for sessions with at least 1 minute of data
    subject = await session.get(Subject, active_session.subject_id)
    if subject and total_minutes >= 1:
        active_session.ai_feedback = await generate_session_feedback(
            subject=subject.name,
            topic=active_session.topic,
            real_focus_min=active_session.real_focus_min or 0,
            total_minutes=total_minutes,
            focus_score=active_session.focus_score or 0.0,
            checkins_correct=correct,
            checkins_total=total_asked,
        )

    current_user.active_session_id = None
    session.add(active_session)
    session.add(current_user)
    await session.commit()
    await session.refresh(active_session)

    return SessionStopResponse(
        **active_session.model_dump(),
        distraction_breakdown=breakdown,
    )


@router.get("", response_model=list[SessionPublic])
async def list_sessions(
    current_user: CurrentUser,
    session: DBSession,
    limit: int = 20,
    offset: int = 0,
):
    result = await session.exec(
        select(Session)
        .where(Session.user_id == current_user.id)
        .order_by(Session.started_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.all()


@router.get("/{session_id}", response_model=SessionPublic)
async def get_session(
    session_id: uuid.UUID,
    current_user: CurrentUser,
    session: DBSession,
):
    s = await session.get(Session, session_id)
    if not s or s.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    return s
