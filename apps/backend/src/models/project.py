from sqlalchemy import String, DateTime, ForeignKey, Table, Column, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import TYPE_CHECKING
import uuid
from src.db.database import Base

if TYPE_CHECKING:
    from src.models.user import User


# Association table for many-to-many relationship between users and projects
user_projects = Table(
    "user_projects",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "project_id", ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True
    ),
    Column("joined_at", DateTime, default=datetime.utcnow),
)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        primary_key=True,
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Many-to-many relationship with users
    users: Mapped[list["User"]] = relationship(
        "User", secondary=user_projects, back_populates="projects"
    )
