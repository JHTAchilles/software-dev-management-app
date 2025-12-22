import pytest
from httpx import AsyncClient


class TestProjectCreation:
    """Test project creation functionality."""

    @pytest.mark.asyncio
    async def test_create_project_success(self, client: AsyncClient, auth_headers):
        """Test successful project creation."""
        response = await client.post(
            "/projects/",
            headers=auth_headers,
            json={
                "title": "New Project",
                "description": "A new project description",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Project"
        assert data["description"] == "A new project description"
        assert "id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_project_without_auth(self, client: AsyncClient):
        """Test project creation fails without authentication."""
        response = await client.post(
            "/projects/",
            json={
                "title": "New Project",
                "description": "Description",
            },
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_project_without_title(
        self, client: AsyncClient, auth_headers
    ):
        """Test project creation fails without required title."""
        response = await client.post(
            "/projects/",
            headers=auth_headers,
            json={
                "description": "Description without title",
            },
        )

        assert response.status_code == 422  # Validation error


class TestProjectRetrieval:
    """Test project retrieval functionality."""

    @pytest.mark.asyncio
    async def test_get_user_projects(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test retrieving all projects for authenticated user."""
        response = await client.get("/projects/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(p["id"] == str(test_project.id) for p in data)

    @pytest.mark.asyncio
    async def test_get_project_by_id(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test retrieving a specific project by ID."""
        project_id = str(test_project.id)
        response = await client.get(f"/projects/{project_id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert data["title"] == test_project.title
        assert "users" in data  # Should include project members

    @pytest.mark.asyncio
    async def test_get_nonexistent_project(self, client: AsyncClient, auth_headers):
        """Test retrieving non-existent project returns 404."""
        import uuid

        fake_id = str(uuid.uuid4())

        response = await client.get(f"/projects/{fake_id}", headers=auth_headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_project_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_project
    ):
        """Test retrieving project fails for non-member users."""
        project_id = str(test_project.id)
        response = await client.get(
            f"/projects/{project_id}", headers=auth_headers_user2
        )

        assert response.status_code == 403


class TestProjectUpdate:
    """Test project update functionality."""

    @pytest.mark.asyncio
    async def test_update_project_success(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test successful project update by owner."""
        project_id = str(test_project.id)
        response = await client.put(
            f"/projects/{project_id}",
            headers=auth_headers,
            json={
                "title": "Updated Project Title",
                "description": "Updated description",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Project Title"
        assert data["description"] == "Updated description"

    @pytest.mark.asyncio
    async def test_update_project_partial(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test partial project update (only title)."""
        original_description = test_project.description
        project_id = str(test_project.id)

        response = await client.put(
            f"/projects/{project_id}",
            headers=auth_headers,
            json={
                "title": "Only Title Updated",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Only Title Updated"
        assert data["description"] == original_description

    @pytest.mark.asyncio
    async def test_update_project_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_project
    ):
        """Test project update fails for non-owner users."""
        project_id = str(test_project.id)
        response = await client.put(
            f"/projects/{project_id}",
            headers=auth_headers_user2,
            json={
                "title": "Unauthorized Update",
            },
        )

        assert response.status_code == 403


class TestProjectDeletion:
    """Test project deletion functionality."""

    @pytest.mark.asyncio
    async def test_delete_project_success(
        self, client: AsyncClient, auth_headers, test_project
    ):
        """Test successful project deletion by owner."""
        project_id = str(test_project.id)
        response = await client.delete(f"/projects/{project_id}", headers=auth_headers)

        assert response.status_code == 204

        # Verify project is deleted
        get_response = await client.get(f"/projects/{project_id}", headers=auth_headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_project_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_project
    ):
        """Test project deletion fails for non-owner users."""
        project_id = str(test_project.id)
        response = await client.delete(
            f"/projects/{project_id}", headers=auth_headers_user2
        )

        assert response.status_code == 403


class TestProjectUserManagement:
    """Test adding and removing users from projects."""

    @pytest.mark.asyncio
    async def test_add_user_to_project(
        self, client: AsyncClient, auth_headers, test_project, test_user2
    ):
        """Test adding a user to a project."""
        project_id = str(test_project.id)
        user_id = str(test_user2.id)
        response = await client.post(
            f"/projects/{project_id}/users/{user_id}", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert any(u["id"] == user_id for u in data["users"])

    @pytest.mark.asyncio
    async def test_remove_user_from_project(
        self, client: AsyncClient, auth_headers, test_project, test_user2
    ):
        """Test removing a user from a project."""
        project_id = str(test_project.id)
        user_id = str(test_user2.id)

        # First add the user
        await client.post(
            f"/projects/{project_id}/users/{user_id}", headers=auth_headers
        )

        # Then remove the user
        response = await client.delete(
            f"/projects/{project_id}/users/{user_id}", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert not any(u["id"] == user_id for u in data["users"])

    @pytest.mark.asyncio
    async def test_add_user_unauthorized(
        self, client: AsyncClient, auth_headers_user2, test_project, test_user2
    ):
        """Test adding user fails for non-owner."""
        project_id = str(test_project.id)
        user_id = str(test_user2.id)
        response = await client.post(
            f"/projects/{project_id}/users/{user_id}", headers=auth_headers_user2
        )

        assert response.status_code == 403
