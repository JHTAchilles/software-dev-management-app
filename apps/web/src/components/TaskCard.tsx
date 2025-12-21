"use client";

import { useState, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { FiMoreVertical, FiCalendar, FiUser, FiMove } from "react-icons/fi";
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
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <FiMoreVertical size={20} />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="bg-card dark:bg-card-dark border-border dark:border-border-dark absolute top-6 right-0 z-10 w-40 rounded-lg border shadow-xl sm:w-48">
                <button
                  onClick={() => {
                    onUpdateState(task.id, TaskState.SCHEDULED);
                    setShowMenu(false);
                  }}
                  className="hover:bg-surface dark:hover:bg-surface-dark text-text-primary w-full rounded-t-lg px-4 py-2 text-left text-sm"
                >
                  Move to Scheduled
                </button>
                <button
                  onClick={() => {
                    onUpdateState(task.id, TaskState.IN_PROGRESS);
                    setShowMenu(false);
                  }}
                  className="hover:bg-surface dark:hover:bg-surface-dark text-text-primary w-full px-4 py-2 text-left text-sm"
                >
                  Move to In Progress
                </button>
                <button
                  onClick={() => {
                    onUpdateState(task.id, TaskState.COMPLETED);
                    setShowMenu(false);
                  }}
                  className="hover:bg-surface dark:hover:bg-surface-dark text-text-primary w-full px-4 py-2 text-left text-sm"
                >
                  Move to Completed
                </button>
                {(onEditClick || onDeleteClick) && (
                  <>
                    {/* <div className="border-border dark:border-border-dark my-1" /> */}
                    {onEditClick && (
                      <button
                        onClick={() => {
                          onEditClick(task);
                          setShowMenu(false);
                        }}
                        className="hover:bg-surface dark:hover:bg-surface-dark text-text-primary w-full px-4 py-2 text-left text-sm"
                      >
                        Edit Task
                      </button>
                    )}
                    {onDeleteClick && (
                      <button
                        onClick={() => {
                          onDeleteClick(task);
                          setShowMenu(false);
                        }}
                        className="hover:bg-surface dark:hover:bg-surface-dark w-full rounded-b-lg px-4 py-2 text-left text-sm text-red-600 dark:text-red-400"
                      >
                        Delete Task
                      </button>
                    )}
                  </>
                )}
              </div>
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
            <div className="text-text-secondary flex items-center gap-2 text-xs">
              <FiCalendar size={16} />
              <span>{formatTaskDate(task.due_date)}</span>
            </div>
          )}

          {task.assignees && task.assignees.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
