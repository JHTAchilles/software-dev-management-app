"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiPlus, FiSettings } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { TaskWithAssignees, TaskState, UserBasicInfo } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanColumn } from "@/components/KanbanColumn";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { DeleteTaskModal } from "@/components/modals/DeleteTaskModal";
import { ProjectSettingsModal } from "@/components/modals/ProjectSettingsModal";
import { ProjectStats } from "@/components/ProjectStats";

import { useProjectTasks } from "@/hooks/useProjectTasks";

export function KanbanBoardView() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  // Custom hook to manage project and tasks
  const {
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
  } = useProjectTasks(projectId);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(
    null,
  );

  // Loading states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Create task form states
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

  // Project settings states
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      return;
    }
    // Catch fetch errors to redirect to 404 if project not found
    fetchProjectAndTasks().catch((err) => {
      if (
        err.message?.toLowerCase().includes("not found") ||
        err.message?.includes("404")
      ) {
        router.push("/404");
      }
    });

    // Set up polling - refresh every 10 seconds (silent mode)
    const interval = setInterval(() => {
      fetchProjectAndTasks(true).catch(console.error);
    }, 10000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [projectId]);

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
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        state: newTaskState,
        due_date: newTaskDueDate || undefined,
        project_id: projectId,
      });

      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskState(TaskState.SCHEDULED);
      setNewTaskDueDate("");
      setShowCreateModal(false);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTaskState = async (taskId: string, newState: TaskState) => {
    await updateTaskState(taskId, newState);
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
      await updateTask(
        selectedTask.id,
        {
          title: editTaskTitle,
          description: editTaskDescription || undefined,
          state: editTaskState,
          due_date: editTaskDueDate || undefined,
        },
        editTaskAssignees,
      );

      setShowEditModal(false);
      setSelectedTask(null);
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
      await deleteTask(selectedTask.id);
      setShowDeleteConfirm(false);
      setSelectedTask(null);
    } finally {
      setDeleting(false);
    }
  };

  const openProjectSettings = () => {
    if (!project) return;
    setEditProjectTitle(project.title);
    setEditProjectDescription(project.description || "");
    setShowProjectSettings(true);
    setError("");
  };

  const handleUpdateProject = async () => {
    if (!project || !editProjectTitle.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      setUpdating(true);
      await updateProject(editProjectTitle, editProjectDescription);
      alert("Project updated successfully!");
    } finally {
      setUpdating(false);
      setShowProjectSettings(false);
    }
  };

  const handleAddUserToProject = async () => {
    if (!project || !newUserEmail.trim()) {
      setError("Please enter a user email");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      // First, get the user by email
      const user = await apiGet<UserBasicInfo>(
        API_ENDPOINTS.users.byEmail(newUserEmail.trim()),
      );

      // Check if user is already in the project
      if (project.users.some((u) => u.id === user.id)) {
        setError("User is already a member of this project");
        setUpdating(false);
        return;
      }

      // Add user to project
      await apiPost(API_ENDPOINTS.projects.addUser(project.id, user.id), {});

      // Refresh project data to get updated user list
      await fetchProjectAndTasks();

      setNewUserEmail("");
      setError("");
      alert(`${user.username} added to project successfully!`);
    } catch (err: any) {
      if (
        err.message?.includes("404") ||
        err.message?.toLowerCase().includes("not found")
      ) {
        setError("No user found with that email address");
      } else {
        setError(err.message || "Failed to add user");
      }
      console.error("Error adding user:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveUserFromProject = async (userId: string) => {
    if (!project) return;

    if (project.users.length <= 1) {
      setError("Cannot remove the last user from the project");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      // Find all tasks in this project assigned to this user
      const tasksAssignedToUser = tasks.filter((task) =>
        task.assignees?.some((assignee) => assignee.id === userId),
      );

      // Unassign the user from all their tasks
      for (const task of tasksAssignedToUser) {
        try {
          await apiDelete(API_ENDPOINTS.tasks.unassign(task.id, userId));
        } catch (err) {
          console.error(`Failed to unassign task ${task.id}:`, err);
        }
      }

      // Remove user from project
      await removeUserFromProject(userId);

      // Refresh tasks to update UI
      await fetchProjectAndTasks();
    } catch (err: any) {
      setError(err.message || "Failed to remove user");
      console.error("Error removing user:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!project || !user) return;

    if (project.users.length <= 1) {
      setError(
        "Cannot leave the project as the only member. Please delete the project instead.",
      );
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to leave "${project.title}"? You will no longer have access to this project.`,
    );

    if (!confirmed) return;

    try {
      setUpdating(true);
      setError("");

      // Find all tasks assigned to current user
      const tasksAssignedToUser = tasks.filter((task) =>
        task.assignees?.some((assignee) => assignee.id === user.id),
      );

      // Unassign current user from all their tasks
      for (const task of tasksAssignedToUser) {
        try {
          await apiDelete(API_ENDPOINTS.tasks.unassign(task.id, user.id));
        } catch (err) {
          console.error(`Failed to unassign task ${task.id}:`, err);
        }
      }

      // Remove current user from project
      await removeUserFromProject(user.id);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to leave project");
      console.error("Error leaving project:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone and will delete all tasks.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteProject();
      router.push("/dashboard2");
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
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <FiChevronLeft size={32} />
                </Link>
                <div className="flex-1">
                  <h1 className="text-text-primary text-3xl font-bold">
                    {loading ? "Loading..." : project?.title || "Project"}
                  </h1>
                  <p className="text-text-secondary mt-1 max-h-12 overflow-y-auto text-sm whitespace-pre-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {loading
                      ? "Loading project details..."
                      : project?.description || "No description"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={openProjectSettings}
                className="text-text-secondary hover:text-text-primary hover:bg-surface dark:hover:bg-surface-dark rounded-lg p-3 transition-all"
                title="Project Settings"
              >
                <FiSettings size={22} />
              </button>
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
          <ProjectStats
            totalTasks={tasks.length}
            scheduledTasks={scheduledTasks.length}
            inProgressTasks={inProgressTasks.length}
            completedTasks={completedTasks.length}
          />
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
            <KanbanColumn
              title="Scheduled"
              color="purple"
              tasks={scheduledTasks}
              onUpdateState={handleUpdateTaskState}
              onEditClick={openEditModal}
              onDeleteClick={openDeleteConfirm}
            />
            <KanbanColumn
              title="In Progress"
              color="blue"
              tasks={inProgressTasks}
              onUpdateState={handleUpdateTaskState}
              onEditClick={openEditModal}
              onDeleteClick={openDeleteConfirm}
            />
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

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          projectTitle={project?.title || ""}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDescription={newTaskDescription}
          setNewTaskDescription={setNewTaskDescription}
          newTaskState={newTaskState}
          setNewTaskState={setNewTaskState}
          newTaskDueDate={newTaskDueDate}
          setNewTaskDueDate={setNewTaskDueDate}
          error={error}
          creating={creating}
          onCreateTask={handleCreateTask}
          onClose={() => {
            setShowCreateModal(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskState(TaskState.SCHEDULED);
            setNewTaskDueDate("");
            setError("");
          }}
        />
      )}

      {showEditModal && selectedTask && project && (
        <EditTaskModal
          selectedTask={selectedTask}
          projectUsers={project.users}
          editTaskTitle={editTaskTitle}
          setEditTaskTitle={setEditTaskTitle}
          editTaskDescription={editTaskDescription}
          setEditTaskDescription={setEditTaskDescription}
          editTaskState={editTaskState}
          setEditTaskState={setEditTaskState}
          editTaskDueDate={editTaskDueDate}
          setEditTaskDueDate={setEditTaskDueDate}
          editTaskAssignees={editTaskAssignees}
          setEditTaskAssignees={setEditTaskAssignees}
          error={error}
          updating={updating}
          onUpdateTask={handleUpdateTask}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
            setError("");
          }}
        />
      )}

      {showDeleteConfirm && selectedTask && (
        <DeleteTaskModal
          selectedTask={selectedTask}
          error={error}
          deleting={deleting}
          onDeleteTask={handleDeleteTask}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedTask(null);
            setError("");
          }}
        />
      )}

      {showProjectSettings && project && user && (
        <ProjectSettingsModal
          project={project}
          currentUserId={user.id}
          editProjectTitle={editProjectTitle}
          setEditProjectTitle={setEditProjectTitle}
          editProjectDescription={editProjectDescription}
          setEditProjectDescription={setEditProjectDescription}
          newUserEmail={newUserEmail}
          setNewUserEmail={setNewUserEmail}
          error={error}
          updating={updating}
          deleting={deleting}
          onUpdateProject={handleUpdateProject}
          onAddUserToProject={handleAddUserToProject}
          onRemoveUserFromProject={handleRemoveUserFromProject}
          onLeaveProject={handleLeaveProject}
          onDeleteProject={handleDeleteProject}
          onClose={() => {
            setShowProjectSettings(false);
            setError("");
          }}
        />
      )}
    </div>
  );
}
