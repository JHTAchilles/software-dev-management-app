from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import uuid

from src.schemas.user import UserResponse
from src.db.database import get_async_session

from src.models.user import User
from src.utils.security import get_current_user


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/id/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: uuid.UUID,
    # current_user: User = Depends(get_current_user), # disabled auth
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get user by user ID.
    """
    # Query the user by id.
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


@router.get("/username/{username}", response_model=UserResponse)
async def get_user_by_username(
    username: str,
    # current_user: User = Depends(get_current_user), # disabled auth
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get user by username.
    """
    # Query user by their username.
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user
