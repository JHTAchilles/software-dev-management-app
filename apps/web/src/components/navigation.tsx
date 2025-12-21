"use client";

import { FiMenu, FiX, FiTrello } from "react-icons/fi";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Don't show normal nav if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <nav className="border-border bg-card/80 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="from-primary to-primary-dark flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-r">
              <FiTrello size={24} />
            </div>
            <span className="text-text-primary text-lg font-bold">
              Kanban Manager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/login"
              className="text-text-secondary hover:text-primary text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <button className="from-primary to-primary-dark rounded-lg bg-linear-to-r px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-border border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/login2"
                className="text-text-secondary hover:text-primary text-center text-sm font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/signup2" onClick={() => setIsMenuOpen(false)}>
                <button className="from-primary to-primary-dark w-full rounded-lg bg-linear-to-r px-4 py-2 text-sm font-semibold text-white">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
