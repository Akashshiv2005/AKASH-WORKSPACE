from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.habit import Habit
from app.schemas.habit import HabitCreate, HabitUpdate
from app.services.workspace_service import WorkspaceService

class HabitService:
    @staticmethod
    def get_workspace_habits(db: Session, workspace_id: str, user_id: str, archived: bool = False) -> List[Habit]:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        return (
            db.query(Habit)
            .filter(Habit.workspace_id == workspace_id, Habit.is_archived == archived)
            .order_by(Habit.created_at.desc())
            .all()
        )

    @staticmethod
    def create_habit(db: Session, workspace_id: str, user_id: str, data: HabitCreate) -> Habit:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        
        habit_data = {
            "workspace_id": workspace_id,
            "name": data.name,
            "icon": data.icon or "🎯",
            "streak": data.streak if data.streak is not None else 0,
            "completed_days": data.completed_days if data.completed_days is not None else [False] * 7,
            "is_archived": False,
        }
        
        habit = Habit(**habit_data)
        db.add(habit)
        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def update_habit(db: Session, habit_id: str, user_id: str, data: HabitUpdate) -> Habit:
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        if not habit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
        
        WorkspaceService.verify_member(db, habit.workspace_id, user_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(habit, key, value)

        db.commit()
        db.refresh(habit)
        return habit

    @staticmethod
    def archive_all_habits(db: Session, workspace_id: str, user_id: str) -> int:
        """Move all active habits to trash bin (archive)"""
        WorkspaceService.verify_member(db, workspace_id, user_id)
        habits = db.query(Habit).filter(Habit.workspace_id == workspace_id, Habit.is_archived == False).all()
        count = len(habits)
        for habit in habits:
            habit.is_archived = True
        db.commit()
        return count

    @staticmethod
    def delete_habit(db: Session, habit_id: str, user_id: str):
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        if not habit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
        
        WorkspaceService.verify_member(db, habit.workspace_id, user_id)
        db.delete(habit)
        db.commit()
