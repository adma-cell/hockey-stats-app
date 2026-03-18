"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGate } from "../components/AdminGate";
import { api } from "../utils/client";
import type { Goalie } from "@prisma/client";
import { useAuth } from "../auth-context";

type GoalieWithTotals = Goalie & {
  totals: {
    gamesPlayed: number;
    shotsAgainst: number;
    saves: number;
    goalsAllowed: number;
    shutouts: number;
    minutesPlayed: number;
    savePct: number;
  };
};

export default function GoaliesPage() {
  const [goalies, setGoalies] = useState<GoalieWithTotals[]>([]);
  const [sortKey, setSortKey] = useState<keyof GoalieWithTotals["totals"] | "name">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  const { adminKey } = useAuth();

  const load = async () => {
    setLoading(true);
    const data = await api<GoalieWithTotals[]>("/api/stats/goalies");
    setGoalies(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...goalies].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return ((a.totals as any)[sortKey] - (b.totals as any)[sortKey]) * dir;
    });
  }, [goalies, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="grid" style={{ gap: "1.25rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Goalie Stats</h1>
        {loading ? (
          <p>Loading </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th><button onClick={() => toggleSort("name")}>Goalie</button></th>
                  <th>#</th>
                  <th><button onClick={() => toggleSort("gamesPlayed")}>GP</button></th>
                  <th><button onClick={() => toggleSort("shotsAgainst")}>SA</button></th>
                  <th><button onClick={() => toggleSort("saves")}>SV</button></th>
                  <th><button onClick={() => toggleSort("goalsAllowed")}>GA</button></th>
                  <th><button onClick={() => toggleSort("savePct")}>SV%</button></th>
                  <th><button onClick={() => toggleSort("shutouts")}>SO</button></th>
                  <th><button onClick={() => toggleSort("minutesPlayed")}>MIN</button></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((g) => (
                  <tr key={g.id}>
                    <td>{g.name}</td>
                    <td>{g.jerseyNumber ?? " "}</td>
                    <td>{g.totals.gamesPlayed}</td>
                    <td>{g.totals.shotsAgainst}</td>
                    <td>{g.totals.saves}</td>
                    <td>{g.totals.goalsAllowed}</td>
                    <td>{(g.totals.savePct * 100).toFixed(1)}%</td>
                    <td>{g.totals.shutouts}</td>
                    <td>{g.totals.minutesPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminGate>
        {(key) => <GoalieEditor adminKey={key} onSaved={load} />}
      </AdminGate>
    </div>
  );
}

function GoalieEditor({ adminKey, onSaved }: { adminKey: string | null; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", jerseyNumber: "" });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!adminKey) return setStatus("Admin required.");
    await api("/api/goalies", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null
      })
    }, adminKey);
    setStatus("Saved ?");
    setForm({ name: "", jerseyNumber: "" });
    onSaved();
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Add a goalie</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Jersey #"
          value={form.jerseyNumber}
          onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={submit}
          style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "none", background: "var(--accent)", color: "white", fontWeight: 700 }}
        >
          Save goalie
        </button>
        {status && <span style={{ color: "var(--muted)" }}>{status}</span>}
      </div>
    </div>
  );
}
