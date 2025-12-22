import pytest
from httpx import AsyncClient


class TestLicenseKeyCreation:
    """Test license key creation."""

    @pytest.mark.asyncio
    async def test_create_license_key_success(self, client: AsyncClient, auth_headers):
        """Test successful license key creation."""
        response = await client.post(
            "/license-keys/generate",
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert "key" in data
        assert "-" in data["key"]  # Should have format XXXX-XXXX-XXXX-XXXX
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_duplicate_license_key(
        self, client: AsyncClient, auth_headers, test_license_key
    ):
        """Test that generated license keys are unique."""
        # Generate multiple keys and verify they're all unique
        keys = set()
        for _ in range(5):
            response = await client.post(
                "/license-keys/generate",
                headers=auth_headers,
            )
            assert response.status_code == 201
            key = response.json()["key"]
            assert key not in keys, "Generated duplicate license key"
            keys.add(key)

        assert len(keys) == 5


class TestLicenseKeyValidation:
    """Test license key validation functionality."""

    @pytest.mark.asyncio
    async def test_validate_active_license_key(self, client: AsyncClient, db_session):
        """Test validating an active, unused license key."""
        from src.models import LicenseKey

        license_key = LicenseKey(key="VALI-DA12-3456-KEY1", is_active=True)
        db_session.add(license_key)
        await db_session.commit()

        response = await client.post(
            "/license-keys/validate",
            json={"key": "vali-da12-3456-key1"},
        )

        assert response.status_code == 200
        assert response.json()["valid"] is True

    @pytest.mark.asyncio
    async def test_validate_nonexistent_license_key(self, client: AsyncClient):
        response = await client.post(
            "/license-keys/validate",
            json={"key": "NOPE-0000-0000-NOPE"},
        )

        assert response.status_code == 400


class TestLicenseKeyValidationNegative:
    """Negative cases for license key validation."""

    @pytest.mark.asyncio
    async def test_validate_inactive_license_key(
        self, client: AsyncClient, test_license_key, db_session
    ):
        test_license_key.is_active = False
        db_session.add(test_license_key)
        await db_session.commit()

        response = await client.post(
            "/license-keys/validate",
            json={"key": test_license_key.key},
        )

        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_validate_used_license_key(
        self, client: AsyncClient, test_license_key, db_session
    ):
        import uuid
        from datetime import datetime

        test_license_key.is_active = False
        test_license_key.used_by_user_id = uuid.uuid4()
        test_license_key.used_at = datetime.now()
        db_session.add(test_license_key)
        await db_session.commit()

        response = await client.post(
            "/license-keys/validate",
            json={"key": test_license_key.key},
        )

        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_validate_empty_key(self, client: AsyncClient):
        response = await client.post(
            "/license-keys/validate",
            json={"key": "   "},
        )

        assert response.status_code == 400


class TestLicenseKeyListing:
    """Test license key listing functionality."""

    @pytest.mark.asyncio
    async def test_list_license_keys(
        self, client: AsyncClient, auth_headers, test_license_key
    ):
        """Test listing all license keys."""
        response = await client.get("/license-keys/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(lk["key"] == test_license_key.key for lk in data)

    @pytest.mark.asyncio
    async def test_get_license_key_by_key(
        self, client: AsyncClient, auth_headers, test_license_key
    ):
        """Test retrieving a specific license key."""
        response = await client.get(
            f"/license-keys/{test_license_key.key}", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["key"] == test_license_key.key
        assert "is_active" in data
        assert "used_by_user_id" in data


class TestLicenseKeyUpdate:
    """Test license key update functionality."""

    @pytest.mark.asyncio
    async def test_deactivate_license_key(
        self, client: AsyncClient, auth_headers, test_license_key
    ):
        """Test deactivating a license key."""
        response = await client.patch(
            f"/license-keys/{test_license_key.key}",
            headers=auth_headers,
            json={"is_active": False},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    @pytest.mark.asyncio
    async def test_activate_license_key(
        self, client: AsyncClient, auth_headers, test_license_key
    ):
        """Test activating a license key."""
        response = await client.patch(
            f"/license-keys/{test_license_key.key}",
            headers=auth_headers,
            json={"is_active": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True


class TestLicenseKeyDeletion:
    """Test license key deletion functionality."""

    @pytest.mark.asyncio
    async def test_delete_license_key(
        self, client: AsyncClient, auth_headers, db_session
    ):
        """Test deleting an unused license key."""
        from src.models import LicenseKey

        # Create a new unused license key
        new_key = LicenseKey(key="DELETE-TEST-1234-ABCD", is_active=True)
        db_session.add(new_key)
        await db_session.commit()
        await db_session.refresh(new_key)

        response = await client.delete(
            f"/license-keys/{new_key.key}", headers=auth_headers
        )

        assert response.status_code == 204
