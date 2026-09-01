from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, AddMemberRequest


class WorkspaceService:
    @staticmethod
    def verify_member(db: Session, workspace_id: str, user_id: str) -> WorkspaceMember:
        member = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this workspace.",
            )
        return member

    @staticmethod
    def get_user_workspaces(db: Session, user_id: str) -> List[Workspace]:
        memberships = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user_id).all()
        workspace_ids = [m.workspace_id for m in memberships]
        return db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all()

    @staticmethod
    def create_workspace(db: Session, user_id: str, data: WorkspaceCreate) -> Workspace:
        workspace = Workspace(
            name=data.name,
            icon=data.icon,
            owner_id=user_id,
        )
        db.add(workspace)
        db.flush()

        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=user_id,
            role=WorkspaceRole.OWNER,
        )
        db.add(member)
        db.commit()
        db.refresh(workspace)
        return workspace

    @staticmethod
    def get_workspace_by_id(db: Session, workspace_id: str, user_id: str) -> Workspace:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found.")
        return workspace

    @staticmethod
    def update_workspace(db: Session, workspace_id: str, user_id: str, data: WorkspaceUpdate) -> Workspace:
        member = WorkspaceService.verify_member(db, workspace_id, user_id)
        if member.role not in [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Admin permissions required.")

        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if data.name is not None:
            workspace.name = data.name
        if data.icon is not None:
            workspace.icon = data.icon

        db.commit()
        db.refresh(workspace)
        return workspace

    @staticmethod
    def delete_workspace(db: Session, workspace_id: str, user_id: str) -> None:
        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found.")
        if workspace.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Only the workspace owner can delete it.")

        db.delete(workspace)
        db.commit()

    @staticmethod
    def add_member(db: Session, workspace_id: str, user_id: str, data: AddMemberRequest) -> WorkspaceMember:
        member = WorkspaceService.verify_member(db, workspace_id, user_id)
        if member.role not in [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Admin permissions required.")

        target_user = db.query(User).filter(User.email == data.email).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User with this email not found.")

        existing = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == target_user.id,
        ).first()

        if existing:
            raise HTTPException(status_code=409, detail="User is already a member of this workspace.")

        new_member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=target_user.id,
            role=data.role,
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        return new_member

    @staticmethod
    def remove_member(db: Session, workspace_id: str, user_id: str, target_user_id: str) -> None:
        member = WorkspaceService.verify_member(db, workspace_id, user_id)
        if member.role not in [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] and user_id != target_user_id:
            raise HTTPException(status_code=403, detail="Admin permissions required.")

        workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if workspace.owner_id == target_user_id:
            raise HTTPException(status_code=400, detail="Cannot remove workspace owner.")

        target_member = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == target_user_id,
        ).first()

        if target_member:
            db.delete(target_member)
            db.commit()
