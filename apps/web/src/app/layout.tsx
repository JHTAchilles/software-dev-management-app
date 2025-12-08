import Footer from "../components/footer";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-text-primary flex min-h-screen flex-col bg-linear-to-br from-(--gradient-from-surface) via-(--gradient-via-surface) to-(--gradient-to-surface)">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
