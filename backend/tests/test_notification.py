import pytest
from app.models.workspace import Workspace
from app.models.user import User
from app.models.task import Task
from app.models.habit import Habit
from app.services.email_service import generate_digest_html

def test_generate_digest_html():
    tasks = [
        Task(title="Finish API docs", priority="High", status="todo"),
        Task(title="Deploy to Render", priority="Medium", status="done"),
    ]
    habits = [
        Habit(name="Drink 2L Water", icon="💧", streak=5, completed_days=[True, True, False, True, False, False, False]),
    ]
    html = generate_digest_html("Akash", tasks, habits, "September 12, 2026")
    assert "Finish API docs" in html
    assert "Drink 2L Water" in html
    assert "Akash Workspace" in html

from app.core.config import settings

def test_notification_settings_api(client, db_session):
    # Test GET settings (creates default from settings.NOTIFICATION_EMAIL)
    res = client.get("/api/notifications/settings")
    assert res.status_code == 200
    data = res.json()
    assert data["recipient_email"] == (settings.NOTIFICATION_EMAIL or "")
    assert data["is_enabled"] is True

    # Test POST update settings
    update_res = client.post("/api/notifications/settings", json={
        "recipient_email": "custom.akash@gmail.com",
        "is_enabled": True,
        "notify_if_pending_only": True
    })
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["recipient_email"] == "custom.akash@gmail.com"
    assert updated_data["notify_if_pending_only"] is True

def test_notification_test_email_api(client):
    # Without credentials configured, it should return 200 with informative failure message
    res = client.post("/api/notifications/test-email", json={
        "recipient_email": "test@gmail.com"
    })
    assert res.status_code == 200
    data = res.json()
    assert "success" in data
    assert "message" in data

def test_notification_logs_api(client):
    # Send a test email to generate a log entry
    client.post("/api/notifications/test-email", json={
        "recipient_email": "test@gmail.com"
    })

    # Test logs fetch
    res = client.get("/api/notifications/logs")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) >= 1
    first_log = logs[0]
    assert "recipient_email" in first_log
    assert "status" in first_log
    assert "sent_at" in first_log

    # Test logs delete
    del_res = client.delete("/api/notifications/logs")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Confirm cleared
    after_res = client.get("/api/notifications/logs")
    assert after_res.status_code == 200
    assert len(after_res.json()) == 0

