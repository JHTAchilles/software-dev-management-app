"use client";

import { useState, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/api";
import { Project, CreateProjectRequest, Task } from "@/types";
import { ProjectCard } from "@/components/ProjectCard";

import { FiPlus, FiFolder } from "react-icons/fi";
import { formatTaskDate } from "@/utils/date";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardStat } from "@/components/DashboardStat";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
    fetchAssginedTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<Project[]>(API_ENDPOINTS.projects.list);
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssginedTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<Task[]>(API_ENDPOINTS.tasks.assignedToMe);
      setAssignedTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load assigned tasks");
      console.error("Error fetching assigned tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      setCreating(true);

      const projectData: CreateProjectRequest = {
        title: newProjectTitle,
        description: newProjectDescription || undefined,
      };

      const newProject = await apiPost<Project>(
        API_ENDPOINTS.projects.create,
        projectData,
      );

      setProjects([newProject, ...projects]);
      setNewProjectTitle("");
      setNewProjectDescription("");
      setError("");
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
      console.error("Error creating project:", err);
    } finally {
      setCreating(false);
    }
  };

  // Calculate stats from real project data
  const totalProjects = projects.length;
  const totalAssignedTasks = assignedTasks.length;

  return (
    <ProtectedRoute>
      <div className="bg-surface dark:bg-surface-dark min-h-screen">
        {/* Header */}
        <div className="border-border bg-card/50 dark:border-border-dark dark:bg-card-dark/50 border-b backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-text-primary text-3xl font-bold">
                  Projects
                </h1>
                <p className="text-text-secondary mt-1 text-sm">
                  Manage and track your software development projects
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="group from-primary to-primary-dark relative overflow-hidden rounded-xl bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FiPlus size={24} />
                  New Project
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DashboardStat title="Total Projects">
                {totalProjects}
              </DashboardStat>

              <DashboardStat title="Assigned Tasks">
                {totalAssignedTasks || 0}
              </DashboardStat>

              <div className="bg-card/60 dark:bg-card-dark/60 rounded-xl p-4 backdrop-blur">
                <div className="text-text-secondary text-sm font-medium">
                  Closest Due Date
                </div>
                <div className="text-text-primary text-l mt-2 truncate font-bold">
                  {(assignedTasks[0]?.due_date
                    ? formatTaskDate(assignedTasks[0]?.due_date)
                    : "No Assigned Due Date") || ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto max-w-7xl px-6 pt-4">
            <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p className="text-text-secondary mt-4">Loading projects...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="bg-card dark:bg-card-dark mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <FiFolder size={40} />
                </div>
                <h3 className="text-text-primary text-xl font-semibold">
                  No projects yet
                </h3>
                <p className="text-text-secondary mt-2">
                  Get started by creating your first project
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="from-primary to-primary-dark mt-6 rounded-xl bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105"
                >
                  Create Project
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-card dark:bg-card-dark w-full max-w-lg rounded-2xl p-8 shadow-2xl">
              <h2 className="text-text-primary text-2xl font-bold">
                Create New Project
              </h2>
              <p className="text-text-secondary mt-2 text-sm">
                Start a new project to organize your tasks
              </p>

              {/* Error Message in Modal */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Project Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mobile App Development"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of the project..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={4}
                    className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleCreateProject}
                  disabled={creating}
                  className="from-primary to-primary-dark flex-1 rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProjectTitle("");
                    setNewProjectDescription("");
                    setError("");
                  }}
                  disabled={creating}
                  className="border-border bg-card text-text-primary hover:bg-card dark:border-border-dark dark:bg-card-dark dark:hover:bg-card-dark flex-1 rounded-lg border px-6 py-3 font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
