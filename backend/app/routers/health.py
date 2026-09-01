from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="Health Check")
def health_check(db: Session = Depends(get_db)):
    try:
        # Check database connectivity
        result = db.execute(text("SELECT 1")).scalar()
        db_status = "connected" if result == 1 else "unhealthy"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": "healthy" if "connected" in db_status else "degraded",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
    }
