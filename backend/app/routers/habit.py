from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitUpdate, HabitResponse
from app.services.habit_service import HabitService

router = APIRouter(prefix="/workspaces/{workspace_id}/habits", tags=["Habits"])

@router.get("", response_model=List[HabitResponse])
def get_habits(
    workspace_id: str,
    archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return HabitService.get_workspace_habits(db, workspace_id, current_user.id, archived)


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    workspace_id: str,
    data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return HabitService.create_habit(db, workspace_id, current_user.id, data)


@router.post("/clear-all", status_code=status.HTTP_200_OK)
def clear_all_to_trash(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = HabitService.archive_all_habits(db, workspace_id, current_user.id)
    return {"message": "All habits archived to trash bin", "count": count}


@router.patch("/{habit_id}", response_model=HabitResponse)
def update_habit(
    workspace_id: str,
    habit_id: str,
    data: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return HabitService.update_habit(db, habit_id, current_user.id, data)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    workspace_id: str,
    habit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    HabitService.delete_habit(db, habit_id, current_user.id)
