/**
 * API URL and endpoint helpers.
 *
 * This file keeps URL construction in one place so components/hooks
 * don’t hardcode paths.
 */

// API base URL - configure this based on your environment
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
  },
  users: {
    /** Lookup a user by email address (URL-encoded). */
    byEmail: (email: string) =>
      `${API_BASE_URL}/users/email/${encodeURIComponent(email)}`,
  },
  projects: {
    list: `${API_BASE_URL}/projects`,
    /** Project details by UUID. */
    detail: (id: string) => `${API_BASE_URL}/projects/${id}`,
    create: `${API_BASE_URL}/projects`,
    /** Update a project by UUID. */
    update: (id: string) => `${API_BASE_URL}/projects/${id}`,
    /** Delete a project by UUID. */
    delete: (id: string) => `${API_BASE_URL}/projects/${id}`,
    /** Add a user to a project. */
    addUser: (projectId: string, userId: string) =>
      `${API_BASE_URL}/projects/${projectId}/users/${userId}`,
    /** Remove a user from a project. */
    removeUser: (projectId: string, userId: string) =>
      `${API_BASE_URL}/projects/${projectId}/users/${userId}`,
  },
  tasks: {
    /** List tasks for a project. */
    list: (projectId: string) => `${API_BASE_URL}/tasks/project/${projectId}`,
    assignedToMe: `${API_BASE_URL}/tasks/assigned-to-me`,
    /** Task details by UUID. */
    detail: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    create: `${API_BASE_URL}/tasks`,
    /** Update a task by UUID. */
    update: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    /** Delete a task by UUID. */
    delete: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    /** Assign a user to a task. */
    assign: (taskId: string, userId: string) =>
      `${API_BASE_URL}/tasks/${taskId}/assign/${userId}`,
    /** Unassign a user from a task. */
    unassign: (taskId: string, userId: string) =>
      `${API_BASE_URL}/tasks/${taskId}/assign/${userId}`,
  },
};
