import uuid
import enum
from typing import List, Optional, Any, Dict, TYPE_CHECKING
from sqlalchemy import String, Float, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.page import Page


class PropertyType(str, enum.Enum):
    TEXT = "text"
    NUMBER = "number"
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    CHECKBOX = "checkbox"
    DATE = "date"
    URL = "url"
    EMAIL = "email"
    PERSON = "person"


class Database(Base, TimestampMixin):
    __tablename__ = "databases"

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
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Untitled Database",
    )

    # Relationships
    page: Mapped["Page"] = relationship(
        "Page",
        back_populates="databases",
    )
    properties: Mapped[List["DatabaseProperty"]] = relationship(
        "DatabaseProperty",
        back_populates="database",
        cascade="all, delete-orphan",
        order_by="DatabaseProperty.position",
    )
    rows: Mapped[List["DatabaseRow"]] = relationship(
        "DatabaseRow",
        back_populates="database",
        cascade="all, delete-orphan",
        order_by="DatabaseRow.position",
    )


class DatabaseProperty(Base, TimestampMixin):
    __tablename__ = "database_properties"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    database_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("databases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=PropertyType.TEXT.value,
    )
    position: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    config: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        default=dict,
    )

    # Relationships
    database: Mapped["Database"] = relationship(
        "Database",
        back_populates="properties",
    )
    cells: Mapped[List["DatabaseCell"]] = relationship(
        "DatabaseCell",
        back_populates="property",
        cascade="all, delete-orphan",
    )


class DatabaseRow(Base, TimestampMixin):
    __tablename__ = "database_rows"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    database_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("databases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    position: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    # Relationships
    database: Mapped["Database"] = relationship(
        "Database",
        back_populates="rows",
    )
    cells: Mapped[List["DatabaseCell"]] = relationship(
        "DatabaseCell",
        back_populates="row",
        cascade="all, delete-orphan",
    )


class DatabaseCell(Base, TimestampMixin):
    __tablename__ = "database_cells"
    __table_args__ = (
        UniqueConstraint("row_id", "property_id", name="uq_row_property"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    row_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("database_rows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    property_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("database_properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value: Mapped[Optional[Any]] = mapped_column(
        JSON,
        nullable=True,
    )

    # Relationships
    row: Mapped["DatabaseRow"] = relationship(
        "DatabaseRow",
        back_populates="cells",
    )
    property: Mapped["DatabaseProperty"] = relationship(
        "DatabaseProperty",
        back_populates="cells",
    )
