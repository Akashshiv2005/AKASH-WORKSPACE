import uuid
import enum
from typing import List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.page import Page
    from app.models.habit import Habit
    from app.models.expense import Expense
    from app.models.task import Task


class WorkspaceRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class Workspace(Base, TimestampMixin):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    icon: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        default="🚀",
    )
    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    savings_goal: Mapped[float] = mapped_column(
        default=5000.0,
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="owned_workspaces",
    )
    members: Mapped[List["WorkspaceMember"]] = relationship(
        "WorkspaceMember",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
    pages: Mapped[List["Page"]] = relationship(
        "Page",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
    habits: Mapped[List["Habit"]] = relationship(
        "Habit",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
    expenses: Mapped[List["Expense"]] = relationship(
        "Expense",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )


class WorkspaceMember(Base, TimestampMixin):
    __tablename__ = "workspace_members"
    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_workspace_user"),
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
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[WorkspaceRole] = mapped_column(
        SQLEnum(WorkspaceRole, name="workspacerole", native_enum=False),
        nullable=False,
        default=WorkspaceRole.MEMBER,
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="members",
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="workspace_memberships",
    )
