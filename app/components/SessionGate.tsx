"use client";

import { useState } from "react";
import { useAuth } from "../auth-context";

const ADMIN_CODE = "18";
const VIEWER_CODE = "2026";

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const { role, setAdmin, setViewer } = useAuth();
  const [tab, setTab] = useState<"admin" | "viewer">("viewer");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (role) return <>{children}</>;

  const submit = () => {
    if (tab === "admin") {
      if (code === ADMIN_CODE) {
        setAdmin(code);
        setError(null);
      } else {
        setError("Wrong code");
      }
    } else {
      if (code === VIEWER_CODE) {
        setViewer();
        setError(null);
      } else {
        setError("Wrong code");
      }
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg,#0f172a,#0d6efd)", color: "white", display: "grid", placeItems: "center", zIndex: 9999 }}>
      <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "24px", width: "min(420px, 90vw)" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button onClick={() => { setTab("viewer"); setCode(""); setError(null); }} style={{ flex: 1, padding: "0.6rem", borderRadius: 10, border: tab === "viewer" ? "2px solid white" : "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "white", fontWeight: 700 }}>Viewer</button>
          <button onClick={() => { setTab("admin"); setCode(""); setError(null); }} style={{ flex: 1, padding: "0.6rem", borderRadius: 10, border: tab === "admin" ? "2px solid white" : "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "white", fontWeight: 700 }}>Admin</button>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={tab === "admin" ? "Enter admin code" : "Enter viewer code"}
            style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.2)", color: "white" }}
          />
          <button onClick={submit} style={{ padding: "0.75rem", borderRadius: 12, border: "none", background: "white", color: "#0f172a", fontWeight: 800 }}>
            Continue
          </button>
          {error && <div style={{ color: "#fca5a5", fontWeight: 600 }}>{error}</div>}
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
            Viewer can browse only. Admin can add and edit.
          </div>
        </div>
      </div>
    </div>
  );
}
