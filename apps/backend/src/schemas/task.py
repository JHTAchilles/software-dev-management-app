"""Pydantic schemas for tasks."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

# Import TaskState from models to ensure consistency
from src.models.task import TaskState


class TaskBase(BaseModel):
    """Common task fields shared by create/update/response schemas."""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    state: TaskState = Field(default=TaskState.SCHEDULED)
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Request body for creating a task in a project."""

    project_id: uuid.UUID


class TaskUpdate(BaseModel):
    """Request body for updating a task (partial updates allowed)."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    state: Optional[TaskState] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    """Response model returned for task data."""

    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBasicInfo(BaseModel):
    """Minimal user representation used in nested task payloads."""

    id: uuid.UUID
    username: str
    email: str

    class Config:
        from_attributes = True


class TaskWithAssignees(TaskResponse):
    """Task response enriched with assignee list."""

    assignees: list[UserBasicInfo]

    class Config:
        from_attributes = True


class ProjectBasicInfo(BaseModel):
    """Minimal project representation used in nested task payloads."""

    id: uuid.UUID
    title: str

    class Config:
        from_attributes = True


class TaskWithDetails(TaskWithAssignees):
    """Task response enriched with assignees and its project."""

    project: ProjectBasicInfo

    class Config:
        from_attributes = True
