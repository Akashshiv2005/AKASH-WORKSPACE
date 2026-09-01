from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
from app.models.page import Page
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token


class AuthService:
    @staticmethod
    def register(db: Session, user_in: UserCreate) -> Token:
        # Check duplicate email
        if db.query(User).filter(User.email == user_in.email).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        
        # Check duplicate username
        if db.query(User).filter(User.username == user_in.username).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken.",
            )

        # Create new user
        db_user = User(
            email=user_in.email,
            username=user_in.username,
            password_hash=get_password_hash(user_in.password),
        )
        db.add(db_user)
        db.flush()

        # Create default workspace for user
        default_workspace = Workspace(
            name=f"{user_in.username}'s Workspace",
            icon="🏡",
            owner_id=db_user.id,
        )
        db.add(default_workspace)
        db.flush()

        # Add member role
        member = WorkspaceMember(
            workspace_id=default_workspace.id,
            user_id=db_user.id,
            role=WorkspaceRole.OWNER,
        )
        db.add(member)

        # Create initial "Getting Started" welcome page
        welcome_page = Page(
            workspace_id=default_workspace.id,
            title="Getting Started 🚀",
            icon="👋",
            created_by=db_user.id,
            position=0.0,
        )
        db.add(welcome_page)

        db.commit()
        db.refresh(db_user)

        # Generate JWT tokens
        access_token = create_access_token(subject=db_user.id)
        refresh_token = create_refresh_token(subject=db_user.id)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(db_user),
        )

    @staticmethod
    def login(db: Session, login_in: UserLogin) -> Token:
        # Lookup user by email or username
        user = db.query(User).filter(
            or_(
                User.email == login_in.email_or_username,
                User.username == login_in.email_or_username,
            )
        ).first()

        if not user or not verify_password(login_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def refresh(db: Session, refresh_token_str: str) -> Token:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
            )

        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
