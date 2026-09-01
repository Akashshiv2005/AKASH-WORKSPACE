from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.page import PageCreate, PageUpdate, PageResponse
from app.services.page_service import PageService

router = APIRouter(prefix="/pages", tags=["Pages"])


@router.post("", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
def create_page(data: PageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.create_page(db, current_user.id, data)


@router.get("/{page_id}", response_model=PageResponse)
def get_page(page_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.get_page_by_id(db, page_id, current_user.id)


@router.patch("/{page_id}", response_model=PageResponse)
def update_page(page_id: str, data: PageUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.update_page(db, page_id, current_user.id, data)


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(page_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    PageService.delete_page(db, page_id, current_user.id)


@router.post("/{page_id}/duplicate", response_model=PageResponse)
def duplicate_page(page_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.duplicate_page(db, page_id, current_user.id)


@router.post("/{page_id}/archive", response_model=PageResponse)
def archive_page(page_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.archive_page(db, page_id, current_user.id)


@router.post("/{page_id}/restore", response_model=PageResponse)
def restore_page(page_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.restore_page(db, page_id, current_user.id)


@router.post("/{page_id}/favorite", response_model=PageResponse)
def favorite_page(page_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return PageService.favorite_page(db, page_id, current_user.id)
