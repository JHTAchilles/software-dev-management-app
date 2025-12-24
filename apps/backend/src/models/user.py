"""User ORM model.

Represents an authenticated user and their relationships to projects/tasks.
"""

from sqlalchemy import String, DateTime, Boolean, text, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import uuid
from typing import TYPE_CHECKING
from src.db.database import Base

if TYPE_CHECKING:
    from src.models.project import Project
    from src.models.task import Task


class User(Base):
    """Database model for an application user."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True
    )
    username: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )

    # Many-to-many relationship with projects
    projects: Mapped[list["Project"]] = relationship(
        "Project", secondary="user_projects", back_populates="users"
    )

    # Many-to-many relationship with tasks (as assignee)
    assigned_tasks: Mapped[list["Task"]] = relationship(
        "Task", secondary="task_assignees", back_populates="assignees"
    )
