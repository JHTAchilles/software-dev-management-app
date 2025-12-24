"use client";

interface ProjectStatsProps {
  totalTasks: number;
  scheduledTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

/**
 * Summary stats for a project board.
 *
 * Expects precomputed counts (does not compute from task list).
 */
export function ProjectStats({
  totalTasks,
  scheduledTasks,
  inProgressTasks,
  completedTasks,
}: ProjectStatsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="bg-card/60 dark:bg-card-dark/60 rounded-xl p-4 backdrop-blur">
        <div className="text-text-secondary text-sm font-medium">
          Total Tasks
        </div>
        <div className="text-text-primary mt-2 text-3xl font-bold">
          {totalTasks}
        </div>
      </div>
      <div className="rounded-xl bg-purple-500/20 p-4 backdrop-blur dark:bg-purple-500/20">
        <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
          Scheduled
        </div>
        <div className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
          {scheduledTasks}
        </div>
      </div>
      <div className="rounded-xl bg-blue-500/20 p-4 backdrop-blur dark:bg-blue-500/20">
        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
          In Progress
        </div>
        <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
          {inProgressTasks}
        </div>
      </div>
      <div className="rounded-xl bg-green-500/20 p-4 backdrop-blur dark:bg-green-500/20">
        <div className="text-sm font-medium text-green-700 dark:text-green-300">
          Completed
        </div>
        <div className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
          {completedTasks}
        </div>
      </div>
    </div>
  );
}
