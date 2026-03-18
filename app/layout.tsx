import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthProvider } from "./auth-context";
import SessionGate from "./components/SessionGate";

export const metadata = {
  title: "Team Stats",
  description: "Lightweight stats and RSVP tracker for your team"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SessionGate>
            <nav className="navbar">
              <div style={{ fontWeight: 800 }}>BenchBoss</div>
              <Link href="/">Skaters</Link>
              <Link href="/goalies">Goalies</Link>
              <Link href="/games">Games</Link>
              <Link href="/schedule">Schedule / RSVPs</Link>
            </nav>
            <main className="container">{children}</main>
          </SessionGate>
        </AuthProvider>
      </body>
    </html>
  );
}
