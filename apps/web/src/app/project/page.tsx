"use client";

import { useState, useEffect, Suspense } from "react";
import { FiChevronLeft, FiPlus } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/api";
import {
  TaskWithAssignees,
  TaskState,
  CreateTaskRequest,
  UpdateTaskRequest,
  Project,
} from "@/types";
import { KanbanColumn } from "@/components/KanbanColumn";

function KanbanBoard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskState, setNewTaskState] = useState<TaskState>(
    TaskState.SCHEDULED,
  );
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

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
      const projectData = await apiGet<Project>(
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
            />

            {/* In Progress Column */}
            <KanbanColumn
              title="In Progress"
              color="blue"
              tasks={inProgressTasks}
              onUpdateState={handleUpdateTaskState}
            />

            {/* Completed Column */}
            <KanbanColumn
              title="Completed"
              color="green"
              tasks={completedTasks}
              onUpdateState={handleUpdateTaskState}
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
