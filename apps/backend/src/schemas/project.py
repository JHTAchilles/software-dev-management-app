"""Pydantic schemas for projects."""

from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class ProjectBase(BaseModel):
    """Common project fields shared by create/update/response schemas."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)


class ProjectCreate(ProjectBase):
    """Request body for creating a project."""

    pass


class ProjectUpdate(BaseModel):
    """Request body for updating a project (partial updates allowed)."""

    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)


class ProjectResponse(ProjectBase):
    """Response model returned for project data."""

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectWithUsers(ProjectResponse):
    """Project response enriched with its member list."""

    users: list["UserBasicInfo"]

    class Config:
        from_attributes = True


# Minimal user info to avoid circular imports and reduce payload
class UserBasicInfo(BaseModel):
    """Minimal user representation used in nested project payloads."""

    id: uuid.UUID
    username: str
    email: str

    class Config:
        from_attributes = True
