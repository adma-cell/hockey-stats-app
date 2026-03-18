"use client";

import { useEffect, useState } from "react";
import { AdminGate } from "../components/AdminGate";
import { api } from "../utils/client";
import type { Game, PlayerGameStat, GoalieGameStat, Player, Goalie } from "@prisma/client";
import { useAuth } from "../auth-context";

type GameWithStats = Game & {
  playerStats: (PlayerGameStat & { player: Player })[];
  goalieStats: (GoalieGameStat & { goalie: Goalie })[];
};

export default function GamesPage() {
  const [games, setGames] = useState<GameWithStats[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalies, setGoalies] = useState<Goalie[]>([]);
  const [loading, setLoading] = useState(true);

  const { adminKey } = useAuth();

  const load = async () => {
    setLoading(true);
    const [g, p, go] = await Promise.all([
      api<GameWithStats[]>("/api/games"),
      api<Player[]>("/api/players"),
      api<Goalie[]>("/api/goalies")
    ]);
    setGames(g);
    setPlayers(p);
    setGoalies(go);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Game Log</h1>
        {loading ? (
          <p>Loading </p>
        ) : (
          <div className="grid" style={{ gap: "0.75rem" }}>
            {games.map((game) => (
              <div key={game.id} className="card" style={{ border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{game.opponent}</div>
                    <div style={{ color: "var(--muted)" }}>{new Date(game.date).toLocaleDateString()}</div>
                    {game.location && <div style={{ color: "var(--muted)" }}>{game.location}</div>}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{game.finalScore ?? "TBD"}</div>
                </div>
                <div className="table-scroll" style={{ marginTop: "0.5rem" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>G</th>
                        <th>A</th>
                        <th>PTS</th>
                        <th>+/-</th>
                        <th>PIM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {game.playerStats.map((s) => (
                        <tr key={s.id}>
                          <td>{s.player.name}</td>
                          <td>{s.goals}</td>
                          <td>{s.assists}</td>
                          <td>{s.goals + s.assists}</td>
                          <td>{s.plusMinus}</td>
                          <td>{s.penaltyMinutes}</td>
                        </tr>
                      ))}
                      {game.playerStats.length === 0 && (
                        <tr><td colSpan={6} style={{ color: "var(--muted)" }}>No player stats yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="table-scroll" style={{ marginTop: "0.75rem" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Goalie</th>
                        <th>SA</th>
                        <th>SV</th>
                        <th>GA</th>
                        <th>SV%</th>
                        <th>SO</th>
                        <th>MIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {game.goalieStats.map((s) => {
                        const pct = s.shotsAgainst === 0 ? 0 : s.saves / s.shotsAgainst;
                        return (
                          <tr key={s.id}>
                            <td>{s.goalie.name}</td>
                            <td>{s.shotsAgainst}</td>
                            <td>{s.saves}</td>
                            <td>{s.goalsAllowed}</td>
                            <td>{(pct * 100).toFixed(1)}%</td>
                            <td>{s.shutout ? "Yes" : ""}</td>
                            <td>{s.minutesPlayed}</td>
                          </tr>
                        );
                      })}
                      {game.goalieStats.length === 0 && (
                        <tr><td colSpan={7} style={{ color: "var(--muted)" }}>No goalie stats yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {games.length === 0 && <p style={{ color: "var(--muted)" }}>No games logged yet.</p>}
          </div>
        )}
      </div>

      <AdminGate>
        {(key) => (
          <div className="grid" style={{ gap: "1rem" }}>
            <GameForm adminKey={key} onSaved={load} />
            <StatForm adminKey={key} onSaved={load} games={games} players={players} goalies={goalies} />
          </div>
        )}
      </AdminGate>
    </div>
  );
}

function GameForm({ adminKey, onSaved }: { adminKey: string | null; onSaved: () => void }) {
  const [form, setForm] = useState({ opponent: "", date: "", finalScore: "", location: "" });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!adminKey) return setStatus("Admin required.");
    await api("/api/games", {
      method: "POST",
      body: JSON.stringify({
        opponent: form.opponent,
        date: form.date,
        finalScore: form.finalScore || null,
        location: form.location || null
      })
    }, adminKey);
    setStatus("Game saved");
    setForm({ opponent: "", date: "", finalScore: "", location: "" });
    onSaved();
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Add game</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        <input placeholder="Opponent" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <input placeholder="Final score (e.g. 4-2 W)" value={form.finalScore} onChange={(e) => setForm({ ...form, finalScore: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border)" }} />
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <button onClick={submit} style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "none", background: "var(--accent)", color: "white", fontWeight: 700 }}>Save game</button>
        {status && <span style={{ color: "var(--muted)" }}>{status}</span>}
      </div>
    </div>
  );
}

function StatForm({ adminKey, onSaved, games, players, goalies }: { adminKey: string | null; onSaved: () => void; games: GameWithStats[]; players: Player[]; goalies: Goalie[]; }) {
  const [mode, setMode] = useState<"player" | "goalie">("player");
  const [gameId, setGameId] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [goalieId, setGoalieId] = useState<string>("");
  const [playerForm, setPlayerForm] = useState({ goals: "0", assists: "0", plusMinus: "0", penaltyMinutes: "0" });
  const [goalieForm, setGoalieForm] = useState({ shotsAgainst: "0", saves: "0", goalsAllowed: "0", shutout: false, minutesPlayed: "0" });
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!adminKey) return setStatus("Admin required.");
    if (!gameId) return setStatus("Pick a game");

    if (mode === "player") {
      if (!playerId) return setStatus("Pick a skater");
      await api("/api/player-stats", {
        method: "POST",
        body: JSON.stringify({
          gameId: Number(gameId),
          playerId: Number(playerId),
          goals: Number(playerForm.goals),
          assists: Number(playerForm.assists),
          plusMinus: Number(playerForm.plusMinus),
          penaltyMinutes: Number(playerForm.penaltyMinutes)
        })
      }, adminKey);
      setStatus("Saved skater line");
    } else {
      if (!goalieId) return setStatus("Pick a goalie");
      await api("/api/goalie-stats", {
        method: "POST",
        body: JSON.stringify({
          gameId: Number(gameId),
          goalieId: Number(goalieId),
          shotsAgainst: Number(goalieForm.shotsAgainst),
          saves: Number(goalieForm.saves),
          goalsAllowed: Number(goalieForm.goalsAllowed),
          shutout: goalieForm.shutout,
          minutesPlayed: Number(goalieForm.minutesPlayed)
        })
      }, adminKey);
      setStatus("Saved goalie line");
    }
    onSaved();
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Add game stats</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <button onClick={() => setMode("player")} style={{ padding: "0.45rem 0.8rem", borderRadius: 8, border: mode === "player" ? "2px solid var(--accent)" : "1px solid var(--border)", background: "white" }}>Skater line</button>
        <button onClick={() => setMode("goalie")} style={{ padding: "0.45rem 0.8rem", borderRadius: 8, border: mode === "goalie" ? "2px solid var(--accent)" : "1px solid var(--border)", background: "white" }}>Goalie line</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
        <select value={gameId} onChange={(e) => setGameId(e.target.value)} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }}>
          <option value="">Select game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {new Date(g.date).toLocaleDateString()} vs {g.opponent}
            </option>
          ))}
        </select>
        {mode === "player" ? (
          <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }}>
            <option value="">Skater</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.jerseyNumber ?? ""} {p.name}
              </option>
            ))}
          </select>
        ) : (
          <select value={goalieId} onChange={(e) => setGoalieId(e.target.value)} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }}>
            <option value="">Goalie</option>
            {goalies.map((g) => (
              <option key={g.id} value={g.id}>
                #{g.jerseyNumber ?? ""} {g.name}
              </option>
            ))}
          </select>
        )}
        {mode === "player" ? (
          <>
            <input type="number" placeholder="Goals" value={playerForm.goals} onChange={(e) => setPlayerForm({ ...playerForm, goals: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <input type="number" placeholder="Assists" value={playerForm.assists} onChange={(e) => setPlayerForm({ ...playerForm, assists: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <input type="number" placeholder="Plus/minus" value={playerForm.plusMinus} onChange={(e) => setPlayerForm({ ...playerForm, plusMinus: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <input type="number" placeholder="PIM" value={playerForm.penaltyMinutes} onChange={(e) => setPlayerForm({ ...playerForm, penaltyMinutes: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
          </>
        ) : (
          <>
            <input type="number" placeholder="Shots against" value={goalieForm.shotsAgainst} onChange={(e) => setGoalieForm({ ...goalieForm, shotsAgainst: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <input type="number" placeholder="Saves" value={goalieForm.saves} onChange={(e) => setGoalieForm({ ...goalieForm, saves: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <input type="number" placeholder="Goals allowed" value={goalieForm.goalsAllowed} onChange={(e) => setGoalieForm({ ...goalieForm, goalsAllowed: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <input type="number" placeholder="Minutes played" value={goalieForm.minutesPlayed} onChange={(e) => setGoalieForm({ ...goalieForm, minutesPlayed: e.target.value })} style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid var(--border)" }} />
            <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <input type="checkbox" checked={goalieForm.shutout} onChange={(e) => setGoalieForm({ ...goalieForm, shutout: e.target.checked })} /> Shutout
            </label>
          </>
        )}
      </div>
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button onClick={submit} style={{ padding: "0.55rem 0.9rem", borderRadius: 10, border: "none", background: "var(--accent)", color: "white", fontWeight: 700 }}>Save stats</button>
        {status && <span style={{ color: "var(--muted)" }}>{status}</span>}
      </div>
    </div>
  );
}
