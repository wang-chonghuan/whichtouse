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

## Deploy (n-easyapp cap1 — DONE)
- Container App **`ca-whichtouse`** in `rg-easyapp-shared` / env `cae-easyapp-shared`, region northeurope.
- Live URL: **https://ca-whichtouse.kindsmoke-4d84c417.northeurope.azurecontainerapps.io/** (verified rendering in a real browser).
- Image `acreasyapp.azurecr.io/whichtouse:latest` (ACR admin pull, identity=None — mirrors stemrobin). Port 3000, ingress external, min/max replicas 1.
- Tags: `easyapp.repo`/`easyapp.branch=main`/`easyapp.commit=ade006d…`.
- Env: `PORT=3000`, `EASYAPP_DEPLOY_COMMIT`.
- **Redeploy** path: `az acr build --registry acreasyapp --image whichtouse:latest --file Dockerfile .` then `az containerapp update -g rg-easyapp-shared -n ca-whichtouse --image acreasyapp.azurecr.io/whichtouse:latest` (or n-easyapp cap2).

## GAP — Postgres role/schema not yet provisioned
- Derived: schema `whichtouse-schema`, role `whichtouse-user`, db `easyapp` on `pg-easyapp-shared`.
- **Not created** (MVP hello-world uses no DB; the create step needs the shared PG admin credential, deferred). When Phase 1 adds DB-backed features: create role+schema as admin, then add `DATABASE_URL`/`DATABASE_SCHEMA` env via `az containerapp update`. → Gap Register entry in cap2.

## Local verification (done)
- `npm ci` → OK; `npm run build` → OK; server renders WhichToUse hello page. Full SSR chain confirmed locally and on the deployed URL.
