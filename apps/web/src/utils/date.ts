/**
 * Formats a task due date string into a compact, readable form.
 *
 * Returns `null` when no date is provided (convenient for conditional rendering).
 */
export const formatTaskDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a date string for dashboard lists/cards (no time component).
 */
export const formatDashboardDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
