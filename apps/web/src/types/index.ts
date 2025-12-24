/**
 * Shared TypeScript types for the web client.
 *
 * Mirrors backend API payloads (snake_case keys) for consistency.
 */

export interface User {
  /** User UUID. */
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  /** JWT access token. */
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  /** License key required to register (AAAA-BBBB-CCCC-DDDD). */
  license_key: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithUsers extends Project {
  users: UserBasicInfo[];
}

export interface UserBasicInfo {
  id: string;
  username: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  state: TaskState;
  due_date: string | null;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithAssignees extends Task {
  assignees: UserBasicInfo[];
}

export interface TaskWithDetails extends TaskWithAssignees {
  project: {
    id: string;
    title: string;
  };
}

export enum TaskState {
  /** Not started / planned. */
  SCHEDULED = "scheduled",
  /** Currently being worked on. */
  IN_PROGRESS = "in_progress",
  /** Finished. */
  COMPLETED = "completed",
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  state?: TaskState;
  due_date?: string;
  project_id: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  state?: TaskState;
  due_date?: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
}

export interface ApiError {
  /** Error message produced by the backend (FastAPI `detail`). */
  detail: string;
}
