"use client";

import { Suspense } from "react";
import { KanbanBoardView } from "@/components/KanbanBoardView";

export default function ProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface dark:bg-surface-dark flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-text-secondary mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <KanbanBoardView />
    </Suspense>
  );
}
