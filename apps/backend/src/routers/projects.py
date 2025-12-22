from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

import uuid

from src.db.database import get_async_session
from src.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ProjectWithUsers,
)
from src.models.project import Project
from src.models.user import User
from src.utils.security import get_current_user


router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Create a new project. The creator is automatically added as a member.

    - **title**: project title (required, 1-200 characters)
    - **description**: project description (optional, max 1000 characters)
    """
    # Create new project
    db_project = Project(
        title=project_data.title,
        description=project_data.description,
    )

    # Add the creator as the first user of the project
    db_project.users.append(current_user)

    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)

    return db_project


@router.get(
    "/", response_model=list[ProjectResponse]
)  # NOTE: this endpoint do not return user lists of the projects
async def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get all projects that the current user is a member of.
    """
    # Query projects where the current user is a member
    result = await db.execute(
        select(Project)
        .join(Project.users)
        .where(User.id == current_user.id)
        .order_by(Project.created_at.desc())
    )
    projects = result.scalars().all()

    return projects


@router.get("/{project_id}", response_model=ProjectWithUsers)
async def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get details of a specific project by UUID
    Only members of the project can view its details.
    """
    # Fetch project with users loaded
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if current user is a member of this project
    if current_user not in project.users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project",
        )

    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Update a project's title and/or description.

    Only members of the project can update it.
    """
    # Fetch project
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if current user is a member
    if current_user not in project.users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not an member of this project",
        )

    # Update fields if provided
    if project_data.title is not None:
        project.title = project_data.title
    if project_data.description is not None:
        project.description = project_data.description

    await db.commit()
    await db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Delete a project.

    Only members of the project can delete it.
    Note: This will also remove all user associations due to CASCADE.
    """
    # Fetch project
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if current user is a member
    if current_user not in project.users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project",
        )

    await db.delete(project)
    await db.commit()

    return None


@router.post("/{project_id}/users/{user_id}", response_model=ProjectWithUsers)
async def add_user_to_project(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Add a user to a project.

    Only existing members of the project can add new users.
    """
    # Fetch project
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if current user is a member
    if current_user not in project.users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project",
        )

    # Fetch user to add
    result = await db.execute(select(User).where(User.id == user_id))
    user_to_add = result.scalar_one_or_none()

    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if user is already a member
    if user_to_add in project.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project",
        )

    # Add user to project
    project.users.append(user_to_add)
    await db.commit()
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one()

    return project


@router.delete("/{project_id}/users/{user_id}", response_model=ProjectWithUsers)
async def remove_user_from_project(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Remove a user from a project.

    Only existing members can remove users.
    Cannot remove the last user from a project (project must have at least 1 user).
    """
    # Fetch project
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if current user is a member
    if current_user not in project.users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project",
        )

    # Check if project has more than 1 user
    if len(project.users) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last user from a project. A project must have at least 1 user.",
        )

    # Fetch user to remove
    result = await db.execute(select(User).where(User.id == user_id))
    user_to_remove = result.scalar_one_or_none()

    if not user_to_remove:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if user is a member
    if user_to_remove not in project.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a member of this project",
        )

    # Remove user from project
    project.users.remove(user_to_remove)
    await db.commit()
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.users))
        .where(Project.id == project_id)
    )
    project = result.scalar_one()

    return project
