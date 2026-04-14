from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel
from sqlmodel import select, func

from app.models.session import Session
from app.models.subject import Subject
from app.routers.deps import CurrentUser, DBSession

router = APIRouter(prefix="/insights", tags=["insights"])


class DailyInsight(BaseModel):
    date: str
    real_focus_min: int
    total_sessions: int
    best_streak_min: int
    goal_hit: bool
    by_subject: list[dict]


class WeeklyInsight(BaseModel):
    week_start: str
    week_end: str
    total_real_focus_min: int
    total_sessions: int
    best_day: str
    daily_breakdown: list[dict]
    goal_hit: bool


class SubjectInsight(BaseModel):
    subject_id: str
    subject_name: str
    total_hours: float
    avg_focus_score: float
    avg_retention: float
    trend: str


class StreakInsight(BaseModel):
    current_streak_days: int
    longest_streak_days: int
    daily_goal_min: int


@router.get("/daily", response_model=DailyInsight)
async def get_daily_insights(current_user: CurrentUser, session: DBSession):
    today = datetime.utcnow().date()
    start = datetime.combine(today, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())

    result = await session.exec(
        select(Session)
        .where(Session.user_id == current_user.id)
        .where(Session.started_at >= start)
        .where(Session.started_at <= end)
        .where(Session.ended_at != None)
    )
    sessions = result.all()

    total_focus = sum(s.real_focus_min or 0 for s in sessions)
    best_streak = max((s.real_focus_min or 0 for s in sessions), default=0)
    goal_hit = total_focus >= current_user.daily_goal_min

    by_subject: dict[str, int] = {}
    for s in sessions:
        key = str(s.subject_id)
        by_subject[key] = by_subject.get(key, 0) + (s.real_focus_min or 0)

    return DailyInsight(
        date=today.isoformat(),
        real_focus_min=total_focus,
        total_sessions=len(sessions),
        best_streak_min=best_streak,
        goal_hit=goal_hit,
        by_subject=[{"subject_id": k, "minutes": v} for k, v in by_subject.items()],
    )


@router.get("/weekly", response_model=WeeklyInsight)
async def get_weekly_insights(current_user: CurrentUser, session: DBSession):
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    start_dt = datetime.combine(week_start, datetime.min.time())
    end_dt = datetime.combine(week_end, datetime.max.time())

    result = await session.exec(
        select(Session)
        .where(Session.user_id == current_user.id)
        .where(Session.started_at >= start_dt)
        .where(Session.started_at <= end_dt)
        .where(Session.ended_at != None)
    )
    sessions = result.all()

    daily_focus: dict[str, int] = {}
    for s in sessions:
        day = s.started_at.date().isoformat()
        daily_focus[day] = daily_focus.get(day, 0) + (s.real_focus_min or 0)

    best_day = max(daily_focus, key=daily_focus.get) if daily_focus else week_start.isoformat()
    total_focus = sum(daily_focus.values())
    weekly_goal = current_user.daily_goal_min * 5

    return WeeklyInsight(
        week_start=week_start.isoformat(),
        week_end=week_end.isoformat(),
        total_real_focus_min=total_focus,
        total_sessions=len(sessions),
        best_day=best_day,
        daily_breakdown=[{"date": k, "minutes": v} for k, v in daily_focus.items()],
        goal_hit=total_focus >= weekly_goal,
    )


@router.get("/subjects", response_model=list[SubjectInsight])
async def get_subject_insights(current_user: CurrentUser, session: DBSession):
    result = await session.exec(
        select(Session)
        .where(Session.user_id == current_user.id)
        .where(Session.ended_at != None)
    )
    sessions = result.all()

    subject_data: dict[str, dict] = {}
    for s in sessions:
        key = str(s.subject_id)
        if key not in subject_data:
            subject_data[key] = {"minutes": 0, "scores": [], "correct": 0, "total": 0}
        subject_data[key]["minutes"] += s.real_focus_min or 0
        if s.focus_score is not None:
            subject_data[key]["scores"].append(s.focus_score)

    subjects_result = await session.exec(
        select(Subject).where(Subject.user_id == current_user.id)
    )
    subjects = {str(s.id): s for s in subjects_result.all()}

    insights = []
    for subject_id, data in subject_data.items():
        subj = subjects.get(subject_id)
        if not subj:
            continue
        avg_score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0.0
        insights.append(SubjectInsight(
            subject_id=subject_id,
            subject_name=subj.name,
            total_hours=round(data["minutes"] / 60, 1),
            avg_focus_score=round(avg_score, 2),
            avg_retention=round(avg_score * 0.9, 2),
            trend="up",
        ))

    return insights


@router.get("/streaks", response_model=StreakInsight)
async def get_streaks(current_user: CurrentUser, session: DBSession):
    result = await session.exec(
        select(Session)
        .where(Session.user_id == current_user.id)
        .where(Session.ended_at != None)
        .order_by(Session.started_at.desc())
    )
    sessions = result.all()

    daily_focus: dict = {}
    for s in sessions:
        day = s.started_at.date()
        daily_focus[day] = daily_focus.get(day, 0) + (s.real_focus_min or 0)

    goal = current_user.daily_goal_min
    sorted_days = sorted(daily_focus.keys(), reverse=True)

    current_streak = 0
    today = datetime.utcnow().date()
    check_day = today

    for day in sorted_days:
        if day == check_day and daily_focus[day] >= goal:
            current_streak += 1
            check_day -= timedelta(days=1)
        elif day < check_day:
            break

    longest = 0
    streak = 0
    for day in sorted(daily_focus.keys()):
        if daily_focus[day] >= goal:
            streak += 1
            longest = max(longest, streak)
        else:
            streak = 0

    return StreakInsight(
        current_streak_days=current_streak,
        longest_streak_days=longest,
        daily_goal_min=goal,
    )
