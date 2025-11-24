import { LinkedButton } from "../components/linkedButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100">
      <main className="w-full max-w-2xl px-4 py-12 text-center">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight whitespace-nowrap md:text-4xl">
          Software Dev Kanban Manager
        </h1>
        <p className="mb-8 text-lg text-gray-700 md:text-xl dark:text-gray-300">
          Organize your software projects, manage tasks visually, and
          collaborate with your team efficiently.
        </p>
        <div className="mb-10 flex flex-col gap-6">
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
        <LinkedButton
          href="/login"
          className="mx-auto w-48 py-3 text-lg font-semibold"
        >
          Get Started
        </LinkedButton>
      </main>
      {/* <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Software Dev Kanban Manager
      </footer> */}
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
    <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
      <h2 className="mb-2 text-lg font-bold text-blue-700 dark:text-blue-300">
        {title}
      </h2>
      <p className="text-base text-gray-700 dark:text-gray-200">{children}</p>
    </div>
  );
}
