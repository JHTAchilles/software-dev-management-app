from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import secrets
import string

from src.db.database import get_async_session
from src.models.license_key import LicenseKey
from src.schemas.license_key import (
    LicenseKeyCreate,
    LicenseKeyResponse,
    LicenseKeyActivate,
    LicenseKeyValidate,
    LicenseKeyValidationResponse,
)
from src.models.user import User
from src.utils.security import get_current_user


router = APIRouter(prefix="/license-keys", tags=["License Keys"])


def generate_license_key() -> str:
    """Generate a random license key in format AAAA-BBBB-CCCC-DDDD"""
    chars = string.ascii_uppercase + string.digits
    parts = []
    for _ in range(4):
        part = "".join(secrets.choice(chars) for _ in range(4))
        parts.append(part)
    return "-".join(parts)


@router.post(
    "/generate", response_model=LicenseKeyResponse, status_code=status.HTTP_201_CREATED
)
async def create_license_key(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a new license key (admin only).
    For now, any authenticated user can generate keys.
    """
    # Generate a unique key
    max_attempts = 10
    for _ in range(max_attempts):
        key = generate_license_key()

        # Check if key already exists
        result = await db.execute(select(LicenseKey).where(LicenseKey.key == key))
        if not result.scalar_one_or_none():
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate unique license key",
        )

    # Create new license key
    license_key = LicenseKey(key=key)
    db.add(license_key)
    await db.commit()
    await db.refresh(license_key)

    return license_key


@router.post(
    "/create", response_model=LicenseKeyResponse, status_code=status.HTTP_201_CREATED
)
async def create_custom_license_key(
    license_data: LicenseKeyCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """
    Create a license key with a custom key string.
    """
    # Check if key already exists
    result = await db.execute(
        select(LicenseKey).where(LicenseKey.key == license_data.key)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="License key already exists"
        )

    # Create new license key
    license_key = LicenseKey(key=license_data.key)
    db.add(license_key)
    await db.commit()
    await db.refresh(license_key)

    return license_key


@router.post("/validate", response_model=LicenseKeyValidationResponse)
async def validate_license_key(
    payload: LicenseKeyValidate,
    db: AsyncSession = Depends(get_async_session),
):
    """Validate that a license key exists and is active/unused.

    This endpoint is intentionally unauthenticated to support pre-registration checks.
    """
    key = (payload.key or "").strip().upper()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License key is required",
        )

    result = await db.execute(select(LicenseKey).where(LicenseKey.key == key))
    license_key = result.scalar_one_or_none()

    if not license_key or not license_key.is_active or license_key.used_by_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid license key",
        )

    return {"valid": True}


@router.get("/", response_model=List[LicenseKeyResponse])
async def list_license_keys(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_session),
    _current_user: User = Depends(get_current_user),
):
    """
    List all license keys.
    """
    result = await db.execute(
        select(LicenseKey)
        .order_by(LicenseKey.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    license_keys = result.scalars().all()
    return license_keys


@router.get("/{key_id}", response_model=LicenseKeyResponse)
async def get_license_key(
    key_id: str,
    db: AsyncSession = Depends(get_async_session),
    _current_user: User = Depends(get_current_user),
):
    """
    Get a specific license key by key string.
    """
    result = await db.execute(select(LicenseKey).where(LicenseKey.key == key_id))
    license_key = result.scalar_one_or_none()

    if not license_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="License key not found"
        )

    return license_key


@router.patch("/{key_id}", response_model=LicenseKeyResponse)
async def update_license_key(
    key_id: str,
    update_data: LicenseKeyActivate,
    db: AsyncSession = Depends(get_async_session),
    _current_user: User = Depends(get_current_user),
):
    """
    Update a license key's active status.
    """
    result = await db.execute(select(LicenseKey).where(LicenseKey.key == key_id))
    license_key = result.scalar_one_or_none()

    if not license_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="License key not found"
        )

    license_key.is_active = update_data.is_active
    await db.commit()
    await db.refresh(license_key)

    return license_key


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_license_key(
    key_id: str,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a license key (admin only).
    """
    result = await db.execute(select(LicenseKey).where(LicenseKey.key == key_id))
    license_key = result.scalar_one_or_none()

    if not license_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="License key not found"
        )

    await db.delete(license_key)
    await db.commit()

    return None
