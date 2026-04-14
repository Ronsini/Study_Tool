from fastapi import APIRouter, HTTPException, status

from app.models.user import UserPublic, UserUpdate
from app.routers.deps import CurrentUser, DBSession

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserPublic)
async def update_me(body: UserUpdate, current_user: CurrentUser, session: DBSession):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    from datetime import datetime
    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(current_user: CurrentUser, session: DBSession):
    await session.delete(current_user)
    await session.commit()
