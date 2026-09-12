import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.workspace import Workspace

class NotificationSetting(Base, TimestampMixin):
    __tablename__ = "notification_settings"

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
        unique=True,
        index=True,
    )
    recipient_email: Mapped[str] = mapped_column(String(255), default="akashshiv2005@gmail.com")
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_if_pending_only: Mapped[bool] = mapped_column(Boolean, default=False)
    custom_smtp_user: Mapped[str | None] = mapped_column(String(255), nullable=True)
    custom_smtp_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_sent_at: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="notification_settings",
    )
