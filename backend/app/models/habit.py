import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.workspace import Workspace

class Habit(Base, TimestampMixin):
    __tablename__ = "habits"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    workspace_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="🎯")
    streak: Mapped[int] = mapped_column(default=0)
    completed_days: Mapped[list[bool]] = mapped_column(JSON, default=lambda: [False]*7)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="habits",
    )
