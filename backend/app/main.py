import asyncio
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.routers import health, auth, workspace, page, ai, expense, habit, task, notification
from app.db.base import Base
from app.db.session import engine
import app.models  # Ensure all models are registered with Base

import os

# Background task to ping itself every 3 minutes and prevent Render sleeping
async def keep_alive():
    base_url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("BACKEND_URL")
        or "https://akash-workspace.onrender.com"
    ).rstrip("/")
    ping_url = f"{base_url}/api/health/ping"

    # Wait 10s after startup before first ping
    await asyncio.sleep(10)

    while True:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(ping_url)
                print(f"[Keep-Alive Heartbeat] Pinged: {ping_url} - Status: {response.status_code}")
        except Exception as e:
            print(f"[Keep-Alive Heartbeat] Ping failed for {ping_url}: {e}")
        # Wait 3 minutes (Render sleeps after 15 minutes of inactivity)
        await asyncio.sleep(3 * 60)

# Automated Background Task: Dispatches daily reminder digest at 8:00 PM IST if habits/tasks incomplete
async def daily_reminder_scheduler():
    from datetime import datetime, timezone, timedelta
    from app.db.session import SessionLocal
    from app.services.email_service import trigger_daily_digest
    from app.models.notification_setting import NotificationSetting

    # Wait 30s after startup
    await asyncio.sleep(30)

    while True:
        try:
            ist = timezone(timedelta(hours=5, minutes=30))
            now_ist = datetime.now(ist)
            today_str = now_ist.strftime("%Y-%m-%d")
            hour_ist = now_ist.hour

            # Evening reminder window: 8:00 PM IST onwards (hour >= 20)
            if hour_ist >= 20:
                db = SessionLocal()
                try:
                    settings_list = db.query(NotificationSetting).filter(
                        NotificationSetting.is_enabled == True
                    ).all()
                    for s in settings_list:
                        if s.last_sent_at and s.last_sent_at.startswith(today_str):
                            continue
                        success, msg, stats = trigger_daily_digest(
                            db=db,
                            workspace_id=s.workspace_id,
                            recipient_email=s.recipient_email,
                            custom_user=s.custom_smtp_user,
                            custom_pass=s.custom_smtp_password,
                            force=False,
                        )
                        print(f"[Daily Reminder Scheduler] {s.workspace_id}: {msg}")
                finally:
                    db.close()
        except Exception as e:
            print(f"[Daily Reminder Scheduler Error]: {e}")

        # Check every 15 minutes
        await asyncio.sleep(15 * 60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables (including habits, expenses) exist in database
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error initializing DB tables: {e}")
    # Run background tasks
    task_keep_alive = asyncio.create_task(keep_alive())
    task_scheduler = asyncio.create_task(daily_reminder_scheduler())
    yield
    # Cleanup tasks on shutdown
    task_keep_alive.cancel()
    task_scheduler.cancel()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Universal CORS Middleware
@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(status_code=200, content={"status": "ok"})
    else:
        response = await call_next(request)
    
    origin = request.headers.get("origin") or "*"
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " -> ".join([str(loc) for loc in error.get("loc", [])])
        errors.append({"field": field, "message": error.get("msg")})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Centralized logging / safe output
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


# Mount Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(workspace.router, prefix=settings.API_V1_STR)
app.include_router(page.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(expense.router, prefix=settings.API_V1_STR)
app.include_router(habit.router, prefix=settings.API_V1_STR)
app.include_router(task.router, prefix=settings.API_V1_STR)
app.include_router(notification.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
