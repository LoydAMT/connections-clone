# Connections Clone

A simplified clone of the NYT Connections word-grouping game. No accounts —
just type your name when you save a puzzle or finish playing one.

- **Create a Game**: pick 4 categories of 4 words each, enter your name, get a shareable link.
- **Play Games**: browse puzzles others made, solve them (4 mistakes allowed), then save your name/time/score to that puzzle's leaderboard.

## Project layout

- `client/` — React app (Vite), builds to `client/dist`
- `api/` — Vercel serverless functions (what actually runs in production)
- `server/` — Express server that wraps the same logic, for local development only
- `lib/` — shared game logic + storage, used by both `api/` and `server/`

Storage: `lib/db.js` uses Redis (via Vercel's marketplace Redis/Upstash
integration) when `UPSTASH_REDIS_REST_URL`/`TOKEN` (or the legacy
`KV_REST_API_URL`/`TOKEN`) env vars are present, and falls back to a local
`server/db.json` file otherwise. This means the exact same code path runs
locally and in production — only the storage backend differs.

## Local development

From the project root:

```bash
npm install              # installs root deps (nanoid, @upstash/redis)
npm install --prefix server
npm install --prefix client

npm run dev:server        # backend on http://localhost:4000
npm run dev:client        # frontend on http://localhost:5173 (or next free port), in another terminal
```

The Vite dev server proxies `/api` to the Express backend, so both must be
running. No Redis env vars are set locally, so data is stored in
`server/db.json`.

## Deploying to Vercel

Vercel doesn't run a persistent server — `api/` is deployed as on-demand
serverless functions instead, which is why the JSON-file storage had to move
to a real database. Steps:

1. **Push this project to a git repo** (GitHub/GitLab/Bitbucket) — Vercel
   deploys from git. If you don't have one yet:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   then create a repo on GitHub and push to it.

2. **Import the repo in Vercel** — [vercel.com/new](https://vercel.com/new),
   select the repo. Leave the framework preset as "Other" and the root
   directory as `.` (the build/output settings are already defined in
   `vercel.json`).

3. **Add a Redis store** — in the Vercel project, go to the **Storage** tab →
   **Marketplace Database Integrations** → add a **Redis** integration
   (Upstash). Connect it to this project; Vercel will automatically add the
   `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_*`)
   environment variables — no manual copying needed.

4. **Deploy.** Vercel will run the build in `vercel.json`
   (`cd client && npm install && npm run build`), install root dependencies
   for the `api/` functions automatically, and serve everything from one
   domain — static site + `/api/*` functions.

Once deployed, the site is "always live": there's no process to keep
running or restart. Each `/api/*` request just spins up a serverless
function on demand, and puzzle/score data persists in Redis across
deploys and restarts.

### Redeploying / local CLI alternative

You can also skip git and deploy directly from your machine with the
[Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install -g vercel
vercel        # first run: log in, link/create the project
vercel --prod # deploy to production
```

Either way, remember to add the Redis integration (step 3 above) before
your first deploy, or the app will silently try to write to a local file
that doesn't persist between serverless invocations.
