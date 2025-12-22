from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectWithUsers(ProjectResponse):
    users: list["UserBasicInfo"]

    class Config:
        from_attributes = True


# Minimal user info to avoid circular imports and reduce payload
class UserBasicInfo(BaseModel):
    id: uuid.UUID
    username: str
    email: str

    class Config:
        from_attributes = True
