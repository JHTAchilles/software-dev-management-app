"use client";

import Link from "next/link";

import { formatDashboardDate } from "@/utils/date";

import { FiCalendar, FiChevronRight } from "react-icons/fi";
import { Project } from "@/types";

/**
 * Dashboard card that links to a project’s Kanban board.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`}>
      <div className="group bg-card dark:bg-card-dark border-border dark:border-border-dark relative overflow-hidden rounded-2xl border p-6 shadow-lg transition-all hover:scale-105 hover:shadow-2xl">
        {/* Gradient Header */}
        <div className="absolute top-0 left-0 h-1.5 w-full bg-linear-to-r from-purple-500 to-pink-500" />

        <div className="mb-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-text-primary text-xl font-bold">
              {project.title}
            </h3>
          </div>
          <p className="text-text-secondary line-clamp-2 min-h-10 text-sm">
            {project.description || "No description provided"}
          </p>
        </div>

        {/* Metadata */}
        <div className="text-text-secondary space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <FiCalendar size={16} />
            <span>Created: {formatDashboardDate(project.created_at)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end text-sm">
          <div className="text-primary flex items-center gap-1">
            <span className="font-medium">View Tasks</span>
            <FiChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
