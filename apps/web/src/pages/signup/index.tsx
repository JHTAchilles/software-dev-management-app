import { useState } from "react";
import { GetStartedButton } from "../../components/get_started_button";

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
		<div className="flex justify-center min-h-screen items-center bg-gray-50 dark:bg-gray-900">
			<div className="border shadow-md max-w-md w-full bg-white dark:bg-gray-900 rounded-lg p-4">
				<h1 className="text-2xl font-bold text-center">Sign Up</h1>
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
					<label className="flex flex-col gap-1">
						Confirm Password:
						<input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
						/>
					</label>
					<label className="flex flex-col gap-1">
						User License:
						<input
							type="text"
							value={userLicense}
							onChange={(e) => setUserLicense(e.target.value)}
							required
							className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700"
						/>
					</label>
					<div className="flex justify-center">
						<GetStartedButton className="w-50">Sign Up</GetStartedButton>
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
