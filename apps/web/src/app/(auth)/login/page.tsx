"use client";
import { useState } from "react";
import { LinkedButton } from "../../../components/linkedButton";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just show a message
    setMessage(`Logged in as ${email}`);
    alert(`Logged in as ${email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="loginCard">
        <h1 className="mb-5 text-center text-[28px] font-semibold">
          Welcome Back!
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
          <div className="mt-3">
            <LinkedButton className="w-full font-semibold">Log In</LinkedButton>
          </div>
        </form>
        <div className="flex items-center justify-center gap-1 p-1 text-[14px] text-gray-500">
          Don't have an account yet?
          <Link href="/signup">
            <span className="text-stone-600 hover:text-blue-900">Sign Up</span>
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

    // <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    //   <div className="w-full max-w-md rounded-lg border bg-white p-4 shadow-md dark:bg-gray-900">
    //     <h1 className="text-center text-2xl font-bold">Log In</h1>
    //     <div className="flex items-center justify-center gap-1">
    //       <span className="text-sm font-normal text-gray-600">
    //         Don't have an account yet?
    //       </span>
    //       <Link href="/signup">
    //         <span className="text-sm text-blue-600 underline hover:text-blue-900">
    //           Sign Up
    //         </span>
    //       </Link>
    //     </div>
    //     <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
    //       <label className="flex flex-col gap-1">
    //         Username:
    //         <input
    //           type="text"
    //           value={username}
    //           onChange={(e) => setUsername(e.target.value)}
    //           required
    //           className="mt-1 w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
    //         />
    //       </label>
    //       <label className="flex flex-col gap-1">
    //         Email:
    //         <input
    //           type="email"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //           required
    //           className="mt-1 w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
    //         />
    //       </label>
    //       <label className="flex flex-col gap-1">
    //         Password:
    //         <input
    //           type="password"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           required
    //           className="mt-1 w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
    //         />
    //       </label>
    //       <div className="flex justify-center">
    //         <GetStartedButton className="bg-brand hover:bg-brand-strong focus:ring-brand-medium rounded-base box-border w-50 border border-transparent px-4 py-2.5 text-sm leading-5 font-medium text-white shadow-xs focus:ring-4 focus:outline-none">
    //           Log In
    //         </GetStartedButton>
    //       </div>
    //     </form>
    //     {message && (
    //       <p
    //         className={`mt-4 text-center font-medium ${message.includes("not match") ? "text-red-500" : "text-green-600"}`}
    //       >
    //         {message}
    //       </p>
    //     )}
    //   </div>
    // </div>
  );
}
