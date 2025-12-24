import { ApiError } from "@/types";

/**
 * Make an authenticated `fetch` request.
 *
 * Adds `Authorization: Bearer <token>` when available.
 * If a 401 is returned, clears the token and redirects to `/login`.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type for requests with body (string means it's already JSON.stringify'd)
  if (options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    // Implement a better Error handling for better UX
    throw new Error("Session expired. Please login again.");
  }

  return response;
}

/**
 * Convert a non-OK HTTP response into a thrown `Error`.
 *
 * Attempts to parse `{ detail: string }` from the backend, with a
 * safe fallback to status text.
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = "An error occurred";

  try {
    const error: ApiError = await response.json();
    errorMessage = error.detail || errorMessage;
  } catch {
    // If JSON parsing fails, use status text
    errorMessage = response.statusText || errorMessage;
  }

  // Include status code in error message for better error handling
  if (response.status === 404) {
    throw new Error(`Not found (404): ${errorMessage}`);
  }

  throw new Error(`${errorMessage} (${response.status})`);
}

/**
 * Typed GET request using `fetchWithAuth`.
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

/**
 * Typed POST request using `fetchWithAuth`.
 */
export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

/**
 * Typed PUT request using `fetchWithAuth`.
 */
export async function apiPut<T>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

/**
 * DELETE request using `fetchWithAuth`.
 *
 * Treats 204 as success.
 */
export async function apiDelete(url: string): Promise<void> {
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    await handleApiError(response);
  }
}
