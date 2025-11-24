"use client";

import { useState } from "react";
import { LinkedButton } from "../../../components/linkedButton";
import Link from "next/link";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userLicense, setUserLicense] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    // Demo: just show a message
    setMessage(`Account created for ${email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="loginCard">
        <h1 className="mb-4 text-center text-[28px] font-semibold">
          Create your account
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-4 font-mono"
        >
          <label
            // style={{ fontFamily: "Roboto" }}
            className="flex flex-col gap-1"
          >
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-focus w-full rounded border border-gray-300 p-1 dark:border-gray-700 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-focus w-full rounded border border-gray-300 p-1 dark:border-gray-700 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-focus w-full rounded border border-gray-300 p-1 dark:border-gray-700 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-focus w-full rounded border border-gray-300 p-1 dark:border-gray-700 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            User License
            <input
              type="password"
              value={userLicense}
              onChange={(e) => setUserLicense(e.target.value)}
              required
              className="input-focus w-full rounded border border-gray-300 p-1 dark:border-gray-700 dark:bg-gray-800"
            />
          </label>
          <div className="mt-3">
            <LinkedButton className="w-full font-semibold">
              Create account
            </LinkedButton>
          </div>
        </form>
        <div className="flex items-center justify-center gap-1 p-1 text-[14px] text-gray-500">
          Already have an account?
          <Link href="/login">
            <span className="text-stone-600 hover:text-blue-900">Log In</span>
          </Link>
        </div>
        {message && (
          <p
            className={`mt-4 text-center font-medium ${message.includes("not match") ? "text-red-500" : "text-green-600"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
