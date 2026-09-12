from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/workspaces/{workspace_id}/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    workspace_id: str,
    archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.get_workspace_tasks(db, workspace_id, current_user.id, archived)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    workspace_id: str,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.create_task(db, workspace_id, current_user.id, data)


@router.post("/clear-all", status_code=status.HTTP_200_OK)
def clear_all_to_trash(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = TaskService.archive_all_tasks(db, workspace_id, current_user.id)
    return {"message": "All tasks archived to trash bin", "count": count}


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    workspace_id: str,
    task_id: str,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.update_task(db, task_id, current_user.id, data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    workspace_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    TaskService.delete_task(db, task_id, current_user.id)
