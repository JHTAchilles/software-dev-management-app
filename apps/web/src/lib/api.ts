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
  projects: {
    list: `${API_BASE_URL}/projects`,
    detail: (id: string) => `${API_BASE_URL}/projects/${id}`,
    create: `${API_BASE_URL}/projects`,
    update: (id: string) => `${API_BASE_URL}/projects/${id}`,
    delete: (id: string) => `${API_BASE_URL}/projects/${id}`,
    addUser: (projectId: string, userId: string) =>
      `${API_BASE_URL}/projects/${projectId}/users/${userId}`,
    removeUser: (projectId: string, userId: string) =>
      `${API_BASE_URL}/projects/${projectId}/users/${userId}`,
  },
  tasks: {
    list: (projectId: string) => `${API_BASE_URL}/tasks/project/${projectId}`,
    assignedToMe: `${API_BASE_URL}/tasks/assigned-to-me`,
    detail: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    create: `${API_BASE_URL}/tasks`,
    update: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    delete: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    assign: (taskId: string, userId: string) =>
      `${API_BASE_URL}/tasks/${taskId}/assign/${userId}`,
    unassign: (taskId: string, userId: string) =>
      `${API_BASE_URL}/tasks/${taskId}/assign/${userId}`,
  },
};
