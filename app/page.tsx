"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGate } from "./components/AdminGate";
import { api } from "./utils/client";
import type { Player } from "@prisma/client";
import { useAuth } from "./auth-context";

type PlayerWithTotals = Player & {
  totals: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    penaltyMinutes: number;
  };
};

export default function SkatersPage() {
  const [players, setPlayers] = useState<PlayerWithTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof PlayerWithTotals["totals"] | "name">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedEdit, setSelectedEdit] = useState<{ id: number; name: string; jerseyNumber: number | string; position: string | null } | null>(null);

  const { adminKey, role } = useAuth();

  const load = async () => {
    setLoading(true);
    const data = await api<PlayerWithTotals[]>("/api/stats/players");
    setPlayers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...players].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return ((a.totals as any)[sortKey] - (b.totals as any)[sortKey]) * dir;
    });
  }, [players, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleDeleteRow = async (id: number) => {
    if (!adminKey) return;
    await api(`/api/players/${id}`, { method: "DELETE" }, adminKey);
    if (selectedEdit?.id === id) setSelectedEdit(null);
    load();
  };

  return (
    <div className="grid" style={{ gap: "1.25rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Skater Stats</h1>
        <p style={{ color: "var(--muted)" }}>
          Totals auto-calc from game entries. Tap a header to sort.
        </p>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th><button onClick={() => toggleSort("name")}>Player</button></th>
                  <th>#</th>
                  <th><button onClick={() => toggleSort("gamesPlayed")}>GP</button></th>
                  <th><button onClick={() => toggleSort("goals")}>G</button></th>
                  <th><button onClick={() => toggleSort("assists")}>A</button></th>
                  <th><button onClick={() => toggleSort("points")}>PTS</button></th>
                  <th><button onClick={() => toggleSort("plusMinus")}>+/-</button></th>
                  <th><button onClick={() => toggleSort("penaltyMinutes")}>PIM</button></th>
                  {role === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.jerseyNumber ?? " "}</td>
                    <td>{p.totals.gamesPlayed}</td>
                    <td>{p.totals.goals}</td>
                    <td>{p.totals.assists}</td>
                    <td style={{ fontWeight: 700 }}>{p.totals.points}</td>
                    <td>{p.totals.plusMinus}</td>
                    <td>{p.totals.penaltyMinutes}</td>
                    {role === "admin" && (
                      <td style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSelectedEdit({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber ?? "", position: p.position ?? "" })}
                          style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1px solid var(--border)", background: "white" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRow(p.id)}
                          style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff1f2", color: "#b91c1c" }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminGate>
        {(key) => (
          <PlayerEditor
            adminKey={key}
            onSaved={load}
            selection={selectedEdit}
            setSelection={setSelectedEdit}
          />
        )}
      </AdminGate>
    </div>
  );
}

function PlayerEditor({
  adminKey,
  onSaved,
  selection,
  setSelection
}: {
  adminKey: string | null;
  onSaved: () => void;
  selection: { id: number; name: string; jerseyNumber: number | string; position: string | null } | null;
  setSelection: (val: { id: number; name: string; jerseyNumber: number | string; position: string | null } | null) => void;
}) {
  const [form, setForm] = useState({ name: "", jerseyNumber: "", position: "" });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!adminKey) return setStatus("Admin required.");
    await api("/api/players", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
        position: form.position || null
      })
    }, adminKey);
    setStatus("Saved");
    setForm({ name: "", jerseyNumber: "", position: "" });
    onSaved();
  };

  const saveEdit = async () => {
    if (!adminKey || !selection) return setStatus("Admin required.");
    await api(`/api/players/${selection.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: selection.name,
        jerseyNumber: selection.jerseyNumber === "" ? null : Number(selection.jerseyNumber),
        position: selection.position || null
      })
    }, adminKey);
    setStatus("Updated");
    setSelection(null);
    onSaved();
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Add a player</h3>
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
        <input
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={submit}
          style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "none", background: "var(--accent)", color: "white", fontWeight: 700 }}
        >
          Save player
        </button>
        {status && <span style={{ color: "var(--muted)" }}>{status}</span>}
      </div>

      <h3 style={{ marginTop: "1.25rem" }}>Edit player</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        <input
          placeholder="Name"
          value={selection?.name ?? ""}
          onChange={(e) => setSelection(selection ? { ...selection, name: e.target.value } : null)}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Jersey #"
          value={selection?.jerseyNumber ?? ""}
          onChange={(e) => setSelection(selection ? { ...selection, jerseyNumber: e.target.value } : null)}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Position"
          value={selection?.position ?? ""}
          onChange={(e) => setSelection(selection ? { ...selection, position: e.target.value } : null)}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={saveEdit}
          disabled={!selection}
          style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "none", background: selection ? "var(--accent)" : "#e5e7eb", color: "white", fontWeight: 700 }}
        >
          Update
        </button>
        <button
          onClick={async () => {
            if (!selection || !adminKey) return setStatus("Admin required.");
            await api(`/api/players/${selection.id}`, { method: "DELETE" }, adminKey);
            setSelection(null);
            setStatus("Deleted");
            onSaved();
          }}
          disabled={!selection}
          style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "1px solid #fca5a5", background: "#fff1f2", color: "#b91c1c", fontWeight: 700 }}
        >
          Delete selected
        </button>
      </div>
    </div>
  );
}
