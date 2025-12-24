import Footer from "../components/footer";
import AuthenticatedNav from "@/components/AuthenticatedNav";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

/**
 * Root layout for the Next.js app.
 *
 * Wraps the app with `AuthProvider` and renders shared navigation/footer.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-text-primary flex min-h-screen flex-col bg-linear-to-br from-(--gradient-from-surface) via-(--gradient-via-surface) to-(--gradient-to-surface)">
        <AuthProvider>
          <AuthenticatedNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
