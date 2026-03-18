"use client";

import type { ReactNode } from "react";
import { useAuth } from "../auth-context";

export function AdminGate({ children }: { children: (key: string | null) => ReactNode }) {
  const { role, adminKey } = useAuth();
  const isAdmin = role === "admin" && !!adminKey;

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <strong>Admin tools</strong>
        {isAdmin ? <span className="badge">unlocked</span> : <span className="badge">view only</span>}
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        {isAdmin ? children(adminKey) : <span style={{ color: "var(--muted)" }}>Sign in as admin to add or edit.</span>}
      </div>
    </div>
  );
}
