from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse, WorkspaceMemberResponse, AddMemberRequest
from app.schemas.page import PageResponse
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(data: WorkspaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.create_workspace(db, current_user.id, data)


@router.get("", response_model=List[WorkspaceResponse])
def get_workspaces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.get_user_workspaces(db, current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(workspace_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.get_workspace_by_id(db, workspace_id, current_user.id)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(workspace_id: str, data: WorkspaceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.update_workspace(db, workspace_id, current_user.id, data)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(workspace_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    WorkspaceService.delete_workspace(db, workspace_id, current_user.id)


@router.get("/{workspace_id}/members", response_model=List[WorkspaceMemberResponse])
def get_members(workspace_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    WorkspaceService.verify_member(db, workspace_id, current_user.id)
    return db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id).all()


@router.get("/{workspace_id}/pages", response_model=List[PageResponse])
def get_workspace_pages(
    workspace_id: str,
    archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.page_service import PageService
    return PageService.get_workspace_pages(db, workspace_id, current_user.id, archived)


@router.post("/{workspace_id}/members", response_model=WorkspaceMemberResponse)
def add_member(workspace_id: str, data: AddMemberRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return WorkspaceService.add_member(db, workspace_id, current_user.id, data)


@router.delete("/{workspace_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(workspace_id: str, user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    WorkspaceService.remove_member(db, workspace_id, current_user.id, user_id)
