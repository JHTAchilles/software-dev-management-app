"use client";

import Link from "next/link";

// Mock data for projects (replace with real data from backend later)
const projects = [
  {
    id: 1,
    name: "Kanban App Frontend",
    description:
      "Build the user interface for the Kanban task manager using Next.js and Tailwind CSS.",
    status: "In Progress",
    tasks: 12,
    members: 3,
  },
  {
    id: 2,
    name: "Backend API",
    description:
      "Develop the FastAPI backend for user authentication, task management, and license validation.",
    status: "Planning",
    tasks: 8,
    members: 2,
  },
  {
    id: 3,
    name: "Database Design",
    description:
      "Design and implement the PostgreSQL database schema for users, projects, tasks, and licenses.",
    status: "Completed",
    tasks: 5,
    members: 1,
  },
];

export default function dashboard() {
  return (
    <>
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Project Dashboard</h1>
            <button
              onClick={() => {}}
              className="group from-primary to-primary-dark relative overflow-hidden rounded-xl bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                New Project
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {projects.length === 3 && (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No projects yet. Create your first project to get started!
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const statusColor =
    {
      "In Progress":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }[project.status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

  return (
    <>
      <Link href={`/projects/${project.id}`}>
        <div className="cursor-pointer rounded-lg bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h2>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
            >
              {project.status}
            </span>
          </div>
          <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-300">
            {project.description}
          </p>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{project.tasks} tasks</span>
            <span>{project.members} members</span>
          </div>
        </div>
      </Link>
    </>
  );
}
