"use client";

import { TaskState } from "@/types";

interface CreateTaskModalProps {
  projectTitle: string;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (value: string) => void;
  newTaskState: TaskState;
  setNewTaskState: (value: TaskState) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
  error: string;
  creating: boolean;
  onCreateTask: () => void;
  onClose: () => void;
}

/**
 * Modal dialog for creating a new task.
 *
 * This component is “controlled”: all form state is passed in and updated via
 * callbacks so the parent owns the source of truth.
 */
export function CreateTaskModal({
  projectTitle,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskState,
  setNewTaskState,
  newTaskDueDate,
  setNewTaskDueDate,
  error,
  creating,
  onCreateTask,
  onClose,
}: CreateTaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-card dark:bg-card-dark w-full max-w-lg rounded-2xl p-8 shadow-2xl">
        <h2 className="text-text-primary text-2xl font-bold">
          Create New Task
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Add a new task to {projectTitle}
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
                onChange={(e) => setNewTaskState(e.target.value as TaskState)}
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
            onClick={onCreateTask}
            disabled={creating}
            className="from-primary to-primary-dark flex-1 rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {creating ? "Creating..." : "Create Task"}
          </button>
          <button
            onClick={onClose}
            disabled={creating}
            className="border-border bg-card text-text-primary hover:bg-card dark:border-border-dark dark:bg-card-dark dark:hover:bg-card-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
