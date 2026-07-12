# Bootstrap commands (cap1 → feeds cap2 runbook.md)

Base: `tanstack-start` (reused from stemrobin architecture + design system).
Repo-root-relative; secrets shown as placeholders.

| Purpose | Command |
|---|---|
| Install | `cd app && npm ci` |
| Dev | `cd app && npm run dev` |
| Build | `cd app && npm run build` (generates `src/routeTree.gen.ts` + `.output/`) |
| Start (prod) | `cd app && PORT=3000 node .output/server/index.mjs` |
| Unit test | `cd app && npm test` (vitest, separate `vitest.config.ts`) |
| E2E | `cd app && npm run e2e` (playwright) |

## Database
- Shared Azure easy-app Postgres, per-project schema **`whichtouse-schema`**.
- Connection via `EASYAPP_DATABASE_URL` (local `.env`) or `DATABASE_URL` (deployed Container App injects it). See `app/src/lib/db.ts`.
- Schema SSOT: `ssot-schemas/db-schemas/whichtouse.sql` (no tables yet — MVP hello-world uses no DB).

## Deploy
- Via **n-easyapp cap1** (create + first-deploy Container App on the tanstack-start base). Root `Dockerfile` builds `app/` (build context = repo root, hard-coded by n-easyapp).
- **Status: PENDING** — local build + run verified (renders at `http://127.0.0.1:3000/`); Azure first-deploy not yet run.

## Local verification (done)
- `npm ci` → OK; `npm run build` → OK; server renders WhichToUse hello page in browser. Full SSR chain confirmed locally.
