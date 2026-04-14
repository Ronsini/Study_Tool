import uuid

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.models.subject import Subject, SubjectCreate, SubjectPublic, SubjectUpdate
from app.routers.deps import CurrentUser, DBSession

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("", response_model=list[SubjectPublic])
async def list_subjects(current_user: CurrentUser, session: DBSession):
    result = await session.exec(
        select(Subject).where(Subject.user_id == current_user.id)
    )
    return result.all()


@router.post("", response_model=SubjectPublic, status_code=status.HTTP_201_CREATED)
async def create_subject(body: SubjectCreate, current_user: CurrentUser, session: DBSession):
    subject = Subject(**body.model_dump(), user_id=current_user.id)
    session.add(subject)
    await session.commit()
    await session.refresh(subject)
    return subject


@router.patch("/{subject_id}", response_model=SubjectPublic)
async def update_subject(
    subject_id: uuid.UUID,
    body: SubjectUpdate,
    current_user: CurrentUser,
    session: DBSession,
):
    subject = await session.get(Subject, subject_id)
    if not subject or subject.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subject not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(subject, field, value)

    session.add(subject)
    await session.commit()
    await session.refresh(subject)
    return subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: uuid.UUID,
    current_user: CurrentUser,
    session: DBSession,
):
    subject = await session.get(Subject, subject_id)
    if not subject or subject.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subject not found")

    await session.delete(subject)
    await session.commit()
