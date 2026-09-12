import os
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.task import Task
from app.models.habit import Habit
from app.models.notification_setting import NotificationSetting

def get_smtp_credentials(custom_user: Optional[str] = None, custom_pass: Optional[str] = None) -> Tuple[str, str]:
    """Retrieve SMTP credentials from request, settings, or environment variables."""
    user = (
        custom_user
        or settings.SMTP_USER
        or os.getenv("GMAIL_USER")
        or os.getenv("SMTP_USER")
        or ""
    ).strip()

    password = (
        custom_pass
        or settings.SMTP_PASSWORD
        or os.getenv("GMAIL_APP_PASSWORD")
        or os.getenv("SMTP_PASSWORD")
        or ""
    ).replace(" ", "").strip()

    return user, password

def send_smtp_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str = "",
    custom_user: Optional[str] = None,
    custom_pass: Optional[str] = None,
) -> Tuple[bool, str]:
    """Send an HTML email via SMTP (configured for Gmail or custom provider)."""
    smtp_user, smtp_password = get_smtp_credentials(custom_user, custom_pass)

    if not smtp_user or not smtp_password:
        return False, (
            "Gmail SMTP credentials are not configured. "
            "Please provide your Gmail and a 16-character App Password (generate at https://myaccount.google.com/apppasswords)."
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Akash Workspace <{smtp_user}>"
    msg["To"] = to_email

    if text_content:
        msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Gmail SMTP with STARTTLS on port 587
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, [to_email], msg.as_string())
        server.quit()
        return True, f"Email successfully delivered to {to_email}."
    except smtplib.SMTPAuthenticationError as auth_err:
        return False, (
            f"Gmail Authentication Failed. Google requires an App Password instead of your regular password. "
            f"Error details: {str(auth_err)}"
        )
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"

