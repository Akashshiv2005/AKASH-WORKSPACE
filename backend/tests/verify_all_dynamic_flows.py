import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole

# In-memory database for testing
TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_full_dynamic_workflow():
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    user = User(id="test-user-1", email="akashsivalingam5@gmail.com", username="akash", password_hash="dummy")
    db.add(user)
    db.commit()

    ws = Workspace(id="test-workspace-1", name="Akash Workspace", owner_id=user.id)
    db.add(ws)
    db.commit()

    membership = WorkspaceMember(workspace_id=ws.id, user_id=user.id, role=WorkspaceRole.OWNER)
    db.add(membership)
    db.commit()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_get_current_user():
        return user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    client = TestClient(app)

    try:
        print("\n--- 1. Testing Habit Tracker Dynamic Flows ---")
        # 1.1 Create Habit 1
        habit_res = client.post(f"/api/workspaces/{ws.id}/habits", json={
            "name": "Drink 3L Water",
            "icon": "💧",
            "completed_days": [False]*7
        })
        assert habit_res.status_code == 201, f"Create habit failed: {habit_res.text}"
        habit_data = habit_res.json()
        h1_id = habit_data["id"]
        assert habit_data["name"] == "Drink 3L Water"
        assert habit_data["icon"] == "💧"
        assert habit_data["streak"] == 0

        # 1.2 Update habit (toggle Monday checkmark)
        updated_days = [True, False, False, False, False, False, False]
        patch_res = client.patch(f"/api/workspaces/{ws.id}/habits/{h1_id}", json={
            "completed_days": updated_days,
            "streak": 1
        })
        assert patch_res.status_code == 200
        assert patch_res.json()["completed_days"][0] is True
        assert patch_res.json()["streak"] == 1

        # 1.3 Add a second habit
        habit_res2 = client.post(f"/api/workspaces/{ws.id}/habits", json={
            "name": "Read 20 Pages",
            "icon": "📚",
            "completed_days": [True, True, False, False, False, False, False]
        })
        assert habit_res2.status_code == 201
        h2_id = habit_res2.json()["id"]

        # 1.4 List active habits
        list_res = client.get(f"/api/workspaces/{ws.id}/habits")
        assert list_res.status_code == 200
        active_habits = list_res.json()
        assert len(active_habits) == 2

        # 1.5 Clear All to Trash (Archiving)
        clear_res = client.post(f"/api/workspaces/{ws.id}/habits/clear-all")
        assert clear_res.status_code == 200
        assert clear_res.json()["count"] == 2

        # Verify active habits is now 0
        list_after_clear = client.get(f"/api/workspaces/{ws.id}/habits").json()
        assert len(list_after_clear) == 0

        # Verify archived habits in trash
        trash_res = client.get(f"/api/workspaces/{ws.id}/habits?archived=true")
        assert trash_res.status_code == 200
        assert len(trash_res.json()) == 2

        # 1.6 Restore one habit from trash
        restore_res = client.patch(f"/api/workspaces/{ws.id}/habits/{h1_id}", json={
            "is_archived": False
        })
        assert restore_res.status_code == 200
        assert restore_res.json()["is_archived"] is False

        # Verify 1 active and 1 in trash
        assert len(client.get(f"/api/workspaces/{ws.id}/habits").json()) == 1
        assert len(client.get(f"/api/workspaces/{ws.id}/habits?archived=true").json()) == 1

        print("Habit Tracker Dynamic Flows: PASSED")

        print("\n--- 2. Testing Todo Planner Dynamic Flows ---")
        # 2.1 Add task in 'todo'
        t1_res = client.post(f"/api/workspaces/{ws.id}/tasks", json={
            "title": "Design Landing Page",
            "priority": "High",
            "status": "todo"
        })
        assert t1_res.status_code == 201
        t1 = t1_res.json()
        t1_id = t1["id"]
        assert t1["title"] == "Design Landing Page"
        assert t1["priority"] == "High"
        assert t1["status"] == "todo"

        # 2.2 Add task in 'in_progress'
        t2_res = client.post(f"/api/workspaces/{ws.id}/tasks", json={
            "title": "Setup Email Notification",
            "priority": "Medium",
            "status": "in_progress"
        })
        assert t2_res.status_code == 201
        t2_id = t2_res.json()["id"]

        # 2.3 Move task 1 from 'todo' to 'done'
        update_status_res = client.patch(f"/api/workspaces/{ws.id}/tasks/{t1_id}", json={
            "status": "done"
        })
        assert update_status_res.status_code == 200
        assert update_status_res.json()["status"] == "done"

        # 2.4 List tasks
        tasks_list = client.get(f"/api/workspaces/{ws.id}/tasks").json()
        assert len(tasks_list) == 2

        # 2.5 Clear All to Trash
        clear_tasks_res = client.post(f"/api/workspaces/{ws.id}/tasks/clear-all")
        assert clear_tasks_res.status_code == 200
        assert clear_tasks_res.json()["count"] == 2

        # Verify active tasks is 0 and trash has 2
        assert len(client.get(f"/api/workspaces/{ws.id}/tasks").json()) == 0
        assert len(client.get(f"/api/workspaces/{ws.id}/tasks?archived=true").json()) == 2

        # 2.6 Restore task 1
        restore_task_res = client.patch(f"/api/workspaces/{ws.id}/tasks/{t1_id}", json={
            "is_archived": False
        })
        assert restore_task_res.status_code == 200
        assert len(client.get(f"/api/workspaces/{ws.id}/tasks").json()) == 1

        print("Todo Planner Dynamic Flows: PASSED")

        print("\n--- 3. Testing Notifications & Digest Dynamic Flows ---")
        # 3.1 Get settings
        notif_get = client.get(f"/api/notifications/settings?workspace_id={ws.id}")
        assert notif_get.status_code == 200
        notif_data = notif_get.json()
        assert "is_enabled" in notif_data

        # 3.2 Update settings
        notif_update = client.post(f"/api/notifications/settings?workspace_id={ws.id}", json={
            "recipient_email": "akashsivalingam5@gmail.com",
            "is_enabled": True,
            "notify_if_pending_only": False
        })
        assert notif_update.status_code == 200
        assert notif_update.json()["recipient_email"] == "akashsivalingam5@gmail.com"

        # 3.3 Trigger Digest Generation
        digest_res = client.post(f"/api/notifications/send-digest", json={
            "workspace_id": ws.id,
            "force": True
        })
        assert digest_res.status_code == 200
        digest_data = digest_res.json()
        assert digest_data["tasks_count"] == 1
        assert digest_data["habits_count"] == 1
        assert "timestamp" in digest_data

        print("Notifications & Digest Dynamic Flows: PASSED")
        print("\n>>> ALL SECTIONS VERIFIED DYNAMICALLY FUNCTIONAL! <<<")

    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        db.close()

if __name__ == "__main__":
    test_full_dynamic_workflow()
