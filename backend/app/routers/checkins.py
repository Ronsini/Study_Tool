import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from app.models.checkin import CheckIn, CheckInAnswer, CheckInPublic
from app.routers.deps import CurrentUser, DBSession
from app.services.ai_service import evaluate_answer
from app.models.session import Session

router = APIRouter(prefix="/checkins", tags=["checkins"])


class CheckInQuestion(BaseModel):
    checkin_id: uuid.UUID
    question: str


@router.get("/next/{session_id}", response_model=CheckInQuestion | None)
async def get_next_question(
    session_id: uuid.UUID,
    current_user: CurrentUser,
    session: DBSession,
):
    """
    Returns the next unanswered question for this session.
    Called by the desktop app only after a distraction is detected.
    Returns null if all questions have been asked.
    """
    result = await session.exec(
        select(CheckIn)
        .where(CheckIn.session_id == session_id)
        .where(CheckIn.user_id == current_user.id)
        .where(CheckIn.user_answer == None)
        .where(CheckIn.skipped == False)
        .where(CheckIn.asked_at == None)
    )
    checkin = result.first()

    if not checkin:
        return None

    checkin.asked_at = datetime.utcnow()
    session.add(checkin)
    await session.commit()

    return CheckInQuestion(checkin_id=checkin.id, question=checkin.question)


@router.post("/answer", response_model=CheckInPublic)
async def answer_question(
    body: CheckInAnswer,
    current_user: CurrentUser,
    session: DBSession,
):
    checkin = await session.get(CheckIn, body.checkin_id)
    if not checkin or checkin.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Check-in not found")

    active_session = await session.get(Session, checkin.session_id)
    topic = active_session.topic if active_session else "the topic"

    is_correct, _ = await evaluate_answer(checkin.question, body.answer, topic)

    checkin.user_answer = body.answer
    checkin.is_correct = is_correct
    checkin.answered_at = datetime.utcnow()
    session.add(checkin)
    await session.commit()
    await session.refresh(checkin)
    return checkin


@router.post("/skip/{checkin_id}", response_model=CheckInPublic)
async def skip_question(
    checkin_id: uuid.UUID,
    current_user: CurrentUser,
    session: DBSession,
):
    checkin = await session.get(CheckIn, checkin_id)
    if not checkin or checkin.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Check-in not found")

    checkin.skipped = True
    session.add(checkin)
    await session.commit()
    await session.refresh(checkin)
    return checkin
