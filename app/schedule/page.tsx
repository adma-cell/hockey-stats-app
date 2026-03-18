"use client";

import { useEffect, useState } from "react";
import { AdminGate } from "../components/AdminGate";
import { api } from "../utils/client";
import type { ScheduleEvent, RSVP } from "@prisma/client";
import { useAuth } from "../auth-context";

type EventWithRsvps = ScheduleEvent & { rsvps: RSVP[] };

type RSVPCounts = {
  attending: number;
  notAttending: number;
  maybe: number;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [loading, setLoading] = useState(true);

  const { adminKey } = useAuth();

  const load = async () => {
    setLoading(true);
    const data = await api<EventWithRsvps[]>("/api/schedule");
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Schedule & RSVPs</h1>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid" style={{ gap: "0.75rem" }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} onChange={load} />
            ))}
            {events.length === 0 && <p style={{ color: "var(--muted)" }}>No events yet.</p>}
          </div>
        )}
      </div>

      <AdminGate>
        {(key) => <EventForm adminKey={key} onSaved={load} />}
      </AdminGate>
    </div>
  );
}

function EventCard({ event, onChange }: { event: EventWithRsvps; onChange: () => void }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"ATTENDING" | "NOT_ATTENDING" | "MAYBE">("ATTENDING");
  const [message, setMessage] = useState<string | null>(null);

  const counts: RSVPCounts = event.rsvps.reduce(
    (acc, r) => {
      if (r.status === "ATTENDING") acc.attending += 1;
      if (r.status === "NOT_ATTENDING") acc.notAttending += 1;
      if (r.status === "MAYBE") acc.maybe += 1;
      return acc;
    },
    { attending: 0, notAttending: 0, maybe: 0 }
  );

  const submit = async () => {
    await api("/api/rsvps", {
      method: "POST",
      body: JSON.stringify({ eventId: event.id, name, status })
    });
    setMessage("RSVP saved");
    setName("");
    onChange();
  };

  return (
    <div className="card" style={{ border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{event.opponent}</div>
          <div style={{ color: "var(--muted)" }}>
            {new Date(event.date).toLocaleDateString()} — {event.time} @ {event.location}
          </div>
        </div>
        <span className="badge">{event.isPractice ? "Practice" : "Game"}</span>
      </div>
      <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
        <span className="badge">? {counts.attending} attending</span>
        <span className="badge">? {counts.maybe} maybe</span>
        <span className="badge">?? {counts.notAttending} out</span>
      </div>
      <div style={{ marginTop: "0.8rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
        <input
          placeholder="Player / parent name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }}>
          <option value="ATTENDING">Attending</option>
          <option value="NOT_ATTENDING">Not attending</option>
          <option value="MAYBE">Maybe</option>
        </select>
        <button onClick={submit} style={{ padding: "0.6rem", borderRadius: 10, border: "none", background: "var(--accent)", color: "white", fontWeight: 700 }}>Send RSVP</button>
      </div>
      {message && <div style={{ color: "var(--muted)", marginTop: "0.4rem" }}>{message}</div>}
    </div>
  );
}

function EventForm({ adminKey, onSaved }: { adminKey: string | null; onSaved: () => void }) {
  const [form, setForm] = useState({ opponent: "", date: "", time: "", location: "", isPractice: false });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!adminKey) return setStatus("Admin required.");
    await api("/api/schedule", {
      method: "POST",
      body: JSON.stringify({
        opponent: form.opponent,
        date: form.date,
        time: form.time,
        location: form.location,
        isPractice: form.isPractice
      })
    }, adminKey);
    setStatus("Event saved");
    setForm({ opponent: "", date: "", time: "", location: "", isPractice: false });
    onSaved();
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Add to schedule</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        <input placeholder="Opponent / event name" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <input placeholder="Rink / field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <input type="checkbox" checked={form.isPractice} onChange={(e) => setForm({ ...form, isPractice: e.target.checked })} /> Practice
        </label>
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={submit} style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "none", background: "var(--accent)", color: "white", fontWeight: 700 }}>Save event</button>
        {status && <span style={{ color: "var(--muted)" }}>{status}</span>}
      </div>
    </div>
  );
}
