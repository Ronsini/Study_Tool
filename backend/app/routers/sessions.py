import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.models.session import Session, SessionPublic, SessionStart
from app.models.checkin import CheckIn
from app.models.subject import Subject
from app.routers.deps import CurrentUser, DBSession
from app.services.ai_service import generate_session_questions, generate_session_feedback

router = APIRouter(prefix="/sessions", tags=["sessions"])


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


@router.post("/stop", response_model=SessionPublic)
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

    # Get checkin stats for feedback
    result = await session.exec(
        select(CheckIn).where(CheckIn.session_id == active_session.id)
    )
    checkins = result.all()
    correct = sum(1 for c in checkins if c.is_correct)
    total_asked = sum(1 for c in checkins if c.user_answer or c.skipped)

    # Generate AI feedback summary
    subject = await session.get(Subject, active_session.subject_id)
    if subject and active_session.focus_score is not None:
        active_session.ai_feedback = await generate_session_feedback(
            subject=subject.name,
            topic=active_session.topic,
            real_focus_min=active_session.real_focus_min or 0,
            total_minutes=total_minutes,
            focus_score=active_session.focus_score,
            checkins_correct=correct,
            checkins_total=total_asked,
        )

    current_user.active_session_id = None
    session.add(active_session)
    session.add(current_user)
    await session.commit()
    await session.refresh(active_session)
    return active_session


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
