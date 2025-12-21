from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
import uuid

from src.db.database import get_async_session
from src.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    TaskWithAssignees,
    TaskWithDetails,
)
from src.models.task import Task, TaskState as ModelTaskState
from src.models.project import Project
from src.models.user import User
from src.utils.security import get_current_user


router = APIRouter(prefix="/tasks", tags=["Tasks"])


async def verify_project_access(
    project_id: uuid.UUID,
    current_user: User,
    db: AsyncSession,
) -> Project:
    """
    Verify that the current user has access to the specified project.
    Returns the project if access is granted, otherwise raises HTTPException.
    """
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

    if current_user not in project.users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project",
        )

    return project


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Create a new task in a project.

    Only members of the project can create tasks.

    - **title**: task title (required, 1-200 characters)
    - **description**: task description (optional, max 2000 characters)
    - **state**: task state (scheduled, in_progress, completed) - defaults to scheduled
    - **due_date**: task due date (optional)
    - **project_id**: UUID of the project this task belongs to
    """
    # Verify user has access to the project
    await verify_project_access(task_data.project_id, current_user, db)

    duedate = task_data.due_date
    duedate = duedate.replace(tzinfo=None) if duedate else None

    # Create new task
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        state=task_data.state,
        due_date=duedate,
        project_id=task_data.project_id,
    )

    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)

    return db_task


@router.get("/project/{project_id}", response_model=list[TaskWithAssignees])
async def get_project_tasks(
    project_id: uuid.UUID,
    state: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get all tasks for a specific project.

    Only members of the project can view its tasks.
    Optionally filter by task state.

    - **project_id**: UUID of the project
    - **state**: optional filter by task state (scheduled, in_progress, completed)
    """
    # Verify user has access to the project
    await verify_project_access(project_id, current_user, db)

    # Build query
    query = (
        select(Task)
        .options(selectinload(Task.assignees))
        .where(Task.project_id == project_id)
    )

    # Apply state filter if provided
    if state:
        if state in ModelTaskState:
            query = query.where(Task.state == state)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task state filter",
            )

    result = await db.execute(query.order_by(Task.created_at.desc()))
    tasks = result.scalars().all()

    return tasks


@router.get("/assigned-to-me", response_model=list[TaskWithDetails])
async def get_my_assigned_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
    state: Optional[str] = None,
):
    """
    Get all tasks assigned to the current user across all projects.
    - **state**: optional filter by task state (scheduled, in_progress, completed)
    """
    # Build query to get tasks assigned to current user
    query = (
        select(Task)
        .options(selectinload(Task.assignees), selectinload(Task.project))
        .join(Task.assignees)
        .where(User.id == current_user.id)
    )

    # Apply state filter if provided
    if state:
        if state in ModelTaskState:
            query = query.where(Task.state == state)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task state filter",
            )

    # sorted by closest due date first
    result = await db.execute(query.order_by(Task.due_date.asc().nullslast()))
    tasks = result.scalars().all()

    return tasks


@router.get("/{task_id}", response_model=TaskWithAssignees)
async def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Get details of a specific task by ID.

    Only members of the task's project can view the task.
    """
    # Fetch task with relationships
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignees),
            selectinload(Task.project).selectinload(Project.users),
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if current user is a member of the task's project
    await verify_project_access(task.project_id, current_user, db)

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Update a task's details.

    Only members of the task's project can update the task.
    """
    # Fetch task by id
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.project).selectinload(Project.users))
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if current user is a member of the task's project
    await verify_project_access(task.project_id, current_user, db)

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.state is not None:
        # Convert schema TaskState to model TaskState
        task.state = ModelTaskState(task_data.state.value)
    if task_data.due_date is not None:
        duedate = task_data.due_date
        duedate = duedate.replace(tzinfo=None) if duedate else None
        task.due_date = duedate

    await db.commit()
    await db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Delete a task.

    Only members of the task's project can delete the task.
    """
    # Fetch task
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.project).selectinload(Project.users))
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if current user is a member of the task's project
    await verify_project_access(task.project_id, current_user, db)

    await db.delete(task)
    await db.commit()

    return None


@router.post("/{task_id}/assign/{user_id}", response_model=TaskWithAssignees)
async def assign_user_to_task(
    task_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Assign a user to a task.

    Only members of the task's project can assign users.
    The user being assigned must also be a member of the same project.
    """
    # Fetch task with relationships
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignees),
            selectinload(Task.project).selectinload(Project.users),
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if current user is a member of the task's project
    await verify_project_access(task.project_id, current_user, db)

    # Fetch user to assign
    result = await db.execute(select(User).where(User.id == user_id))
    user_to_assign = result.scalar_one_or_none()

    if not user_to_assign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Verify the user to assign is a member of the task's project
    if user_to_assign not in task.project.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign a user who is not a member of the task's project",
        )

    # Check if user is already assigned
    if user_to_assign in task.assignees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already assigned to this task",
        )

    # Assign user to task
    task.assignees.append(user_to_assign)
    await db.commit()
    await db.refresh(task)

    return task


@router.delete("/{task_id}/assign/{user_id}", response_model=TaskWithAssignees)
async def unassign_user_from_task(
    task_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """
    Unassign a user from a task.

    Only members of the task's project can unassign users.
    """
    # Fetch task with relationships
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignees),
            selectinload(Task.project).selectinload(Project.users),
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if current user is a member of the task's project
    await verify_project_access(task.project_id, current_user, db)

    # Fetch user to unassign
    result = await db.execute(select(User).where(User.id == user_id))
    user_to_unassign = result.scalar_one_or_none()

    if not user_to_unassign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if user is assigned to the task
    if user_to_unassign not in task.assignees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not assigned to this task",
        )

    # Unassign user from task
    task.assignees.remove(user_to_unassign)
    await db.commit()
    await db.refresh(task)

    return task
