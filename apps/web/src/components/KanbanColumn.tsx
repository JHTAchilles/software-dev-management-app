"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskWithAssignees, TaskState } from "@/types";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  title: string;
  color: "purple" | "blue" | "green";
  tasks: TaskWithAssignees[];
  onUpdateState: (taskId: string, newState: TaskState) => void;
  onEditClick?: (task: TaskWithAssignees) => void;
  onDeleteClick?: (task: TaskWithAssignees) => void;
}

export function KanbanColumn({
  title,
  color,
  tasks,
  onUpdateState,
  onEditClick,
  onDeleteClick,
}: KanbanColumnProps) {
  // Map title to TaskState enum
  const columnState: TaskState =
    title === "Scheduled"
      ? TaskState.SCHEDULED
      : title === "In Progress"
        ? TaskState.IN_PROGRESS
        : TaskState.COMPLETED;

  const { setNodeRef, isOver } = useDroppable({
    id: columnState,
  });

  const colorClasses = {
    purple: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      border: "border-purple-500/30",
      text: "text-purple-700 dark:text-purple-300",
      header: "from-purple-500 to-pink-500",
    },
    blue: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/30",
      text: "text-blue-700 dark:text-blue-300",
      header: "from-blue-500 to-cyan-500",
    },
    green: {
      bg: "bg-green-500/10 dark:bg-green-500/20",
      border: "border-green-500/30",
      text: "text-green-700 dark:text-green-300",
      header: "from-green-500 to-emerald-500",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl ${colors.bg} ${colors.border} border p-4 transition-all ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`text-lg font-bold ${colors.text}`}>{title}</h3>
        <span
          className={`rounded-full ${colors.bg} px-3 py-1 text-sm font-semibold ${colors.text}`}
        >
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-text-secondary py-8 text-center text-sm">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              colorHeader={colors.header}
              onUpdateState={onUpdateState}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
