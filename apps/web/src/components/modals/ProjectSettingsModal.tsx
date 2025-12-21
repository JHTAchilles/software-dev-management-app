"use client";

import { useState } from "react";
import { ProjectWithUsers } from "@/types";

interface ProjectSettingsModalProps {
  project: ProjectWithUsers;
  currentUserId?: string;
  editProjectTitle: string;
  setEditProjectTitle: (value: string) => void;
  editProjectDescription: string;
  setEditProjectDescription: (value: string) => void;
  newUserEmail: string;
  setNewUserEmail: (value: string) => void;
  error: string;
  updating: boolean;
  deleting: boolean;
  onUpdateProject: () => void;
  onAddUserToProject: () => void;
  onRemoveUserFromProject: (userId: string) => void;
  onLeaveProject?: () => void;
  onDeleteProject: () => void;
  onClose: () => void;
}

export function ProjectSettingsModal({
  project,
  currentUserId,
  editProjectTitle,
  setEditProjectTitle,
  editProjectDescription,
  setEditProjectDescription,
  newUserEmail,
  setNewUserEmail,
  error,
  updating,
  deleting,
  onUpdateProject,
  onAddUserToProject,
  onRemoveUserFromProject,
  onLeaveProject,
  onDeleteProject,
  onClose,
}: ProjectSettingsModalProps) {
  // Tab State
  const [settingsTab, setSettingsTab] = useState<"edit" | "users" | "danger">(
    "edit",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-card dark:bg-card-dark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-8 shadow-2xl">
        <h2 className="text-text-primary text-2xl font-bold">
          Project Settings
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Manage {project.title}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-border dark:border-border-dark mt-6 flex gap-2 border-b">
          <button
            onClick={() => setSettingsTab("edit")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              settingsTab === "edit"
                ? "border-primary text-primary"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
          >
            Edit Project
          </button>
          <button
            onClick={() => setSettingsTab("users")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              settingsTab === "users"
                ? "border-primary text-primary"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setSettingsTab("danger")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              settingsTab === "danger"
                ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Edit Project Tab */}
          {settingsTab === "edit" && (
            <div className="space-y-4">
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={editProjectTitle}
                  onChange={(e) => setEditProjectTitle(e.target.value)}
                  className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  rows={4}
                  className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  maxLength={2000}
                />
              </div>

              <button
                onClick={onUpdateProject}
                disabled={updating}
                className="from-primary to-primary-dark w-full rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Manage Users Tab */}
          {settingsTab === "users" && (
            <div className="space-y-6">
              {/* Add User */}
              <div>
                <h3 className="text-text-primary mb-3 text-sm font-semibold">
                  Add User to Project
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter user email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !updating &&
                        newUserEmail.trim()
                      ) {
                        onAddUserToProject();
                      }
                    }}
                    className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark flex-1 rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                  />
                  <button
                    onClick={onAddUserToProject}
                    disabled={updating || !newUserEmail.trim()}
                    className="text-primary hover:bg-primary/10 rounded-lg px-6 py-3 font-semibold transition-colors disabled:opacity-50"
                  >
                    {updating ? "Adding..." : "Add"}
                  </button>
                </div>
                <p className="text-text-secondary mt-2 text-xs">
                  Enter the email address of the user you want to add to this
                  project.
                </p>
              </div>

              {/* Current Users */}
              <div>
                <h3 className="text-text-primary mb-3 text-sm font-semibold">
                  Current Members ({project.users.length})
                </h3>
                <div className="space-y-2">
                  {project.users
                    .sort((a, b) => {
                      // Current user goes to the bottom
                      if (a.id === currentUserId) return 1;
                      if (b.id === currentUserId) return -1;
                      return 0;
                    })
                    .map((user) => (
                      <div
                        key={user.id}
                        className="border-border dark:border-border-dark flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="from-primary to-primary-dark flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r text-sm font-semibold text-white">
                            {user.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-text-primary text-sm font-medium">
                              {user.username}
                              {currentUserId === user.id && (
                                <span className="text-text-secondary ml-2 text-xs">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-text-secondary text-xs">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        {currentUserId !== user.id && (
                          <button
                            onClick={() => onRemoveUserFromProject(user.id)}
                            disabled={updating || project.users.length === 1}
                            className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50 disabled:hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            title={
                              project.users.length === 1
                                ? "Cannot remove the last user"
                                : "Remove user from project"
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Leave Project */}
              {onLeaveProject && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20">
                  <h3 className="text-text-primary mb-2 text-sm font-semibold">
                    Leave Project
                  </h3>
                  <p className="text-text-secondary mb-3 text-xs">
                    Remove yourself from this project. You will lose access to
                    all tasks and project data.
                  </p>
                  <button
                    onClick={onLeaveProject}
                    disabled={updating}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700 disabled:opacity-50"
                    title={
                      project.users.length === 1
                        ? "Cannot leave as the only member"
                        : "Leave this project"
                    }
                  >
                    {updating ? "Leaving..." : "Leave Project"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Danger Zone Tab */}
          {settingsTab === "danger" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Delete Project
                </h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                  Once you delete a project, there is no going back. This will
                  permanently delete the project and all associated tasks.
                </p>
                <button
                  onClick={onDeleteProject}
                  disabled={deleting}
                  className="mt-4 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete This Project"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="border-border bg-card text-text-primary hover:bg-surface dark:border-border-dark dark:bg-card-dark dark:hover:bg-surface-dark w-full rounded-lg border px-6 py-3 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
