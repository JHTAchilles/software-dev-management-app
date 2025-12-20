import { ApiError } from "@/types";

/**
 * Helper function to make authenticated API calls
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

  if (options.body && typeof options.body === "object") {
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
 * Helper function to handle API errors
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = "An error occurred";

  try {
    const error: ApiError = await response.json();
    errorMessage = error.detail || errorMessage;
  } catch {
    // If JSON parsing fails, use default message
  }

  throw new Error(errorMessage);
}

/**
 * Make a GET request with authentication
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

/**
 * Make a POST request with authentication
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
 * Make a PUT request with authentication
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
 * Make a DELETE request with authentication
 */
export async function apiDelete(url: string): Promise<void> {
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    await handleApiError(response);
  }
}
