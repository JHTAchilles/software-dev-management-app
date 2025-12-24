"""Pydantic schemas for user/auth payloads."""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """User base model with common user fields shared by multiple schemas."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Request body for user registration."""

    password: str = Field(..., min_length=6, max_length=100)
    license_key: str = Field(..., description="License key required for registration")


class UserLogin(BaseModel):
    """Request body for username/password login."""

    username: str
    password: str


class UserResponse(UserBase):
    """Response model returned for user data."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """OAuth2-compatible token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Decoded token payload data used by auth helpers."""

    username: str | None = None
