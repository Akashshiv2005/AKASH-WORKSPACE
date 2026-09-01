from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.page import Page
from app.models.block import PageBlock
from app.schemas.page import PageCreate, PageUpdate, PageResponse
from app.services.workspace_service import WorkspaceService


class PageService:
    @staticmethod
    def create_page(db: Session, user_id: str, data: PageCreate) -> Page:
        WorkspaceService.verify_member(db, data.workspace_id, user_id)

        if data.parent_id:
            parent = db.query(Page).filter(
                Page.id == data.parent_id,
                Page.workspace_id == data.workspace_id,
            ).first()
            if not parent:
                raise HTTPException(status_code=404, detail="Parent page not found.")

        # Calculate position
        max_pos = db.query(Page).filter(
            Page.workspace_id == data.workspace_id,
            Page.parent_id == data.parent_id,
        ).count()

        page = Page(
            workspace_id=data.workspace_id,
            parent_id=data.parent_id,
            title=data.title or "Untitled",
            icon=data.icon or "📄",
            cover_image=data.cover_image,
            created_by=user_id,
            position=float(max_pos),
        )
        db.add(page)
        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def get_page_by_id(db: Session, page_id: str, user_id: str) -> Page:
        page = db.query(Page).filter(Page.id == page_id).first()
        if not page:
            raise HTTPException(status_code=404, detail="Page not found.")

        WorkspaceService.verify_member(db, page.workspace_id, user_id)
        return page

    @staticmethod
    def update_page(db: Session, page_id: str, user_id: str, data: PageUpdate) -> Page:
        page = PageService.get_page_by_id(db, page_id, user_id)

        if data.title is not None:
            page.title = data.title
        if data.icon is not None:
            page.icon = data.icon
        if data.cover_image is not None:
            page.cover_image = data.cover_image
        if data.is_favorite is not None:
            page.is_favorite = data.is_favorite
        if data.is_archived is not None:
            page.is_archived = data.is_archived
        if data.position is not None:
            page.position = data.position
        if data.parent_id is not None:
            if data.parent_id == page.id:
                raise HTTPException(status_code=400, detail="Page cannot be its own parent.")
            page.parent_id = data.parent_id

        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def delete_page(db: Session, page_id: str, user_id: str) -> None:
        page = PageService.get_page_by_id(db, page_id, user_id)
        db.delete(page)
        db.commit()

    @staticmethod
    def duplicate_page(db: Session, page_id: str, user_id: str) -> Page:
        original = PageService.get_page_by_id(db, page_id, user_id)

        new_page = Page(
            workspace_id=original.workspace_id,
            parent_id=original.parent_id,
            title=f"{original.title} (Copy)",
            icon=original.icon,
            cover_image=original.cover_image,
            created_by=user_id,
            position=original.position + 0.1,
        )
        db.add(new_page)
        db.flush()

        # Copy blocks
        for block in original.blocks:
            new_block = PageBlock(
                page_id=new_page.id,
                type=block.type,
                content=block.content,
                position=block.position,
                properties=block.properties,
            )
            db.add(new_block)

        db.commit()
        db.refresh(new_page)
        return new_page

    @staticmethod
    def archive_page(db: Session, page_id: str, user_id: str) -> Page:
        page = PageService.get_page_by_id(db, page_id, user_id)
        page.is_archived = True
        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def restore_page(db: Session, page_id: str, user_id: str) -> Page:
        page = PageService.get_page_by_id(db, page_id, user_id)
        page.is_archived = False
        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def favorite_page(db: Session, page_id: str, user_id: str) -> Page:
        page = PageService.get_page_by_id(db, page_id, user_id)
        page.is_favorite = not page.is_favorite
        db.commit()
        db.refresh(page)
        return page

    @staticmethod
    def get_workspace_pages(db: Session, workspace_id: str, user_id: str, archived: bool = False) -> List[Page]:
        WorkspaceService.verify_member(db, workspace_id, user_id)
        
        # Get top-level pages
        pages = db.query(Page).filter(
            Page.workspace_id == workspace_id,
            Page.parent_id.is_(None),
            Page.is_archived == archived,
        ).order_by(Page.position.asc()).all()

        return pages
