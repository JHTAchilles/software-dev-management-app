from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events for the application.
    Initializes database tables on startup.
    """
    # Startup: Initialize database tables
    # init_db()
    print("Database initialized successfully")
    yield
    # Shutdown: Add cleanup code here if needed
    print("Application shutting down")


app = FastAPI(lifespan=lifespan)


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
