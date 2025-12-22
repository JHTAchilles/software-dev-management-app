from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.sql import func

from src.db.database import get_async_session
from src.schemas.user import UserCreate, UserResponse, Token
from src.models.user import User
from src.models.license_key import LicenseKey
from src.utils.security import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
)
from src.core.config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    user_data: UserCreate, db: AsyncSession = Depends(get_async_session)
):
    """
    Register a new user.

    - **username**: unique username (3-50 characters)
    - **email**: valid email address
    - **password**: password (minimum 6 characters)
    - **license_key**: valid license key required for registration
    """
    # Validate license key
    if not user_data.license_key or not user_data.license_key.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License key is required",
        )

    # Check if license key exists and is active
    license_result = await db.execute(
        select(LicenseKey).where(LicenseKey.key == user_data.license_key.upper())
    )
    license_key = license_result.scalar_one_or_none()

    if not license_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid license key",
        )

    if not license_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid license key",
        )

    # Check if username already exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    print(f"user_data.password:{user_data.password} ,length:{len(user_data.password)}")
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Mark license key as used
    license_key.is_active = False  # type: ignore[assignment]
    license_key.used_at = datetime.now()  # type: ignore[assignment]
    license_key.used_by_user_id = db_user.id  # type: ignore[assignment]
    await db.commit()

    return db_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Login with username and password to get an access token.

    - **username**: your username
    - **password**: your password
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    Requires authentication token.
    """
    return current_user
