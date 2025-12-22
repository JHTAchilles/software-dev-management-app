import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.models.task import Task


class TestTaskCreation:
    """Test task creation functionality."""

    @pytest.mark.asyncio
    async def test_create_task_success(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test successful task creation."""
        response = await client.post(
            "/tasks/",
            headers=auth_headers,
            json={
                "title": "New Task",
                "description": "Task description",
                "state": "scheduled",
                "project_id": str(test_project.id),
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Task"
        assert data["description"] == "Task description"
        assert data["state"] == "scheduled"
        assert data["project_id"] == str(test_project.id)

    @pytest.mark.asyncio
    async def test_create_task_with_due_date(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test creating task with due date."""
        response = await client.post(
            "/tasks/",
            headers=auth_headers,
            json={
                "title": "Task with Due Date",
                "description": "Description",
                "state": "scheduled",
                "project_id": str(test_project.id),
                "due_date": "2025-12-31T23:59:59",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert "due_date" in data

    @pytest.mark.asyncio
    async def test_create_task_unauthorized_project(
        self, client: AsyncClient, auth_headers_user2, test_project
    ):
        """Test task creation fails for non-project members."""
        response = await client.post(
            "/tasks/",
            headers=auth_headers_user2,
            json={
                "title": "Unauthorized Task",
                "description": "Should fail",
                "state": "scheduled",
                "project_id": str(test_project.id),
            },
        )

        assert response.status_code == 403


class TestTaskRetrieval:
    """Test task retrieval functionality."""

    @pytest.mark.asyncio
    async def test_get_project_tasks(
        self, client: AsyncClient, auth_headers, test_project, test_task
    ):
        """Test retrieving all tasks for a project."""
        response = await client.get(
            f"/tasks/project/{test_project.id}", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(t["id"] == str(test_task.id) for t in data)

    @pytest.mark.asyncio
    async def test_get_task_by_id(self, client: AsyncClient, auth_headers, test_task):
        """Test retrieving a specific task by ID."""
        response = await client.get(f"/tasks/{test_task.id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_task.id)
        assert data["title"] == test_task.title
        assert "assignees" in data

    @pytest.mark.asyncio
    async def test_get_assigned_tasks(
        self, client: AsyncClient, auth_headers, test_task, test_user, db_session
    ):
        """Test retrieving tasks assigned to current user."""
        # Load task with assignees relationship
        result = await db_session.execute(
            select(Task)
            .options(selectinload(Task.assignees))
            .where(Task.id == test_task.id)
        )
        task = result.scalar_one()

        # Assign task to user
        task.assignees.append(test_user)
        db_session.add(task)
        await db_session.commit()
        await db_session.refresh(task)

        response = await client.get("/tasks/assigned-to-me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(t["id"] == str(test_task.id) for t in data)

    @pytest.mark.asyncio
    async def test_get_task_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_task
    ):
        """Test retrieving task fails for non-project members."""
        response = await client.get(
            f"/tasks/{test_task.id}", headers=auth_headers_user2
        )

        assert response.status_code == 403


class TestTaskUpdate:
    """Test task update functionality."""

    @pytest.mark.asyncio
    async def test_update_task_success(
        self, client: AsyncClient, auth_headers, test_task
    ):
        """Test successful task update."""
        response = await client.put(
            f"/tasks/{test_task.id}",
            headers=auth_headers,
            json={
                "title": "Updated Task Title",
                "description": "Updated description",
                "state": "in_progress",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task Title"
        assert data["description"] == "Updated description"
        assert data["state"] == "in_progress"

    @pytest.mark.asyncio
    async def test_update_task_state_only(
        self, client: AsyncClient, auth_headers, test_task
    ):
        """Test updating only task state."""
        response = await client.put(
            f"/tasks/{test_task.id}",
            headers=auth_headers,
            json={
                "state": "completed",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "completed"
        assert data["title"] == test_task.title  # Title unchanged

    @pytest.mark.asyncio
    async def test_update_task_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_task
    ):
        """Test task update fails for non-project members."""
        response = await client.put(
            f"/tasks/{test_task.id}",
            headers=auth_headers_user2,
            json={
                "title": "Unauthorized Update",
            },
        )

        assert response.status_code == 403


class TestTaskDeletion:
    """Test task deletion functionality."""

    @pytest.mark.asyncio
    async def test_delete_task_success(
        self, client: AsyncClient, auth_headers, test_task
    ):
        """Test successful task deletion."""
        response = await client.delete(f"/tasks/{test_task.id}", headers=auth_headers)

        assert response.status_code == 204

        # Verify task is deleted
        get_response = await client.get(f"/tasks/{test_task.id}", headers=auth_headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_task_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_task
    ):
        """Test task deletion fails for non-project members."""
        response = await client.delete(
            f"/tasks/{test_task.id}", headers=auth_headers_user2
        )

        assert response.status_code == 403


class TestTaskAssignment:
    """Test task assignment functionality."""

    @pytest.mark.asyncio
    async def test_assign_user_to_task(
        self, client: AsyncClient, auth_headers, test_task, test_user
    ):
        """Test assigning a user to a task."""
        task_id = str(test_task.id)
        user_id = str(test_user.id)
        response = await client.post(
            f"/tasks/{task_id}/assign/{user_id}", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert any(u["id"] == user_id for u in data["assignees"])

    @pytest.mark.asyncio
    async def test_unassign_user_from_task(
        self, client: AsyncClient, auth_headers, test_task, test_user
    ):
        """Test unassigning a user from a task."""
        task_id = str(test_task.id)
        user_id = str(test_user.id)

        # First assign the user
        await client.post(f"/tasks/{task_id}/assign/{user_id}", headers=auth_headers)

        # Then unassign
        response = await client.delete(
            f"/tasks/{task_id}/assign/{user_id}", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert not any(u["id"] == user_id for u in data["assignees"])

    @pytest.mark.asyncio
    async def test_assign_non_project_member(
        self, client: AsyncClient, auth_headers, test_task, test_user2
    ):
        """Test assigning non-project member to task fails."""
        response = await client.post(
            f"/tasks/{test_task.id}/assign/{test_user2.id}", headers=auth_headers
        )

        assert response.status_code == 400
        assert "not a member" in response.json()["detail"].lower()
