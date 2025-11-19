import { GetStartedButton } from "../components/get_started_button";
import styles from "./page.module.css";

export default function Home() {
	return (
		<div
			className={styles.page}
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "var(--background)",
				color: "var(--foreground)",
			}}
		>
			<main style={{ textAlign: "center", maxWidth: 600 }}>
				<h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: 16 }}>
					Software Dev Kanban Manager
				</h1>
				<p style={{ fontSize: "1.25rem", marginBottom: 32 }}>
					Organize your software projects, manage tasks visually, and
					collaborate with your team efficiently.
				</p>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 24,
						marginBottom: 40,
					}}
				>
					<Feature title="Kanban Boards">
						Drag & drop tasks, columns, and track progress visually.
					</Feature>
					<Feature title="Team Collaboration">
						Assign tasks, comment, and work together in real time.
					</Feature>
					<Feature title="License Management">
						Secure access with license keys and user authentication.
					</Feature>
				</div>
				<div style={{ marginTop: 40, fontWeight: 500, fontSize: "1.1rem" }}>
					<GetStartedButton href="/login">Get Started</GetStartedButton>
				</div>
			</main>
			<footer style={{ marginTop: 64, fontSize: 14, color: "#888" }}>
				&copy; {new Date().getFullYear()} Software Dev Kanban Manager
			</footer>
		</div>
	);
}

function Feature({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ marginBottom: 8 }}>
			<h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 4 }}>
				{title}
			</h2>
			<p style={{ fontSize: "1rem", color: "#444" }}>{children}</p>
		</div>
	);
}
