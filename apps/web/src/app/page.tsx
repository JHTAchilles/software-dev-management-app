import Link from "next/link";
import Navigation from "../components/navigation";

/**
 * Public marketing/landing page.
 *
 * Shows the unauthenticated navigation and a CTA to sign up.
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="text-center">
            {/* Heading */}
            <h1 className="text-text-primary mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Task Slayer
              <br />
              <span className="from-primary to-primary-dark bg-linear-to-r bg-clip-text text-5xl text-transparent">
                Software Dev Kanban Manager
              </span>
            </h1>

            {/* Description */}
            <p className="text-text-secondary mx-auto mb-10 max-w-2xl text-lg sm:text-xl">
              Organize your software projects, manage tasks visually, and
              collaborate with your team efficiently. The modern way to track
              your development workflow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <button className="group from-primary to-primary-dark relative overflow-hidden rounded-xl bg-linear-to-r px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <span className="text-xl transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                  <div className="from-primary-dark to-primary absolute inset-0 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
