from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class PageBase(BaseModel):
    title: str = "Untitled"
    icon: Optional[str] = "📄"
    cover_image: Optional[str] = None


class PageCreate(PageBase):
    workspace_id: str
    parent_id: Optional[str] = None


class PageUpdate(BaseModel):
    title: Optional[str] = None
    icon: Optional[str] = None
    cover_image: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_archived: Optional[bool] = None
    position: Optional[float] = None
    parent_id: Optional[str] = None


class PageResponse(PageBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    parent_id: Optional[str] = None
    is_favorite: bool
    is_archived: bool
    position: float
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    children: List[PageResponse] = []
