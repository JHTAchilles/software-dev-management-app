"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { FiLogOut, FiUser } from "react-icons/fi";

export default function AuthenticatedNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Only show nav on homepage, dashboard, and project pages when authenticated
  const shouldShowNav =
    pathname === "/" ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/project");

  if (!isAuthenticated || !user || !shouldShowNav) {
    return null;
  }

  return (
    <nav className="bg-card/80 dark:bg-card-dark/80 border-border dark:border-border-dark border-b backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-text-secondary text-2xl font-bold">
              Task Slayer
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Dashboard
            </Link>

            {/* User Menu */}
            <div className="border-border dark:border-border-dark flex items-center space-x-4 border-l pl-6">
              <div className="text-text-secondary flex items-center space-x-2">
                <FiUser className="h-4 w-4" />
                <span className="text-sm">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-text-secondary flex items-center space-x-2 transition-colors hover:text-red-500"
                title="Logout"
              >
                <FiLogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
