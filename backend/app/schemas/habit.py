from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HabitBase(BaseModel):
    name: str
    icon: Optional[str] = "🎯"

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    streak: Optional[int] = None
    completed_days: Optional[List[bool]] = None
    is_archived: Optional[bool] = None

class HabitResponse(HabitBase):
    id: str
    workspace_id: str
    streak: int
    completed_days: List[bool]
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
