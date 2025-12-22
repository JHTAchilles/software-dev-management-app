"""
Pytest configuration and fixtures for backend testing.
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from src.main import app
from src.db.database import Base, get_async_session

# Import models to register them with Base
from src.models import User, Project, Task, LicenseKey
from src.utils.security import get_password_hash


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_engine():
    """Create a test database engine with a single connection."""
    # Use file-based SQLite instead of :memory: to avoid connection isolation issues
    # Each test will get a fresh database file
    import tempfile
    import os

    db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    db_path = db_file.name
    db_file.close()

    TEST_DB_URL = f"sqlite+aiosqlite:///{db_path}"

    engine = create_async_engine(
        TEST_DB_URL,
        echo=False,
        poolclass=NullPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()

    # Clean up the temporary database file
    try:
        os.unlink(db_path)
    except OSError:
        pass


@pytest.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with overridden database session."""

    async def override_get_async_session():
        yield db_session

    app.dependency_overrides[get_async_session] = override_get_async_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_license_key(db_session: AsyncSession) -> LicenseKey:
    """Create a test license key."""
    license_key = LicenseKey(
        key="TEST-1234-5678-ABCD",
        is_active=True,
    )
    db_session.add(license_key)
    await db_session.commit()
    await db_session.refresh(license_key)
    return license_key


@pytest.fixture
async def test_user(db_session: AsyncSession, test_license_key: LicenseKey) -> User:
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_user2(db_session: AsyncSession) -> User:
    """Create a second test user."""
    user = User(
        username="testuser2",
        email="test2@example.com",
        hashed_password=get_password_hash("testpassword456"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict:
    """Get authentication headers for test user."""
    response = await client.post(
        "/auth/login",
        data={
            "username": test_user.username,
            "password": "testpassword123",
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_headers_user2(client: AsyncClient, test_user2: User) -> dict:
    """Get authentication headers for second test user."""
    response = await client.post(
        "/auth/login",
        data={
            "username": test_user2.username,
            "password": "testpassword456",
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_project(db_session: AsyncSession, test_user: User) -> Project:
    """Create a test project."""
    project = Project(
        title="Test Project",
        description="A test project description",
    )
    # Add the user to the project through the many-to-many relationship
    project.users.append(test_user)
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)

    return project


@pytest.fixture
async def test_task(db_session: AsyncSession, test_project: Project) -> Task:
    """Create a test task."""
    from src.schemas.task import TaskState

    task = Task(
        title="Test Task",
        description="A test task description",
        state=TaskState.SCHEDULED,
        project_id=test_project.id,
    )
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)
    return task
