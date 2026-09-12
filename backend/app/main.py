import asyncio
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.routers import health, auth, workspace, page, ai, expense


import os

# Background task to ping itself every 8 minutes and prevent sleeping while alive
async def keep_alive():
    # Automatically uses Render's built-in RENDER_EXTERNAL_URL or BACKEND_URL
    base_url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("BACKEND_URL")
        or "https://akash-workspace-backend.onrender.com"
    ).rstrip("/")
    ping_url = f"{base_url}/api/health"

    # Wait 30s after startup before first ping
    await asyncio.sleep(30)

    while True:
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.get(ping_url)
                print(f"[Keep-Alive] Pinged: {ping_url} - Status: {response.status_code}")
        except Exception as e:
            print(f"[Keep-Alive] Ping failed for {ping_url}: {e}")
        # Wait 8 minutes (Render sleeps after 15 minutes of inactivity)
        await asyncio.sleep(8 * 60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run the keep_alive task in the background when the app starts
    task = asyncio.create_task(keep_alive())
    yield
    # Cleanup task when the app shuts down
    task.cancel()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
