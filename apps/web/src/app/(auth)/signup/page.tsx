"use client";

import { FiUserPlus } from "react-icons/fi";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!licenseKey || !licenseKey.trim()) {
      setError("License key is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        email,
        password,
        license_key: licenseKey.toUpperCase(),
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-surface-dark flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* Signup Card */}
        <div className="bg-card/80 dark:bg-card-dark/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="from-primary to-primary-dark mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r pl-1.5">
              <FiUserPlus size={32} />
            </div>
            <h1 className="text-text-primary text-3xl font-bold">
              Create Account
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              Join us to start managing your projects
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                minLength={3}
                maxLength={30}
                placeholder="Choose a username"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-text-primary mb-2 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="licenseKey"
                className="text-text-primary mb-2 block text-sm font-medium"
              >
                License Key
              </label>
              <input
                id="licenseKey"
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                required
                disabled={loading}
                placeholder="AAAA-BBBB-CCCC-DDDD"
                maxLength={19}
                pattern="[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 font-mono text-sm uppercase transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
              <p className="text-text-secondary mt-1 text-xs">
                Enter your license key to create an account
              </p>
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
                minLength={6}
                placeholder="Create a password (min 6 characters)"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-text-primary mb-2 block text-sm font-medium"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Confirm your password"
                className="border-border bg-card text-text-primary placeholder-text-secondary/50 focus:border-primary focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                disabled={loading}
                className="border-border text-primary focus:ring-primary/20 mt-1 h-4 w-4 rounded focus:ring-2"
              />
              <span className="text-text-secondary mt-1 text-xs">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="from-primary to-primary-dark w-full rounded-lg bg-linear-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {message}
            </div>
          )}

          {/* Footer */}
          <div className="text-text-secondary mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-dark font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
