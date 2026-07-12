---
name: wt-ingest
description: WhichToUse Phase 1 data ingest. Discover agent-product candidates per business-use-case category (directory-as-seed for app/SaaS, GitHub keyword search for repo/skill), investigate their signals (stars + last-30d growth; upvotes), dedup across form-factor tracks, and write them to Postgres. Use when populating or refreshing the WhichToUse item table for a category.
---

# wt-ingest

Populates `items` in `whichtouse-schema` for the WhichToUse ranking site. Config-driven by
`resources/content/wt-sources.json` (categories, seed sources, GitHub keywords, signals).

## What it does (two-stage, per category)

1. **Discover candidates** — directory-as-seed (never a DB dump):
   - `app/SaaS` track: `aiagentsdirectory` public API, filtered to the category, top by upvotes.
   - `repo` + `skill` tracks: GitHub keyword search (`github_keywords`), split by an MCP/skill heuristic.
2. **Investigate signals** — `overall_signal` (GitHub stars / aiagentsdirectory upvotes) and
   `growth_signal` (last-30d stars via stargazer timestamps / recent-upvoted proxy).
3. **Dedup + write** — one form factor per tool (DB `unique(category_id, dedup_key)` enforces
   no cross-track overlap); every row `badge='provisional'`.

Ranking (overall top-10 / growth top-5 / Best 3) is **not** done here — that is D4.

## Boundary (agent vs code)

- **Deterministic (these scripts)**: API calls, star/growth math, dedup, DB upsert.
- **Host agent (semantic)**: judging category fit / form factor when the heuristic is unsure, and
  widening `github_keywords` / `seed_sources` in `wt-sources.json` when a track comes back thin.

## Run

```bash
cd <repo-root>/.agents/skills/wt-ingest && npm ci
# EASYAPP_DATABASE_URL / DATABASE_URL must be set (whichtouse-schema conn).
node scripts/ingest.mjs            # all categories
node scripts/ingest.mjs lead-gen   # one category
```

Auth: GitHub via the local `gh` CLI (`gh auth token`); aiagentsdirectory is public. No keys baked in.

## Constraints

- Multi-source aggregation + own signals; **never mirror a single competitor's DB** (compliance,
  see `.prodfarm/charter/architecture.md`).
- One-shot / manual (Phase 1). No cron; Phase 2 adds scheduling + more sources + Smithery/PH/last30days.
