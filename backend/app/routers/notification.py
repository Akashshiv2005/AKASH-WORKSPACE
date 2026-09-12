from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.config import settings
from app.db.session import get_db
from app.models.notification_setting import NotificationSetting
from app.models.workspace import Workspace
from app.schemas.notification import (
    NotificationSettingBase,
    NotificationSettingUpdate,
    NotificationSettingResponse,
    TestEmailRequest,
    SendDigestRequest,
    NotificationResultResponse,
)
from app.services.email_service import (
    send_smtp_email,
    trigger_daily_digest,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/settings", response_model=NotificationSettingResponse)
def get_notification_settings(
    workspace_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve current workspace notification settings, or default fallback."""
    # Find workspace or pick first
    ws = None
    if workspace_id:
        ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        ws = db.query(Workspace).first()

    ws_id = ws.id if ws else "default-workspace"

    default_email = settings.NOTIFICATION_EMAIL or settings.SMTP_USER or ""
    setting = db.query(NotificationSetting).filter(NotificationSetting.workspace_id == ws_id).first()
    if not setting:
        # Create default record from .env
        setting = NotificationSetting(
            workspace_id=ws_id,
            recipient_email=default_email,
            is_enabled=True,
            notify_if_pending_only=False,
        )
        try:
            db.add(setting)
            db.commit()
            db.refresh(setting)
        except Exception:
            db.rollback()
            return NotificationSettingResponse(
                id="default",
                workspace_id=ws_id,
                recipient_email=default_email,
                is_enabled=True,
                notify_if_pending_only=False,
                has_custom_smtp=False,
                last_sent_at=None,
            )

    return NotificationSettingResponse(
        id=setting.id,
        workspace_id=setting.workspace_id,
        recipient_email=setting.recipient_email,
        is_enabled=setting.is_enabled,
        notify_if_pending_only=setting.notify_if_pending_only,
        has_custom_smtp=bool(setting.custom_smtp_user and setting.custom_smtp_password),
        last_sent_at=setting.last_sent_at,
    )

@router.post("/settings", response_model=NotificationSettingResponse)
def update_notification_settings(
    payload: NotificationSettingUpdate,
    workspace_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Save or update notification settings for a workspace."""
    ws = None
    if workspace_id:
        ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        ws = db.query(Workspace).first()

    ws_id = ws.id if ws else "default-workspace"

    setting = db.query(NotificationSetting).filter(NotificationSetting.workspace_id == ws_id).first()
    if not setting:
        setting = NotificationSetting(
            workspace_id=ws_id,
            recipient_email=payload.recipient_email or settings.NOTIFICATION_EMAIL or settings.SMTP_USER or "",
            is_enabled=payload.is_enabled if payload.is_enabled is not None else True,
            notify_if_pending_only=payload.notify_if_pending_only if payload.notify_if_pending_only is not None else False,
            custom_smtp_user=payload.custom_smtp_user,
            custom_smtp_password=payload.custom_smtp_password,
        )
        db.add(setting)
    else:
        if payload.recipient_email is not None:
            setting.recipient_email = payload.recipient_email
        if payload.is_enabled is not None:
            setting.is_enabled = payload.is_enabled
        if payload.notify_if_pending_only is not None:
            setting.notify_if_pending_only = payload.notify_if_pending_only
        if payload.custom_smtp_user is not None:
            setting.custom_smtp_user = payload.custom_smtp_user
        if payload.custom_smtp_password is not None:
            setting.custom_smtp_password = payload.custom_smtp_password

    db.commit()
    db.refresh(setting)

    return NotificationSettingResponse(
        id=setting.id,
        workspace_id=setting.workspace_id,
        recipient_email=setting.recipient_email,
        is_enabled=setting.is_enabled,
        notify_if_pending_only=setting.notify_if_pending_only,
        has_custom_smtp=bool(setting.custom_smtp_user and setting.custom_smtp_password),
        last_sent_at=setting.last_sent_at,
    )

@router.post("/test-email")
def test_email(payload: TestEmailRequest):
    """Test Gmail SMTP connection by sending a verification email."""
    subject = "✨ Akash Workspace - Gmail Integration Test"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1c1917;">
        <div style="background: linear-gradient(135deg, #ff7a00, #ff9500); padding: 20px; border-radius: 12px; color: white;">
            <h2>🚀 Email Notification Connected!</h2>
            <p>Your Gmail integration for Akash Workspace is configured properly.</p>
        </div>
        <p style="margin-top: 16px; font-size: 14px; color: #44403c;">
            You will receive daily reminders if you forget tasks or to review your daily habits.
        </p>
        <p style="font-size: 12px; color: #78716c;">Sent on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
    </div>
    """
    target_email = payload.recipient_email or settings.NOTIFICATION_EMAIL or settings.SMTP_USER
    if not target_email:
        return {
            "success": False,
            "message": "Recipient email not provided and NOTIFICATION_EMAIL not set in .env",
            "sent_to": None,
            "timestamp": datetime.now().isoformat(),
        }

    success, message = send_smtp_email(
        to_email=target_email,
        subject=subject,
        html_content=html_body,
        custom_user=payload.smtp_user,
        custom_pass=payload.smtp_password,
    )

    return {
        "success": success,
        "message": message,
        "sent_to": target_email,
        "timestamp": datetime.now().isoformat(),
    }

@router.post("/send-digest", response_model=NotificationResultResponse)
def send_digest(
    payload: Optional[SendDigestRequest] = None,
    db: Session = Depends(get_db),
):
    """Generate and dispatch daily digest email of tasks and habits."""
    req = payload or SendDigestRequest()
    success, message, stats = trigger_daily_digest(
        db=db,
        workspace_id=req.workspace_id,
        recipient_email=req.recipient_email,
        custom_user=req.smtp_user,
        custom_pass=req.smtp_password,
        force=req.force,
    )

    return NotificationResultResponse(
        success=success,
        message=message,
        tasks_count=stats.get("tasks_count", 0),
        pending_tasks_count=stats.get("pending_tasks_count", 0),
        habits_count=stats.get("habits_count", 0),
        habits_completed_today=stats.get("habits_completed_today", 0),
        sent_to=stats.get("sent_to"),
        timestamp=datetime.now().isoformat(),
    )
