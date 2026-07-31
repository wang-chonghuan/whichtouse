# WhichToUse

Pick an AI tool by the job you need done, not by the tool's name.

Live at **[whichtouse.com](https://whichtouse.com)**. 25 tasks; each shows three
forms side by side — a hosted product, an open-source repo you run, and an agent
skill you drop into a coding agent — because those are three different
decisions, not three flavours of one.

Each form carries two standings: **Leading** (reviewed by hand, top of today's
aggregate) and **Emerging** (surfaced by two or more sources, not yet reviewed).
Five entries by default, ten at most.

## The one rule everything else follows

**Numbers decide the order. They never supply the reason.**

Stars, upvotes and trending position order a list; they do not explain why a
tool is good, and they must never be dressed up as if they did. An entry no
human has opened is labelled *Not yet reviewed*, and content the app cannot
supply yet renders in grey as a visible placeholder rather than a convincing
blank. The whole product is the difference between "ranked by aggregation" and
"we actually opened this" — a UI that blurs the two destroys the only thing it
sells.

`.agents/skills/wt-enrich` is the written form of this rule, and is worth
reading before touching any copy the app generates.

## Layout

| path | what it is |
|---|---|
| `app/` | the site — TanStack Start + StyleX + Astryx, Postgres-backed |
| `demo/` | **frozen** design reference (static HTML). The app is built to match it |
| `DESIGN.md` | the measured values behind `demo/` — radii, type scale, spacing, colour |
| `specs/content-in-db.md` | why content lives in Postgres and how the refresh job works |
| `ssot-schemas/db-schemas/whichtouse.sql` | the schema, single source of truth |
| `.prodfarm/charter/runbook.md` | deploy, database and job operations |

## Running it

```bash
cd app && npm ci && npm run dev
```

http://localhost:5200. Needs `EASYAPP_DATABASE_URL` in the repo-root `.env`
(gitignored). Serve the design reference alongside it to compare:

```bash
cd demo && python3 -m http.server 5300 --bind 127.0.0.1
```

```bash
cd app && npm run build && npm test
```

## How content gets there

Two paths, and they must not be confused:

1. **Human corpus** — `app/src/content/c/*.json`, the seed of record, loaded by
   `app/scripts/import-content.mjs`. Every review, price and source citation
   comes from here.
2. **Daily refresh** — `app/jobs/refresh.mjs`, deployed as an Azure Container
   Apps Job at `0 3 * * *` UTC. It fetches the allowlisted sources
   (`app/src/content/sources.json`), fuses their rankings with weighted
   Reciprocal Rank Fusion, and rewrites `standing`, `rank` and `evidence`.

The job **never** touches editorial prose or `reviewed_at`, never moves
`watchlist` rows, and can never drop a reviewed listing out of a standing — if
every source fails, hand-curated entries keep their place.

## Development notes

**Match `demo/`, and settle disagreements with `DESIGN.md`.** `demo/` is frozen:
editing it while building against it means "does the app match?" stops having an
answer. Verify by measuring the DOM against DESIGN.md's numbers rather than
eyeballing screenshots — screenshots have been actively misleading in this repo.

**One styling system.** StyleX + Astryx. Tailwind was tried and removed: both
systems define `--color-accent`, Astryx sets it with `!important`, and it
silently overrode ported markup. Tokens ported from the demo are namespaced
`--wt-*` so that cannot recur.

**Verify a source with a must-hit sample, never with a summary line.** Every
source bug in this project's history was silent, not loud:

- Product Hunt returned zero rows for all 25 categories while reporting no error
  — the topic slug passed was `"ai"`, which is not a slug.
- GitHub search matched readmes, so `sindresorhus/awesome` outranked every real
  coding agent.
- Twelve listings shared `github.com` as a homepage, so domain matching
  collapsed them onto one row and summed ~22 reciprocal ranks into it.
- `mattpocock/skills` (194k stars) was invisible because it carries no topics.

`sourceErrors: 0` proved nothing in any of those cases. Pick something that must
appear, then check that it does.

**Don't replace one narrow method with another.** The recurring mistake here has
been swapping a bad search for a different bad search instead of taking the
union. Skill discovery needs both the global sweep and the per-category topic
query; either alone loses half the results.

**Reviewed content is never overwritten by a job.** If a change would let
automation edit prose, rewrite a price, or unrank a hand-reviewed entry, it is
wrong regardless of how good the automation is.

## Deploying

```bash
python3 ~/.claude/skills/n-easyapp/scripts/redeploy_current_repo.py --project whichtouse
```

Build from the repo root, never from `app/`, and always pass a revision suffix
or Container Apps silently keeps the old image. Both traps are in the runbook.
