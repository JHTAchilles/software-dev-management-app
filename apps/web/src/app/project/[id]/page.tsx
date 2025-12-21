"use client";

import { useState, useEffect, Suspense } from "react";
import { FiChevronLeft, FiPlus } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/api";
import {
  TaskWithAssignees,
  TaskState,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectWithUsers,
} from "@/types";
import { KanbanColumn } from "@/components/KanbanColumn";

function KanbanBoard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectWithUsers | null>(null);
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskState, setNewTaskState] = useState<TaskState>(
    TaskState.SCHEDULED,
  );
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // Edit task states
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskState, setEditTaskState] = useState<TaskState>(
    TaskState.SCHEDULED,
  );
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskAssignees, setEditTaskAssignees] = useState<string[]>([]);

  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }
    fetchProjectAndTasks();
  }, [projectId]);

  // ============================================================================
  // API FETCH FUNCTIONS
  // ============================================================================

  const fetchProjectAndTasks = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
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
      // If project not found (404), redirect to 404 page
      if (
        err.message?.toLowerCase().includes("not found") ||
        err.message?.includes("404")
      ) {
        router.push("/404");
        return;
      }
      setError(err.message || "Failed to load project data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !projectId) {
      setError("Task title is required");
      return;
    }

    try {
      setCreating(true);

      const taskData: CreateTaskRequest = {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        state: newTaskState,
        due_date: newTaskDueDate || undefined,
        project_id: projectId,
      };

      const newTask = await apiPost<TaskWithAssignees>(
        API_ENDPOINTS.tasks.create,
        taskData,
      );

      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskState(TaskState.SCHEDULED);
      setNewTaskDueDate("");
      setError("");
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      console.error("Error creating task:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTaskState = async (taskId: string, newState: TaskState) => {
    if (tasks.find((t) => t.id === taskId)?.state === newState) {
      return; // No change needed
    }

    try {
      const updateData: UpdateTaskRequest = {
        state: newState,
      };

      // Update the task state
      await apiPut(API_ENDPOINTS.tasks.update(taskId), updateData);

      // Fetch the updated task with assignees (NOTE: backend returns without assignees for this endpoint)
      const updatedTask = await fetchTaskById(taskId);

      if (updatedTask) {
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task)),
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const openEditModal = (task: TaskWithAssignees) => {
    setSelectedTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskState(task.state);
    setEditTaskDueDate(
      task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : "",
    );
    setEditTaskAssignees(task.assignees?.map((a) => a.id) || []);
    setShowEditModal(true);
    setError("");
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !editTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      // Update task details
      const updateData: UpdateTaskRequest = {
        title: editTaskTitle,
        description: editTaskDescription || undefined,
        state: editTaskState,
        due_date: editTaskDueDate || undefined,
      };

      await apiPut(API_ENDPOINTS.tasks.update(selectedTask.id), updateData);

      // Update assignees
      const currentAssigneeIds = selectedTask.assignees?.map((a) => a.id) || [];
      const toAdd = editTaskAssignees.filter(
        (id) => !currentAssigneeIds.includes(id),
      );
      const toRemove = currentAssigneeIds.filter(
        (id) => !editTaskAssignees.includes(id),
      );

      // Add new assignees
      for (const userId of toAdd) {
        await apiPost(API_ENDPOINTS.tasks.assign(selectedTask.id, userId), {});
      }

      // Remove unassigned users
      for (const userId of toRemove) {
        await apiDelete(API_ENDPOINTS.tasks.unassign(selectedTask.id, userId));
      }

      // Refresh task with updated data
      const updatedTask = await fetchTaskById(selectedTask.id);
      if (updatedTask) {
        setTasks(
          tasks.map((task) =>
            task.id === selectedTask.id ? updatedTask : task,
          ),
        );
      }

      setShowEditModal(false);
      setSelectedTask(null);
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      console.error("Error updating task:", err);
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteConfirm = (task: TaskWithAssignees) => {
    setSelectedTask(task);
    setShowDeleteConfirm(true);
    setError("");
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      setDeleting(true);
      setError("");

      await apiDelete(API_ENDPOINTS.tasks.delete(selectedTask.id));

      // Remove task from local state
      setTasks(tasks.filter((task) => task.id !== selectedTask.id));

      setShowDeleteConfirm(false);
      setSelectedTask(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      console.error("Error deleting task:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Group tasks by state
  const scheduledTasks = tasks.filter(
    (task) => task.state === TaskState.SCHEDULED,
  );
  const inProgressTasks = tasks.filter(
    (task) => task.state === TaskState.IN_PROGRESS,
  );
  const completedTasks = tasks.filter(
    (task) => task.state === TaskState.COMPLETED,
  );

  // No project found for the user
  if (!projectId) {
    return (
      <div className="bg-surface dark:bg-surface-dark flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-text-primary text-2xl font-bold">
            No Project Selected
          </h2>
          <p className="text-text-secondary mt-2">
            Please select a project from the dashboard
          </p>
          <Link
            href="/dashboard"
            className="from-primary to-primary-dark mt-6 inline-block rounded-xl bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen">
      {/* Header */}
      <div className="border-border bg-card/50 dark:border-border-dark dark:bg-card-dark/50 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <FiChevronLeft size={28} />
                </Link>
                <div>
                  <h1 className="text-text-primary text-3xl font-bold">
                    {loading ? "Loading..." : project?.title || "Project"}
                  </h1>
                  <p className="text-text-secondary mt-1 text-sm">
                    {loading
                      ? "Loading project details..."
                      : project?.description || "No description"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group from-primary to-primary-dark relative overflow-hidden rounded-xl bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FiPlus size={22} />
                  New Task
                </span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="bg-card/60 dark:bg-card-dark/60 rounded-xl p-4 backdrop-blur">
              <div className="text-text-secondary text-sm font-medium">
                Total Tasks
              </div>
              <div className="text-text-primary mt-2 text-3xl font-bold">
                {tasks.length}
              </div>
            </div>
            <div className="rounded-xl bg-purple-500/20 p-4 backdrop-blur dark:bg-purple-500/20">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Scheduled
              </div>
              <div className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                {scheduledTasks.length}
              </div>
            </div>
            <div className="rounded-xl bg-blue-500/20 p-4 backdrop-blur dark:bg-blue-500/20">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                In Progress
              </div>
              <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                {inProgressTasks.length}
              </div>
            </div>
            <div className="rounded-xl bg-green-500/20 p-4 backdrop-blur dark:bg-green-500/20">
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                Completed
              </div>
              <div className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
                {completedTasks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
              <p className="text-text-secondary mt-4">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Scheduled Column */}
            <KanbanColumn
              title="Scheduled"
              color="purple"
              tasks={scheduledTasks}
              onUpdateState={handleUpdateTaskState}
              onEditClick={openEditModal}
              onDeleteClick={openDeleteConfirm}
            />

            {/* In Progress Column */}
            <KanbanColumn
              title="In Progress"
              color="blue"
              tasks={inProgressTasks}
              onUpdateState={handleUpdateTaskState}
              onEditClick={openEditModal}
              onDeleteClick={openDeleteConfirm}
            />

            {/* Completed Column */}
            <KanbanColumn
              title="Completed"
              color="green"
              tasks={completedTasks}
              onUpdateState={handleUpdateTaskState}
              onEditClick={openEditModal}
              onDeleteClick={openDeleteConfirm}
            />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card dark:bg-card-dark w-full max-w-lg rounded-2xl p-8 shadow-2xl">
            <h2 className="text-text-primary text-2xl font-bold">
              Create New Task
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              Add a new task to {project?.title}
            </p>

            {/* Error Message in Modal */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Implement user authentication"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  placeholder="Describe the task in detail..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  maxLength={2000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={newTaskState}
                    onChange={(e) =>
                      setNewTaskState(e.target.value as TaskState)
                    }
                    className="border-border bg-card text-text-primary focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  >
                    <option value={TaskState.SCHEDULED}>Scheduled</option>
                    <option value={TaskState.IN_PROGRESS}>In Progress</option>
                    <option value={TaskState.COMPLETED}>Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="border-border bg-card text-text-primary focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCreateTask}
                disabled={creating}
                className="from-primary to-primary-dark flex-1 rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                {creating ? "Creating..." : "Create Task"}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                  setNewTaskState(TaskState.SCHEDULED);
                  setNewTaskDueDate("");
                  setError("");
                }}
                disabled={creating}
                className="border-border bg-card text-text-primary hover:bg-card dark:border-border-dark dark:bg-card-dark dark:hover:bg-card-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card dark:bg-card-dark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-8 shadow-2xl">
            <h2 className="text-text-primary text-2xl font-bold">Edit Task</h2>
            <p className="text-text-secondary mt-2 text-sm">
              Update task details and assignees
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  rows={3}
                  className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  maxLength={2000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={editTaskState}
                    onChange={(e) =>
                      setEditTaskState(e.target.value as TaskState)
                    }
                    className="border-border bg-card text-text-primary focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  >
                    <option value={TaskState.SCHEDULED}>Scheduled</option>
                    <option value={TaskState.IN_PROGRESS}>In Progress</option>
                    <option value={TaskState.COMPLETED}>Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="border-border bg-card text-text-primary focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Assignees
                </label>
                <div className="border-border dark:border-border-dark max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {project.users.map((user) => (
                    <label
                      key={user.id}
                      className="hover:bg-surface dark:hover:bg-surface-dark flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editTaskAssignees.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditTaskAssignees([
                              ...editTaskAssignees,
                              user.id,
                            ]);
                          } else {
                            setEditTaskAssignees(
                              editTaskAssignees.filter((id) => id !== user.id),
                            );
                          }
                        }}
                        className="text-primary focus:ring-primary/20 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="from-primary to-primary-dark flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r text-sm font-semibold text-white">
                        {user.username[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-text-primary text-sm font-medium">
                          {user.username}
                        </div>
                        <div className="text-text-secondary text-xs">
                          {user.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleUpdateTask}
                disabled={updating}
                className="from-primary to-primary-dark flex-1 rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                {updating ? "Updating..." : "Update Task"}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTask(null);
                  setError("");
                }}
                disabled={updating}
                className="border-border bg-card text-text-primary hover:bg-surface dark:border-border-dark dark:bg-card-dark dark:hover:bg-surface-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {showDeleteConfirm && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card dark:bg-card-dark w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <h2 className="text-text-primary text-2xl font-bold">
              Delete Task?
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              Are you sure you want to delete "{selectedTask.title}"? This
              action cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleDeleteTask}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Task"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedTask(null);
                  setError("");
                }}
                disabled={deleting}
                className="border-border bg-card text-text-primary hover:bg-surface dark:border-border-dark dark:bg-card-dark dark:hover:bg-surface-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface dark:bg-surface-dark flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-text-secondary mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <KanbanBoard />
    </Suspense>
  );
}
