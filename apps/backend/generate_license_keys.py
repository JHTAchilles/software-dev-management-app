"""
Script to generate and insert license keys into the database.
Usage: python generate_license_keys.py [number_of_keys]
"""

import asyncio
import sys
import secrets
import string
from sqlalchemy import select

# Add the src directory to the path
sys.path.append(".")

from src.db.database import get_async_session, create_db_and_tables
from src.models.license_key import LicenseKey


def generate_license_key() -> str:
    """Generate a random license key in format AAAA-BBBB-CCCC-DDDD"""
    chars = string.ascii_uppercase + string.digits
    parts = []
    for _ in range(4):
        part = "".join(secrets.choice(chars) for _ in range(4))
        parts.append(part)
    return "-".join(parts)


async def create_license_keys(count: int = 10):
    """Create specified number of license keys"""
    # Ensure database tables exist
    await create_db_and_tables()

    async for db in get_async_session():
        created_keys = []

        for i in range(count):
            # Generate a unique key
            max_attempts = 10
            for _ in range(max_attempts):
                key = generate_license_key()

                # Check if key already exists
                result = await db.execute(
                    select(LicenseKey).where(LicenseKey.key == key)
                )
                if not result.scalar_one_or_none():
                    break
            else:
                print(f"Warning: Failed to generate unique key #{i+1}")
                continue

            # Create new license key
            license_key = LicenseKey(key=key)
            db.add(license_key)
            created_keys.append(key)

            print(f"Generated key #{i+1}: {key}")

        # Commit all keys
        await db.commit()

        print(f"\n✅ Successfully created {len(created_keys)} license keys!")
        print("\nGenerated keys:")
        for key in created_keys:
            print(f"  - {key}")

        break  # Exit after first session


if __name__ == "__main__":
    # Get number of keys from command line argument, default to 10
    num_keys = int(sys.argv[1]) if len(sys.argv) > 1 else 10

    print(f"Generating {num_keys} license keys...\n")
    asyncio.run(create_license_keys(num_keys))
