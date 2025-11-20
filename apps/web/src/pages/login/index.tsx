import { useState } from "react";
import { GetStartedButton } from "../../components/get_started_button";
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
		<div className="flex justify-center min-h-screen items-center bg-gray-50 dark:bg-gray-900">
			<div className="border shadow-md max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-4">
				<h1 className="text-2xl font-bold text-center">Log In</h1>
				<div className="flex items-center gap-1 justify-center">
					<span className="text-sm text-gray-600 font-normal">
						Don't have an account yet?
					</span>
					<Link href="/signup">
						<span className="text-sm underline text-blue-600 hover:text-blue-900">
							Sign Up
						</span>
					</Link>
				</div>
				<form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
					<label className="flex flex-col gap-1">
						Username:
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
						/>
					</label>
					<label className="flex flex-col gap-1">
						Email:
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
						/>
					</label>
					<label className="flex flex-col gap-1">
						Password:
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
						/>
					</label>
					<div className="flex justify-center">
						<GetStartedButton className="w-50 text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
							Log In
						</GetStartedButton>
					</div>
				</form>
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
