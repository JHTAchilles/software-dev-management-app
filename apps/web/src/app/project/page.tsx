"use client";

import { useState } from "react";

// Mock data for tasks (replace with real data from backend later)
const initialTasks = {
  scheduled: [
    {
      id: 1,
      title: "Design UI Mockups",
      description: "Create wireframes for the login page",
      assignee: "Alice",
    },
    {
      id: 2,
      title: "Set up Database",
      description: "Initialize PostgreSQL schema",
      assignee: "Bob",
    },
  ],
  inProgress: [
    {
      id: 3,
      title: "Implement Authentication",
      description: "Add login/signup with license validation",
      assignee: "Charlie",
    },
  ],
  completed: [
    {
      id: 4,
      title: "Project Setup",
      description: "Initialize Next.js and FastAPI projects",
      assignee: "Alice",
    },
  ],
};

export default function ProjectPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  const addTask = (column: keyof typeof tasks) => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      description: newTaskDescription,
      assignee: newTaskAssignee,
    };
    setTasks((prev) => ({
      ...prev,
      [column]: [...prev[column], newTask],
    }));
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee("");
  };

  const moveTask = (
    taskId: number,
    fromColumn: keyof typeof tasks,
    toColumn: keyof typeof tasks,
  ) => {
    setTasks((prev) => {
      const task = prev[fromColumn].find((t) => t.id === taskId);
      if (!task) return prev;
      return {
        ...prev,
        [fromColumn]: prev[fromColumn].filter((t) => t.id !== taskId),
        [toColumn]: [...prev[toColumn], task],
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Project: Kanban App
          </h1>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KanbanColumn
            title="Scheduled"
            tasks={tasks.scheduled}
            onAddTask={() => addTask("scheduled")}
            onMoveTask={(taskId) => moveTask(taskId, "scheduled", "inProgress")}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskAssignee={newTaskAssignee}
            setNewTaskAssignee={setNewTaskAssignee}
          />
          <KanbanColumn
            title="In Progress"
            tasks={tasks.inProgress}
            onAddTask={() => addTask("inProgress")}
            onMoveTask={(taskId) => moveTask(taskId, "inProgress", "completed")}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskAssignee={newTaskAssignee}
            setNewTaskAssignee={setNewTaskAssignee}
          />
          <KanbanColumn
            title="Completed"
            tasks={tasks.completed}
            onAddTask={() => addTask("completed")}
            onMoveTask={() => {}}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskAssignee={newTaskAssignee}
            setNewTaskAssignee={setNewTaskAssignee}
          />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  tasks,
  onAddTask,
  onMoveTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskAssignee,
  setNewTaskAssignee,
}: {
  title: string;
  tasks: typeof initialTasks.scheduled;
  onAddTask: () => void;
  onMoveTask: (taskId: number) => void;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (value: string) => void;
  newTaskAssignee: string;
  setNewTaskAssignee: (value: string) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="mb-4 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMove={onMoveTask} />
        ))}
      </div>
      {showAddForm ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
          />
          <textarea
            placeholder="Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Assignee"
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onAddTask();
                setShowAddForm(false);
              }}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Task
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full rounded bg-gray-200 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          + Add Task
        </button>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onMove,
}: {
  task: (typeof initialTasks.scheduled)[0];
  onMove: (taskId: number) => void;
}) {
  return (
    <div className="rounded bg-gray-50 p-3 shadow-sm dark:bg-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-white">
        {task.title}
      </h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {task.description}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Assigned to: {task.assignee}
        </span>
      </div>
      <button
        onClick={() => onMove(task.id)}
        className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Move to Next
      </button>
    </div>
  );
}
