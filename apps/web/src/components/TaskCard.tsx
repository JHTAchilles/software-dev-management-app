"use client";

import { useState, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  FiMoreVertical,
  FiCalendar,
  FiUser,
  FiMove,
  FiTrash2,
} from "react-icons/fi";
import { TaskWithAssignees, TaskState } from "@/types";
import { formatTaskDate } from "@/utils/date";

interface TaskCardProps {
  task: TaskWithAssignees;
  colorHeader: string;
  onUpdateState: (taskId: string, newState: TaskState) => void;
  onEditClick?: (task: TaskWithAssignees) => void;
  onDeleteClick?: (task: TaskWithAssignees) => void;
}

export function TaskCard({
  task,
  colorHeader,
  onUpdateState,
  onEditClick,
  onDeleteClick,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        task,
        currentState: task.state,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card dark:bg-card-dark group border-border dark:border-border-dark relative rounded-lg border p-4 shadow-sm hover:shadow-md ${
        isDragging ? "cursor-grabbing opacity-0" : "transition-all"
      }`}
    >
      <div
        className={`absolute top-0 left-0 h-1 w-full rounded-t-lg bg-linear-to-r ${colorHeader}`}
      />

      <div className="mt-2">
        <div className="flex items-start justify-between gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="text-text-secondary hover:text-text-primary shrink-0 cursor-grab touch-none active:cursor-grabbing"
            aria-label="Drag task"
          >
            <FiMove size={18} />
          </button>

          <h4 className="text-text-primary flex-1 font-semibold wrap-break-word">
            {task.title}
          </h4>
          <div className="relative shrink-0" ref={menuRef}>
            {onEditClick && (
              <button
                onClick={() => onEditClick(task)}
                className="text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <FiMoreVertical size={20} />
              </button>
            )}
          </div>
        </div>

        {task.description && (
          <p className="text-text-secondary mt-2 line-clamp-2 text-sm">
            {task.description}
          </p>
        )}

        <div className="mt-3 space-y-2">
          {task.due_date && (
            <div
              className={`flex items-center gap-2 text-xs ${
                new Date(task.due_date) < new Date() &&
                task.state !== TaskState.COMPLETED
                  ? "text-red-600 dark:text-red-400"
                  : new Date(task.due_date).getTime() - new Date().getTime() <
                        24 * 60 * 60 * 1000 &&
                      new Date(task.due_date) > new Date() &&
                      task.state !== TaskState.COMPLETED
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-text-secondary"
              }`}
            >
              <FiCalendar size={16} />
              <span>{formatTaskDate(task.due_date)}</span>
            </div>
          )}

          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiUser className="text-text-secondary" size={16} />
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <div
                      key={assignee.id}
                      className="from-primary to-primary-dark ring-card dark:ring-card-dark flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-r text-xs font-semibold text-white ring-2"
                      title={assignee.username}
                    >
                      {(assignee.username?.[0] || "?").toUpperCase()}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="bg-surface dark:bg-surface-dark text-text-secondary ring-card dark:ring-card-dark flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ring-2">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
              {onDeleteClick && (
                <button
                  onClick={() => {
                    onDeleteClick(task);
                  }}
                  className="text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ) : (
            onDeleteClick && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onDeleteClick(task);
                  }}
                  className="text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <FiTrash2 />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
