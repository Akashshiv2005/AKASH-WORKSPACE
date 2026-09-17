from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"/api/auth/login",
    auto_error=False
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    if token:
        payload = decode_token(token)
        if payload and payload.get("type") == "access":
            user_id: str = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
    
    # Guest / Demo fallback user for unauthenticated preview
    demo_user = db.query(User).filter(User.email == "guest@akashworkspace.com").first()
    if not demo_user:
        demo_user = User(
            id="user-demo-guest",
            email="guest@akashworkspace.com",
            username="akashguest",
            password_hash="demo_hash_key",
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    return demo_user
