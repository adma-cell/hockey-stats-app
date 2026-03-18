# BenchBoss – Team Stats + RSVPs

Modern Next.js 14 + Prisma + SQLite stack that tracks skater/goalie season totals, game logs, schedule, and RSVPs. Public is read-only; editing is gated by a simple code.

## Quick start
1) Install deps
```bash
npm install
```
2) Copy env and set the admin code (default `18`, required after passing the gate as admin)
```bash
cp .env.example .env
# ADMIN_PASSWORD should stay 18 unless you change the gate/admin check
```
3) Generate Prisma client and create the SQLite DB
```bash
npx prisma generate
npx prisma db push
```
4) Run dev server
```bash
npm run dev
```
Open http://localhost:3000

## Access model
- On every page load you must choose Viewer (code 2026) or Admin (code 18). The choice is not remembered across refreshes.
- Admin code is sent via `x-admin-key` on writes; Viewer never sends it.

## Data model
- players, goalies
- games with playerGameStats + goalieGameStats (unique per game/player)
- scheduleEvents with RSVPs

Season totals are derived on the fly from per-game rows; points = goals + assists, SV% = saves / shotsAgainst.

## Deployment notes
- Works on Vercel/Netlify. SQLite file (`prisma/dev.db`) is small—use Vercel Postgres/Turso/Neon for multi-region persistence if desired; update `DATABASE_URL` accordingly and rerun `prisma db push`.

## API surface (App Router)
- `/api/players` CRUD, `/api/goalies` CRUD
- `/api/games` CRUD + nested stats
- `/api/player-stats`, `/api/goalie-stats` upsert per game
- `/api/stats/players`, `/api/stats/goalies` season aggregates
- `/api/schedule` CRUD, `/api/rsvps` public post

## UX shortcuts
- Gate appears each reload to pick role.
- Tables are mobile-friendly with horizontal scroll and sortable columns.
- Game stats form supports skater or goalie lines tied to a selected game.
