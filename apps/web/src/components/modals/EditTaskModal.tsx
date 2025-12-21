"use client";

import { TaskState, TaskWithAssignees, UserBasicInfo } from "@/types";

interface EditTaskModalProps {
  selectedTask: TaskWithAssignees;
  projectUsers: UserBasicInfo[];
  editTaskTitle: string;
  setEditTaskTitle: (value: string) => void;
  editTaskDescription: string;
  setEditTaskDescription: (value: string) => void;
  editTaskState: TaskState;
  setEditTaskState: (value: TaskState) => void;
  editTaskDueDate: string;
  setEditTaskDueDate: (value: string) => void;
  editTaskAssignees: string[];
  setEditTaskAssignees: (value: string[]) => void;
  error: string;
  updating: boolean;
  onUpdateTask: () => void;
  onClose: () => void;
}

export function EditTaskModal({
  selectedTask,
  projectUsers,
  editTaskTitle,
  setEditTaskTitle,
  editTaskDescription,
  setEditTaskDescription,
  editTaskState,
  setEditTaskState,
  editTaskDueDate,
  setEditTaskDueDate,
  editTaskAssignees,
  setEditTaskAssignees,
  error,
  updating,
  onUpdateTask,
  onClose,
}: EditTaskModalProps) {
  return (
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
              Task Title
            </label>
            <input
              type="text"
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !updating && editTaskTitle.trim()) {
                  onUpdateTask();
                }
              }}
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
                onChange={(e) => setEditTaskState(e.target.value as TaskState)}
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
              {projectUsers.map((user) => (
                <label
                  key={user.id}
                  className="hover:bg-surface dark:hover:bg-surface-dark flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={editTaskAssignees.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditTaskAssignees([...editTaskAssignees, user.id]);
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
            onClick={onUpdateTask}
            disabled={updating}
            className="from-primary to-primary-dark flex-1 rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {updating ? "Updating..." : "Update Task"}
          </button>
          <button
            onClick={onClose}
            disabled={updating}
            className="border-border bg-card text-text-primary hover:bg-surface dark:border-border-dark dark:bg-card-dark dark:hover:bg-surface-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
