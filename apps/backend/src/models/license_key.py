"""
License key ORM model.

License keys gate account creation and can be marked as is_active.
"""

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from datetime import datetime
from typing import Optional

from src.db.database import Base


class LicenseKey(Base):
    """Database model for a license key used during registration."""

    __tablename__ = "license_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    key: Mapped[str] = mapped_column(
        String(19), unique=True, nullable=False, index=True
    )  # AAAA-BBBB-CCCC-DDDD
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    used_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    used_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )  # log which user used this key

    def __repr__(self) -> str:
        """Debug representation for logs and shell sessions."""
        return f"<LicenseKey(key={self.key}, is_active={self.is_active})>"
