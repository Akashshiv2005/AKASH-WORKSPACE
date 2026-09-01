import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.workspace import Workspace
    from app.models.user import User
    from app.models.block import PageBlock
    from app.models.database import Database


class Page(Base, TimestampMixin):
    __tablename__ = "pages"
    __table_args__ = (
        Index("idx_pages_workspace_parent", "workspace_id", "parent_id"),
        Index("idx_pages_workspace_favorite", "workspace_id", "is_favorite"),
        Index("idx_pages_workspace_archived", "workspace_id", "is_archived"),
    )

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
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("pages.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="Untitled",
    )
    icon: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        default="📄",
    )
    cover_image: Mapped[Optional[str]] = mapped_column(
        String(1000),
        nullable=True,
    )
    is_favorite: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    position: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    created_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Self-referential relationship for nested hierarchy
    parent: Mapped[Optional["Page"]] = relationship(
        "Page",
        remote_side=[id],
        back_populates="children",
    )
    children: Mapped[List["Page"]] = relationship(
        "Page",
        back_populates="parent",
        cascade="all, delete-orphan",
        order_by="Page.position",
    )

    # Workspace & User relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="pages",
    )
    creator: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="created_pages",
        foreign_keys=[created_by],
    )

    # Blocks & Databases relationships
    blocks: Mapped[List["PageBlock"]] = relationship(
        "PageBlock",
        back_populates="page",
        cascade="all, delete-orphan",
        order_by="PageBlock.position",
    )
    databases: Mapped[List["Database"]] = relationship(
        "Database",
        back_populates="page",
        cascade="all, delete-orphan",
    )
