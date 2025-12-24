import { useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/api";
import {
  TaskWithAssignees,
  TaskState,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectWithUsers,
} from "@/types";

/**
 * Project/task data hook.
 *
 * Owns state for:
 * - project details
 * - task list
 * - loading/error flags
 *
 * And exposes convenience methods that call the API and keep local state
 * in sync.
 */
export function useProjectTasks(projectId: string) {
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([]);
  const [project, setProject] = useState<ProjectWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Fetch project details and all tasks.
   *
   * @param silent When true, does not flip the `loading` flag (used for polling).
   */
  const fetchProjectAndTasks = async (silent = false) => {
    if (!projectId) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      // Fetch project details
      const projectData = await apiGet<ProjectWithUsers>(
        API_ENDPOINTS.projects.detail(projectId),
      );
      setProject(projectData);

      // Fetch tasks for this project
      const tasksData = await apiGet<TaskWithAssignees[]>(
        API_ENDPOINTS.tasks.list(projectId),
      );
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || "Failed to load project data");
      console.error("Error fetching data:", err);
      throw err;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  /**
   * Fetch a single task by ID.
   * Returns `null` instead of throwing to simplify callers.
   */
  const fetchTaskById = async (
    taskId: string,
  ): Promise<TaskWithAssignees | null> => {
    try {
      const taskData = await apiGet<TaskWithAssignees>(
        API_ENDPOINTS.tasks.detail(taskId),
      );
      return taskData;
    } catch (err: any) {
      console.error("Error fetching task:", err);
      return null;
    }
  };

  /** Create a new task and append it to local state. */
  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await apiPost<TaskWithAssignees>(
        API_ENDPOINTS.tasks.create,
        taskData,
      );
      setTasks([...tasks, newTask]);
      setError("");
      return newTask;
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      console.error("Error creating task:", err);
      throw err;
    }
  };

  /**
   * Update only the task state.
   */
  const updateTaskState = async (taskId: string, newState: TaskState) => {
    if (tasks.find((t) => t.id === taskId)?.state === newState) {
      return;
    }

    try {
      const updateData: UpdateTaskRequest = { state: newState };
      await apiPut(API_ENDPOINTS.tasks.update(taskId), updateData);

      const updatedTask = await fetchTaskById(taskId);
      if (updatedTask) {
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task)),
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      console.error("Error updating task:", err);
      throw err;
    }
  };

  /**
   * Update a task and reconcile assignees.
   *
   * This performs:
   * - PUT task fields
   * - POST for new assignees
   * - DELETE for removed assignees
   * - refetch the updated task for canonical state
   */
  const updateTask = async (
    taskId: string,
    updateData: UpdateTaskRequest,
    newAssignees: string[],
  ) => {
    try {
      await apiPut(API_ENDPOINTS.tasks.update(taskId), updateData);

      const task = tasks.find((t) => t.id === taskId);
      const currentAssigneeIds = task?.assignees?.map((a) => a.id) || [];
      const toAdd = newAssignees.filter(
        (id) => !currentAssigneeIds.includes(id),
      );
      const toRemove = currentAssigneeIds.filter(
        (id) => !newAssignees.includes(id),
      );

      for (const userId of toAdd) {
        await apiPost(API_ENDPOINTS.tasks.assign(taskId, userId), {});
      }

      for (const userId of toRemove) {
        await apiDelete(API_ENDPOINTS.tasks.unassign(taskId, userId));
      }

      const updatedTask = await fetchTaskById(taskId);
      if (updatedTask) {
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task)),
        );
      }

      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      console.error("Error updating task:", err);
      throw err;
    }
  };

  /** Delete a task and remove it from local state. */
  const deleteTask = async (taskId: string) => {
    try {
      await apiDelete(API_ENDPOINTS.tasks.delete(taskId));
      setTasks(tasks.filter((task) => task.id !== taskId));
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  /** Update a project’s title/description and update local project state. */
  const updateProject = async (title: string, description?: string) => {
    if (!project) throw new Error("No project loaded");

    try {
      await apiPut(API_ENDPOINTS.projects.update(project.id), {
        title,
        description,
      });

      setProject({
        ...project,
        title,
        description: description || "",
      });

      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to update project");
      console.error("Error updating project:", err);
      throw err;
    }
  };

  /** Remove a user from the project and update local project state. */
  const removeUserFromProject = async (userId: string) => {
    if (!project) throw new Error("No project loaded");

    try {
      await apiDelete(API_ENDPOINTS.projects.removeUser(project.id, userId));

      setProject({
        ...project,
        users: project.users.filter((u) => u.id !== userId),
      });

      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to remove user");
      console.error("Error removing user:", err);
      throw err;
    }
  };

  /** Delete the current project. Callers typically navigate away afterward. */
  const deleteProject = async () => {
    if (!project) throw new Error("No project loaded");

    try {
      await apiDelete(API_ENDPOINTS.projects.delete(project.id));
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
      console.error("Error deleting project:", err);
      throw err;
    }
  };

  return {
    tasks,
    project,
    loading,
    error,
    setError,
    fetchProjectAndTasks,
    createTask,
    updateTaskState,
    updateTask,
    deleteTask,
    updateProject,
    removeUserFromProject,
    deleteProject,
  };
}
