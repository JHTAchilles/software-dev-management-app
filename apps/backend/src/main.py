from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.db.database import create_db_and_tables
from src.routers import auth, projects
from src.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events for the application.
    Initializes database tables on startup.
    """
    # Startup: Initialize database tables
    await create_db_and_tables()
    print("Database initialized successfully")
    yield
    # Shutdown: Add cleanup code here if needed
    print("Application shutting down")


app = FastAPI(
    title="Software Development Management API",
    description="API for managing software development projects and tasks",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint providing API information.
    """
    return {
        "message": "Welcome to the Software Development Management API",
        "documentation_url": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint to verify that the API is running.
    """
    return {"status": "ok"}
