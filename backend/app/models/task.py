import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.workspace import Workspace

class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

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
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="Medium")
    status: Mapped[str] = mapped_column(String(50), default="todo")
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="tasks",
    )
