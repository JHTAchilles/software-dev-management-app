from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

# Import TaskState from models to ensure consistency
from src.models.task import TaskState


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    state: TaskState = Field(default=TaskState.SCHEDULED)
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    project_id: uuid.UUID


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    state: Optional[TaskState] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBasicInfo(BaseModel):
    id: uuid.UUID
    username: str
    email: str

    class Config:
        from_attributes = True


class TaskWithAssignees(TaskResponse):
    assignees: list[UserBasicInfo]

    class Config:
        from_attributes = True


class ProjectBasicInfo(BaseModel):
    id: uuid.UUID
    title: str

    class Config:
        from_attributes = True


class TaskWithDetails(TaskWithAssignees):
    project: ProjectBasicInfo

    class Config:
        from_attributes = True
