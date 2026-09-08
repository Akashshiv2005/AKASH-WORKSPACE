from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/workspaces/{workspace_id}/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseResponse])
def get_expenses(workspace_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ExpenseService.get_workspace_expenses(db, workspace_id, current_user.id)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(workspace_id: str, data: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ExpenseService.create_expense(db, workspace_id, current_user.id, data)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
def update_expense(workspace_id: str, expense_id: str, data: ExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ExpenseService.update_expense(db, expense_id, current_user.id, data)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(workspace_id: str, expense_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ExpenseService.delete_expense(db, expense_id, current_user.id)
