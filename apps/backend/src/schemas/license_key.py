"""Pydantic schemas for license key creation/validation."""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from uuid import UUID
import re


class LicenseKeyBase(BaseModel):
    """Common fields shared by license-key request/response schemas."""

    key: str = Field(..., description="License key in format AAAA-BBBB-CCCC-DDDD")

    @field_validator("key")
    @classmethod
    def validate_key_format(cls, v: str) -> str:
        """Validate that the key matches `AAAA-BBBB-CCCC-DDDD` (uppercase alnum)."""

        pattern = r"^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$"
        if not re.match(pattern, v):
            raise ValueError(
                "License key must be in format AAAA-BBBB-CCCC-DDDD with uppercase alphanumeric characters"
            )
        return v


class LicenseKeyCreate(LicenseKeyBase):
    """Schema for creating a new license key"""

    pass


class LicenseKeyValidate(BaseModel):
    """Schema for validating a license key during registration"""

    key: str


class LicenseKeyValidationResponse(BaseModel):
    """Response for license key validation."""

    valid: bool


class LicenseKeyResponse(LicenseKeyBase):
    """Schema for license key response"""

    id: UUID
    is_active: bool
    created_at: datetime
    used_at: Optional[datetime] = None
    used_by_user_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class LicenseKeyActivate(BaseModel):
    """Schema for activating/deactivating a license key"""

    is_active: bool
