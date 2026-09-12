from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.workspace_service import WorkspaceService

class TaskService:
    @staticmethod
    def get_workspace_tasks(db: Session, workspace_id: str, user_id: str, archived: bool = False) -> List[Task]:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        return (
            db.query(Task)
            .filter(Task.workspace_id == workspace_id, Task.is_archived == archived)
            .order_by(Task.created_at.desc())
            .all()
        )

    @staticmethod
    def create_task(db: Session, workspace_id: str, user_id: str, data: TaskCreate) -> Task:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        
        task_data = {
            "workspace_id": workspace_id,
            "title": data.title,
            "priority": data.priority or "Medium",
            "status": data.status or "todo",
            "is_archived": False,
        }
        
        task = Task(**task_data)
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(db: Session, task_id: str, user_id: str, data: TaskUpdate) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        WorkspaceService.verify_member(db, task.workspace_id, user_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def archive_all_tasks(db: Session, workspace_id: str, user_id: str) -> int:
        """Move all active tasks to trash bin (archive)"""
        WorkspaceService.verify_member(db, workspace_id, user_id)
        tasks = db.query(Task).filter(Task.workspace_id == workspace_id, Task.is_archived == False).all()
        count = len(tasks)
        for task in tasks:
            task.is_archived = True
        db.commit()
        return count

    @staticmethod
    def delete_task(db: Session, task_id: str, user_id: str):
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        WorkspaceService.verify_member(db, task.workspace_id, user_id)
        db.delete(task)
        db.commit()
