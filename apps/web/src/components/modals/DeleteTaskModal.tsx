"use client";

import { TaskWithAssignees } from "@/types";

interface DeleteTaskModalProps {
  selectedTask: TaskWithAssignees;
  error: string;
  deleting: boolean;
  onDeleteTask: () => void;
  onClose: () => void;
}

/**
 * Confirmation modal for deleting a task.
 */
export function DeleteTaskModal({
  selectedTask,
  error,
  deleting,
  onDeleteTask,
  onClose,
}: DeleteTaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-card dark:bg-card-dark w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <h2 className="text-text-primary text-2xl font-bold">Delete Task?</h2>
        <p className="text-text-secondary mt-2 text-sm">
          Are you sure you want to delete "{selectedTask.title}"? This action
          cannot be undone.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            onClick={onDeleteTask}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Task"}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="border-border bg-card text-text-primary hover:bg-surface dark:border-border-dark dark:bg-card-dark dark:hover:bg-surface-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
