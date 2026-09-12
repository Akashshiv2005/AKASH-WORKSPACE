from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional

class NotificationSettingBase(BaseModel):
    recipient_email: str = Field(default="")
    is_enabled: bool = True
    notify_if_pending_only: bool = False
    custom_smtp_user: Optional[str] = None
    custom_smtp_password: Optional[str] = None

class NotificationSettingUpdate(BaseModel):
    recipient_email: Optional[str] = None
    is_enabled: Optional[bool] = None
    notify_if_pending_only: Optional[bool] = None
    custom_smtp_user: Optional[str] = None
    custom_smtp_password: Optional[str] = None

class NotificationSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: str
    recipient_email: str
    is_enabled: bool
    notify_if_pending_only: bool
    has_custom_smtp: bool = False
    last_sent_at: Optional[str] = None

class TestEmailRequest(BaseModel):
    recipient_email: Optional[str] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None

class SendDigestRequest(BaseModel):
    workspace_id: Optional[str] = None
    recipient_email: Optional[str] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    force: bool = False

class NotificationResultResponse(BaseModel):
    success: bool
    message: str
    tasks_count: int = 0
    pending_tasks_count: int = 0
    habits_count: int = 0
    habits_completed_today: int = 0
    sent_to: Optional[str] = None
    timestamp: str

class EmailLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_id: Optional[str] = None
    recipient_email: str
    subject: str
    email_type: str
    status: str
    details: Optional[str] = None
    error_message: Optional[str] = None
    sent_at: str

