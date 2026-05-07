# Wavefront

**Wavefront** is a Spotify-inspired, full-stack music streaming web app: persistent player, library, playlists with drag-and-drop, search, likes, queue, and server-backed history.

## Architecture

```
┌─────────────┐     HTTPS / JSON      ┌──────────────┐      SQL       ┌──────────┐
│  Vite React │ ◄──────────────────► │ Express API  │ ◄────────────► │ Postgres │
│  (Vercel)   │      /api/*           │ (Render/Fly) │               │ (Supabase)│
└─────────────┘                       └──────┬───────┘               └──────────┘
                                            │
                                            ▼
                                     /audio/*.mp3 (static + Range)
```

## Tech stack

| Layer    | Choice                                      |
|----------|---------------------------------------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4  |
| Motion   | Framer Motion                               |
| DnD      | @dnd-kit                                    |
| Backend  | Node 22, Express, TypeScript                |
| ORM      | Prisma 6                                    |
| DB       | PostgreSQL (Docker locally, Supabase in prod) |
| Audio    | Bundled CC-friendly demo MP3s (SoundHelix samples), served with CORS + `Accept-Ranges` |

## Local setup

1. **PostgreSQL** (choose one):
   - **Docker:** from repo root: `docker compose up -d`
   - **Supabase:** create a project and copy `DATABASE_URL`.

2. **Backend**

   ```bash
   cd backend
   cp .env.example .env
   # edit DATABASE_URL if needed (default targets localhost:5433)
   npm install
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```

   API listens on **http://localhost:4000**. Health: `GET /api/health`.

3. **Frontend**

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Open **http://localhost:5173**. Vite proxies `/api` and `/audio` to the API.

### Demo credentials

The app auto-logs in as **Demo User** (`demo@wavefront.audio`) via `POST /api/auth/demo` on first load. A JWT is stored in `localStorage` for the demo session.

### Database schema (summary)

- `User`, `Artist`, `Album`, `Track`
- `Playlist`, `PlaylistTrack` (ordered positions)
- `Like` (composite `userId` + `trackId`)
- `Listen` (recently played / history)

See `backend/prisma/schema.prisma` for the source of truth.

### Docker (database only)

```bash
docker compose up -d
```

Uses Postgres 16 on host port **5433** to avoid clashing with a local 5432.

### API container (optional)

```bash
cd backend
docker build -t wavefront-api .
# Run with DATABASE_URL pointing at reachable Postgres; sync schema + seed on startup in your orchestrator.
```

`Dockerfile` (backend) builds the API and expects `DATABASE_URL` at runtime.

## Seeded content

After `npx prisma db seed` you get **32 tracks**, **14 albums**, **8 artists**, demo playlists **Chill Vibes**, **Focus Flow**, **Late Night**, plus likes and listening history. Audio files are `backend/public/audio/sample-1.mp3` … `sample-16.mp3` (SoundHelix example tracks — suitable for demos).

**Artists (examples):** Nox Horizon, Mara Bloom, The Velvet Circuit, Kai Rivers, Solstice Trio, Echo District, Luna Fallows, Carter West.

## Deployment

### Frontend (Vercel)

**Production (current):** [https://wavefront-showcase.vercel.app](https://wavefront-showcase.vercel.app) — Vercel project **`wavefront-showcase`**, API base **`VITE_API_URL=https://wavefront-api.onrender.com`**. The Living Résumé portfolio links this URL under **Projects → Wavefront · Streaming UI** (optional override there via `VITE_WAVEFRONT_URL`).

**CLI (from `frontend/`):**

```bash
cd frontend
vercel login   # once per machine, if needed
vercel link --yes --project wavefront-showcase   # never use `--project slackord` — that Vercel project is **Riff / Showcase-Chat**, not Wavefront
vercel env add VITE_API_URL production --value "https://wavefront-api.onrender.com" --yes --no-sensitive
npx vercel --prod --yes
```

**Git-connected project:** import this repo in the Vercel dashboard → **Root Directory** `frontend` → Framework **Vite**. Add **`VITE_API_URL`** under Project → Settings → Environment Variables for **Production** (same URL as above, no trailing slash). Preview builds need the variable too once Git is connected (you can scope it to branch `main` or “All Preview branches”).

### Backend (Render / Fly / Railway)

- Start command: `npx prisma migrate deploy && node dist/index.js` (or `db push` for early demos—prefer migrate in prod).
- Set `DATABASE_URL`, `JWT_SECRET`, `PORT`.
- Expose HTTP port; ensure uploaded/static audio is reachable at `/audio/...` with CORS `*` for demo.

### Database (Supabase)

Create a project → **Settings → Database** → copy connection string → `DATABASE_URL` for backend.

---

## Embed snippet

```html
<iframe
  src="https://wavefront-showcase.vercel.app"
  width="100%"
  height="720"
  style="border:0;border-radius:16px"
  title="Wavefront"
  allow="autoplay; clipboard-write"
  loading="lazy"
></iframe>
```

Parent page should **not** send `X-Frame-Options: DENY`. The API sends `Content-Security-Policy: frame-ancestors *` (see `backend/src/index.ts`); the Vercel config adds `frame-ancestors *` for the SPA.

## Multi-width preview (`iframe-test.html`)

Open `iframe-test.html` (e.g. `npx serve .` from the repo root) and point each embed `src` at your dev or prod URL.

## Royalty / licensing

Demo MP3s are the **SoundHelix** example tracks downloaded from https://www.soundhelix.com — intended as illustrative audio for development and portfolio demos.

## Screenshot

After `npm run dev`, capture the home screen with the sidebar, hero greeting, and bottom player—replace this section with your image in the fork.
