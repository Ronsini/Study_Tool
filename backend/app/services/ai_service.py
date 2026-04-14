"""
AI Check-in Service — Anthropic Claude API

CRITICAL RULE (from CLAUDE.md):
Questions ONLY fire when a distraction is already detected.
Never interrupt the user during active focus.
The caller (focus router) is responsible for only calling
get_next_checkin_question() when is_focused == False.
"""

import uuid
from datetime import datetime
from typing import Optional

import anthropic
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.config import settings
from app.models.checkin import CheckIn

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


async def generate_session_questions(topic: str, subject: str) -> list[str]:
    """
    Generate 3-5 questions before a session starts.
    Ordered by difficulty: recall → understanding → application.
    Called once at session start, stored, asked only on distraction.
    """
    prompt = f"""You are a study partner helping a student review {subject}: {topic}.

Generate exactly 4 questions in order of difficulty:
1. A recall question (basic facts, definitions)
2. Another recall question (slightly harder)
3. An understanding question (why/how something works)
4. An application question (how they would use this knowledge)

Rules:
- Keep each question under 20 words
- Be specific to the topic, not generic
- Sound like a curious study partner, not a teacher or examiner
- No numbering, no preamble — just the questions, one per line

Topic: {topic}"""

    message = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    questions = [q.strip() for q in raw.split("\n") if q.strip()]
    return questions[:4]


async def get_next_checkin_question(
    session: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Optional[CheckIn]:
    """
    Returns the next unanswered, unskipped check-in for this session.
    Returns None if all questions have been asked or session has no questions.

    ONLY called when a distraction has already been detected.
    """
    result = await session.exec(
        select(CheckIn)
        .where(CheckIn.session_id == session_id)
        .where(CheckIn.user_id == user_id)
        .where(CheckIn.skipped == False)
        .where(CheckIn.user_answer == None)
        .where(CheckIn.asked_at == None)
        .order_by(CheckIn.asked_at)
    )
    return result.first()


async def evaluate_answer(question: str, answer: str, topic: str) -> tuple[bool, str]:
    """
    Evaluates a student's answer. Returns (is_correct, feedback).
    Tone: study partner, never teacher. Never says 'WRONG'.
    """
    prompt = f"""A student is studying: {topic}

Question asked: {question}
Student's answer: {answer}

Evaluate their answer briefly (1-2 sentences max).
- If correct or mostly correct: affirm it naturally, like a study partner would
- If incorrect or incomplete: say something like "Good thinking — the key point to revisit is..."
- Never say "Wrong", "Incorrect", or "That's not right"
- Never be condescending
- End with whether they got it (true/false) on the last line in format: CORRECT: true or CORRECT: false"""

    message = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    lines = raw.split("\n")
    verdict_line = lines[-1] if lines else ""
    is_correct = "true" in verdict_line.lower()
    feedback = "\n".join(lines[:-1]).strip()

    return is_correct, feedback


async def generate_session_feedback(
    subject: str,
    topic: str,
    real_focus_min: int,
    total_minutes: int,
    focus_score: float,
    checkins_correct: int,
    checkins_total: int,
) -> str:
    """
    Generates the end-of-session feedback paragraph shown in the summary screen.
    Honest, encouraging, specific to the session data.
    """
    prompt = f"""A student just finished a study session. Write 2-3 sentences of honest, specific feedback.

Session data:
- Subject: {subject}
- Topic: {topic}
- Real focus time: {real_focus_min} out of {total_minutes} minutes
- Focus score: {int(focus_score * 100)}%
- Knowledge checks: {checkins_correct} out of {checkins_total} correct

Rules:
- Sound like a smart study partner, not a grading system
- Be specific to their data — reference the actual numbers
- If focus was strong, say so genuinely
- If they need to review something, say it kindly and specifically
- Keep it under 60 words
- No bullet points, just a short paragraph"""

    message = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}],
    )

    return message.content[0].text.strip()
