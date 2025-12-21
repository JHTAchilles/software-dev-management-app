"use client";

import { FiUserCheck } from "react-icons/fi";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-surface-dark flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card/80 dark:bg-card-dark/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="from-primary to-primary-dark mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r pl-1.5">
              <FiUserCheck size={32} />
            </div>
            <h1 className="text-text-primary text-3xl font-bold">
              Welcome Back
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="text-text-primary mb-2 block text-sm font-medium"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your username"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-text-primary mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded focus:ring-2"
                />
                <span className="text-text-secondary">Remember me</span>
              </label>
              {/* <Link
                href="/forgot-password"
                className="text-primary hover:text-primary-dark"
              >
                Forgot password?
              </Link> */}
            </div>

            <button
              type="submit"
              className="from-primary to-primary-dark w-full rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Sign In
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {message}
            </div>
          )}

          {/* Footer */}
          <div className="text-text-secondary mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary-dark font-semibold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
