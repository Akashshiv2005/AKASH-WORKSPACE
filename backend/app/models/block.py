import uuid
import enum
from typing import Optional, Any, Dict, TYPE_CHECKING
from sqlalchemy import String, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.page import Page


class BlockType(str, enum.Enum):
    PARAGRAPH = "paragraph"
    HEADING1 = "heading1"
    HEADING2 = "heading2"
    HEADING3 = "heading3"
    BULLET = "bullet"
    NUMBERED = "numbered"
    TODO = "todo"
    QUOTE = "quote"
    CODE = "code"
    DIVIDER = "divider"
    IMAGE = "image"
    CALLOUT = "callout"


class PageBlock(Base, TimestampMixin):
    __tablename__ = "page_blocks"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    page_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=BlockType.PARAGRAPH.value,
    )
    content: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict,
    )
    position: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    properties: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict,
    )

    # Relationships
    page: Mapped["Page"] = relationship(
        "Page",
        back_populates="blocks",
    )