def generate_digest_html(
    user_name: str,
    tasks: List[Task],
    habits: List[Habit],
    date_str: str,
) -> str:
    """Generate modern, responsive HTML email digest template."""
    # Day of week index (Monday = 0, Sunday = 6)
    today_idx = datetime.now().weekday()
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_name = day_names[today_idx]

    pending_tasks = [t for t in tasks if not t.is_archived and t.status.lower() != "done"]
    done_tasks = [t for t in tasks if not t.is_archived and t.status.lower() == "done"]

    habits_done_today = []
    habits_pending_today = []
    for h in habits:
        if h.is_archived:
            continue
        days = h.completed_days if isinstance(h.completed_days, list) else [False]*7
        is_done = days[today_idx] if today_idx < len(days) else False
        if is_done:
            habits_done_today.append(h)
        else:
            habits_pending_today.append(h)

    total_tasks = len(pending_tasks) + len(done_tasks)
    total_habits = len(habits_done_today) + len(habits_pending_today)

    has_pending = len(pending_tasks) > 0 or len(habits_pending_today) > 0
    hero_badge_color = "#f97316" if has_pending else "#10b981"
    hero_status = "⚠️ Action Needed Today" if has_pending else "🎉 All Tasks & Habits Completed!"

    # HTML Task Items
    pending_tasks_html = ""
    if pending_tasks:
        for t in pending_tasks:
            priority_color = "#ef4444" if t.priority.lower() == "high" else ("#f59e0b" if t.priority.lower() == "medium" else "#6b7280")
            pending_tasks_html += f"""
            <div style="padding: 10px 14px; margin-bottom: 8px; background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-weight: 600; color: #1c1917; font-size: 14px;">{t.title}</span>
                    <span style="display: inline-block; margin-left: 8px; font-size: 11px; padding: 2px 8px; border-radius: 12px; background-color: {priority_color}; color: white; text-transform: uppercase; font-weight: bold;">{t.priority}</span>
                </div>
                <span style="font-size: 12px; color: #c2410c; font-weight: 500;">Status: {t.status}</span>
            </div>
            """
    else:
        pending_tasks_html = "<p style='color: #10b981; font-weight: 500; font-size: 14px;'>🎉 No pending tasks! You have completed everything on your board today.</p>"

    # HTML Habits Items
    habits_html = ""
    if habits:
        for h in habits:
            days = h.completed_days if isinstance(h.completed_days, list) else [False]*7
            is_done = days[today_idx] if today_idx < len(days) else False
            status_badge = "<span style='color: #10b981; font-weight: bold;'>✅ Completed</span>" if is_done else "<span style='color: #f59e0b; font-weight: bold;'>⏳ Not checked today</span>"
            habits_html += f"""
            <div style="padding: 10px 14px; margin-bottom: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 18px; margin-right: 10px;">{h.icon or '🎯'}</span>
                    <span style="font-weight: 600; color: #1e293b; font-size: 14px;">{h.name}</span>
                    <span style="margin-left: 8px; font-size: 11px; color: #64748b;">(🔥 {h.streak} streak)</span>
                </div>
                <div>{status_badge}</div>
            </div>
            """
    else:
        habits_html = "<p style='color: #64748b; font-size: 14px;'>No habits created yet.</p>"

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Digest - Akash Workspace</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7dfd5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #ff7a00, #ff9500); padding: 28px 24px; color: #ffffff;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">🚀 Akash Workspace</span>
                    <span style="background: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">{today_name}, {date_str}</span>
                </div>
                <h1 style="margin: 6px 0 4px 0; font-size: 22px; font-weight: 800;">Daily Task & Habit Digest</h1>
                <p style="margin: 0; font-size: 13px; opacity: 0.9;">Hello {user_name}, here is your productivity status for today.</p>
            </div>

            <!-- Hero Status Pill -->
            <div style="padding: 16px 24px; background: #fdfaf6; border-bottom: 1px solid #f0e8dc; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <span style="font-size: 11px; text-transform: uppercase; color: #78716c; font-weight: 700; letter-spacing: 0.5px;">Today's Overview</span>
                    <div style="font-size: 15px; font-weight: 700; color: {hero_badge_color}; margin-top: 2px;">{hero_status}</div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 12px; color: #78716c;">Tasks: <b>{len(done_tasks)}/{total_tasks}</b></span>
                    <span style="margin: 0 6px; color: #d6d3d1;">•</span>
                    <span style="font-size: 12px; color: #78716c;">Habits: <b>{len(habits_done_today)}/{total_habits}</b></span>
                </div>
            </div>

            <!-- Content Body -->
            <div style="padding: 24px;">
                <!-- Pending Tasks Section -->
                <div style="margin-bottom: 26px;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 16px; margin-right: 6px;">📝</span>
                        <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #1c1917;">Tasks Today ({len(pending_tasks)} Pending)</h2>
                    </div>
                    {pending_tasks_html}
                </div>

                <!-- Habits Section -->
                <div style="margin-bottom: 26px;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 16px; margin-right: 6px;">🎯</span>
                        <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #1c1917;">Daily Habits Progress</h2>
                    </div>
                    {habits_html}
                </div>

                <!-- Call To Action -->
                <div style="text-align: center; margin: 30px 0 10px 0;">
                    <a href="https://akash-workspace.vercel.app" style="background: linear-gradient(135deg, #ff7a00, #ff9500); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 10px rgba(255,122,0,0.3);">
                        Open Akash Workspace & Complete Tasks →
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="padding: 16px 24px; background: #fdfaf6; border-top: 1px solid #f0e8dc; text-align: center; font-size: 11px; color: #a8a29e;">
                Sent automatically by Akash Workspace. You can configure notifications in your workspace settings.
            </div>
        </div>
    </body>
    </html>
    """

from app.models.email_log import EmailLog
from app.models.workspace import Workspace

def trigger_daily_digest(
    db: Session,
    workspace_id: Optional[str] = None,
    recipient_email: Optional[str] = None,
    custom_user: Optional[str] = None,
    custom_pass: Optional[str] = None,
    force: bool = False,
) -> Tuple[bool, str, dict]:
    """Gather tasks & habits, format digest, and send to recipient email."""
    # 1. Look up setting if workspace_id provided
    setting = None
    if workspace_id:
        setting = db.query(NotificationSetting).filter(NotificationSetting.workspace_id == workspace_id).first()

    target_email = recipient_email or (setting.recipient_email if setting else None) or settings.NOTIFICATION_EMAIL
    if not target_email:
        return False, "Recipient email address is missing.", {}

    smtp_user = custom_user or (setting.custom_smtp_user if setting else None)
    smtp_pass = custom_pass or (setting.custom_smtp_password if setting else None)

    # 2. Fetch active tasks and habits
    task_query = db.query(Task).filter(Task.is_archived == False)
    habit_query = db.query(Habit).filter(Habit.is_archived == False)

    if workspace_id:
        task_query = task_query.filter(Task.workspace_id == workspace_id)
        habit_query = habit_query.filter(Habit.workspace_id == workspace_id)

    tasks = task_query.all()
    habits = habit_query.all()

    today_idx = datetime.now().weekday()
    pending_tasks = [t for t in tasks if t.status.lower() != "done"]
    habits_done_today = [
        h for h in habits
        if isinstance(h.completed_days, list) and today_idx < len(h.completed_days) and h.completed_days[today_idx]
    ]

    # If user set "notify_if_pending_only" and has zero pending tasks
    if setting and setting.notify_if_pending_only and not pending_tasks and not force:
        return True, "No pending tasks today. Notification skipped as per 'Pending Only' preference.", {
            "tasks_count": len(tasks),
            "pending_tasks_count": len(pending_tasks),
            "habits_count": len(habits),
            "habits_completed_today": len(habits_done_today),
            "sent_to": target_email,
        }

    date_str = datetime.now().strftime("%B %d, %Y")
    has_forgotten = len(pending_tasks) > 0
    subject = (
        f"⚠️ Reminder: You have {len(pending_tasks)} pending tasks today"
        if has_forgotten
        else "🎉 Daily Digest: All tasks & habits completed today!"
    )

    html_content = generate_digest_html(
        user_name="Akash",
        tasks=tasks,
        habits=habits,
        date_str=date_str,
    )

    success, message = send_smtp_email(
        to_email=target_email,
        subject=subject,
        html_content=html_content,
        custom_user=smtp_user,
        custom_pass=smtp_pass,
    )

    if success and setting:
        setting.last_sent_at = datetime.now().isoformat()
        db.commit()

    # Determine workspace id for log entry
    ws_id = workspace_id or (setting.workspace_id if setting else None)
    if not ws_id:
        first_ws = db.query(Workspace).first()
        ws_id = first_ws.id if first_ws else None

    try:
        log_entry = EmailLog(
            workspace_id=ws_id,
            recipient_email=target_email,
            subject=subject,
            email_type="daily_digest",
            status="sent" if success else "failed",
            details=f"Tasks: {len(tasks)} ({len(pending_tasks)} pending) | Habits: {len(habits)} ({len(habits_done_today)} done)",
            error_message=None if success else message,
            sent_at=datetime.now().isoformat(),
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        db.rollback()

    stats = {
        "tasks_count": len(tasks),
        "pending_tasks_count": len(pending_tasks),
        "habits_count": len(habits),
        "habits_completed_today": len(habits_done_today),
        "sent_to": target_email,
    }

    return success, message, stats

