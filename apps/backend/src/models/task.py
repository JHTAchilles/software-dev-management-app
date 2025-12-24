"""Task ORM model.

Defines task state, assignee association table, and the `Task` entity.
"""

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Table,
    Column,
    UUID,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import TYPE_CHECKING, Optional
import uuid
import enum
from src.db.database import Base

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.project import Project


# Enum for task state
class TaskState(str, enum.Enum):
    """Allowed task states stored in the database."""

    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# Association table for many-to-many relationship between tasks and users (assignees)
task_assignees = Table(
    "task_assignees",
    Base.metadata,
    Column("task_id", ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("assigned_at", DateTime, default=datetime.now),
)


class Task(Base):
    """Database model for a task.

    A task belongs to one project and can be assigned to many users.
    """

    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        primary_key=True,
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    state: Mapped[TaskState] = mapped_column(
        SQLEnum(TaskState),
        default=TaskState.SCHEDULED,
        nullable=False,
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), onupdate=datetime.now
    )

    # Foreign key to project (one-to-many: a task belongs to one project)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="tasks")
    assignees: Mapped[list["User"]] = relationship(
        "User", secondary=task_assignees, back_populates="assigned_tasks"
    )
