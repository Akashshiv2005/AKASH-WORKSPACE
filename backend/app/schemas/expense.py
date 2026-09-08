from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExpenseBase(BaseModel):
    amount: float
    description: str
    category: str
    payment_method: str

class ExpenseCreate(ExpenseBase):
    date: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: str
    workspace_id: str
    date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
