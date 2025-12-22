import pytest
from httpx import AsyncClient


class TestRegistration:
    """Test user registration functionality."""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient, test_license_key):
        """Test successful user registration with valid license key."""
        response = await client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepassword123",
                "license_key": test_license_key.key,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "id" in data
        assert "hashed_password" not in data  # Password should not be exposed

    @pytest.mark.asyncio
    async def test_register_invalid_license_key(self, client: AsyncClient):
        """Test registration fails with invalid license key."""
        response = await client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepassword123",
                "license_key": "INVALID-KEY-1234-ABCD",
            },
        )

        assert response.status_code == 400
        detail = response.json()["detail"].lower()
        assert "license" in detail or "key" in detail or "invalid" in detail

    @pytest.mark.asyncio
    async def test_register_duplicate_email(
        self, client: AsyncClient, test_user, test_license_key
    ):
        """Test registration fails with duplicate email."""
        response = await client.post(
            "/auth/register",
            json={
                "username": "differentuser",
                "email": test_user.email,
                "password": "securepassword123",
                "license_key": test_license_key.key,
            },
        )

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]


class TestLogin:
    """Test user login functionality."""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user):
        """Test successful login with valid credentials."""
        response = await client.post(
            "/auth/login",
            data={
                "username": test_user.username,
                "password": "testpassword123",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        """Test login fails with incorrect password."""
        response = await client.post(
            "/auth/login",
            data={
                "username": test_user.username,
                "password": "wrongpassword",
            },
        )

        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login fails with non-existent user."""
        response = await client.post(
            "/auth/login",
            data={
                "username": "nonexistent",
                "password": "anypassword",
            },
        )

        assert response.status_code == 401


class TestAuthentication:
    """Test authentication token validation."""

    @pytest.mark.asyncio
    async def test_get_current_user(self, client: AsyncClient, auth_headers, test_user):
        """Test retrieving current user with valid token."""
        response = await client.get("/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email
        assert data["id"] == str(test_user.id)

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test authentication fails with invalid token."""
        response = await client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test authentication fails without token."""
        response = await client.get("/auth/me")

        assert response.status_code == 401
