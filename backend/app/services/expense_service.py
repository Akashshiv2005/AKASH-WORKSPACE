from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.services.workspace_service import WorkspaceService

class ExpenseService:
    @staticmethod
    def get_workspace_expenses(db: Session, workspace_id: str, user_id: str) -> List[Expense]:
        # Verify access
        WorkspaceService.verify_member(db, workspace_id, user_id)
        return db.query(Expense).filter(Expense.workspace_id == workspace_id).order_by(Expense.date.desc()).all()

    @staticmethod
    def create_expense(db: Session, workspace_id: str, user_id: str, data: ExpenseCreate) -> Expense:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        
        expense_data = {
            "workspace_id": workspace_id,
            "amount": data.amount,
            "description": data.description,
            "category": data.category,
            "payment_method": data.payment_method
        }
        if data.date is not None:
            expense_data["date"] = data.date
            
        expense = Expense(**expense_data)
            
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def update_expense(db: Session, expense_id: str, user_id: str, data: ExpenseUpdate) -> Expense:
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        
        # Verify access
        WorkspaceService.verify_member(db, expense.workspace_id, user_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(expense, key, value)

        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def delete_expense(db: Session, expense_id: str, user_id: str):
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        
        # Verify access
        WorkspaceService.verify_member(db, expense.workspace_id, user_id)

        db.delete(expense)
        db.commit()
