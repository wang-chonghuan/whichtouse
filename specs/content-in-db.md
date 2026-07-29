# Content in Postgres + scheduled refresh — design

Status: proposal, not implemented. Nothing has been run against Azure or the database.
Date: 2026-07-26. Revised after review: no history retention, minimal table count.

## 1. Why

The 25 files under `app/src/content/c/*.json` are pulled into the bundle at build time by
`import.meta.glob(..., { eager: true })` in [catalog.ts](../app/src/lib/catalog.ts). Content cannot
change without a rebuild and redeploy. Every file's `updated` says `2026-07-23`; the last commit
touching them is `77ce9c6` (2026-07-24). The site tells visitors rankings are re-checked weekly and
nothing enforces that — there is no scheduled job of any kind for this project.

## 2. What already exists

- **Database provisioned.** Shared `pg-easyapp-shared`, db `easyapp`, schema `whichtouse-schema`,
  role `whichtouse-user`. `ca-whichtouse` already has `DATABASE_URL` / `DATABASE_SCHEMA` injected.
- **Client already written.** [app/src/lib/db.ts](../app/src/lib/db.ts) is complete and correct.
  **It has no callers.** Dead code today.
- **Old schema applied** — [ssot-schemas/db-schemas/whichtouse.sql](../ssot-schemas/db-schemas/whichtouse.sql),
  tables `categories` / `items` / `rankings`.

### 2.1 The old schema is being dropped

Approved: drop the three tables and their data. They were designed for a signal-driven aggregator
(`overall_signal`, `growth_signal`, `dimension in ('overall','growth')`) while what got authored is
an editorial review corpus (`bestFor`, `rankBasis`, `pricingFree/Paid`, `features/pros/cons/sources`).
Neither matches the v2 direction in `proto/` (three tracks `saas`/`oss`/`skill`, two standings
`leading`/`emerging`, one-line `edge` and `con`).

## 3. Retention decision

**Decision: no history. Every scheduled run overwrites in place. Nothing is append-only.**

This removes three of the seven tables from the earlier draft — the signal time series, the ranking
snapshots, and the job audit log — and is why the schema below is two tables.

The earlier draft treated this as a compromise that cost us the `leading` standing's
"held the top for 12+ months" claim. That framing is now moot: **ranking is an algorithm that
aggregates other sites' published rankings and re-derives the order on every run.** Order is a
function of today's inputs, not of our own recorded past, so there is nothing to retain. The
"12+ months" claim is dropped outright, and the "N dropped, M added" diff banner with it — neither
is a thing this product is trying to say.

One thing this changes for the better: aggregating *published rankings* works on all three tracks.
Star counts and download numbers only exist for `oss` and `skill`, which is why the metric-driven
version of this design left `saas` unbacked. Round-ups and comparison articles rank hosted products
perfectly well, so the SaaS asymmetry that runs through the rest of the product does not apply here.

Job-failure visibility does not need a table either: Azure retains job execution history
(`az containerapp job execution list`), and per-row `refreshed_at` tells you data freshness. Between
the two you can still distinguish "stale" from "broken", which was the only reason `job_runs`
existed.

### 3.1 Who owns what

The algorithm decision moves the boundary between machine-owned and human-owned columns, so it is
worth stating plainly:

| Machine-owned — rewritten every run | Human-owned — never touched by a job |
|---|---|
| **row creation** (see §3.2a) | `watchlist` placement (a deliberate pull) |
| `standing` (`leading` / `emerging`) | `summary`, `edge`, `con`, `best_for` |
| `rank` | `features`, `pros`, `cons`, `sources`, `confidence` |
| `evidence`, `refreshed_at` | all `pricing_*`, `reviewed_at` |

The earlier draft said the job must never reorder `leading`. That no longer holds — under an
aggregation algorithm, reordering `leading` *is* the job. Editorial prose remains untouched.

**(a) Discovery is automatic.** A tool that appears on a source's ranking and is not yet in the
corpus gets a row created by the job and can land directly in a public standing. Nothing gates it.

That has a consequence the card format makes unavoidable: a machine-created listing has a name, a
rank and `evidence`, and **nothing in the three lines the card is built from** — no `summary`, no
`edge`, no `con`. It cannot be rendered as if it had been looked at.

The resolution is one column, `reviewed_at`, null until a human has actually opened the tool. The
card renders the row either way, marked. This is worth doing well rather than hiding: the visible
difference between *"ranked here by aggregation"* and *"we sat down with this one"* is the site's
whole pitch, and a design that surfaces it is stronger than one that quietly blurs the two. It also
gives the editorial queue a natural ordering — `where reviewed_at is null order by rank`.

### 3.2 The risk this introduces

Aggregating other sites' rankings means the inputs are largely SEO listicles, many of them
affiliate-driven and several of which plagiarise each other. Averaging correlated garbage produces
garbage with false precision — and it will look authoritative, because it is a number. Two things
keep that honest, both cheap:

- A **source allowlist with weights**, versioned in the repo as a plain JSON file (config, not a
  table). Adding a source is a reviewed commit, not a silent change.
- Store, per listing, **which sources ranked it and at what position** — that is what `evidence`
  below is for. It makes the detail page's "why it ranks here" a rendering of real inputs rather
  than prose someone wrote once, and it makes a bad aggregate debuggable instead of mysterious.

### 3.3 Phase-1 source allowlist

Chosen from a search of what is actually available and machine-readable in July 2026, not from a
list of what is popular. Four sources, all free APIs, no scraping beyond the GitHub trending page
this repo already parses in [github-trending.ts](../app/src/lib/github-trending.ts).

| Source | Access | Ordered by | Tracks it covers |
|---|---|---|---|
| GitHub | REST API + `/trending` (already implemented here) | stars, stars gained | `oss`, `skill` |
| Product Hunt | official GraphQL API, free non-expiring developer token, has topics | votes | `saas`, some `oss` |
| Hacker News (Algolia) | free, no auth, date + points search | points, recency | all three |
| npm registry downloads | free, no auth, last-year range endpoint | downloads | `oss`, `skill` |

**What was rejected, and why it matters more than what was kept.** The obvious candidates are the AI
tool directories — Toolify, There's An AI For That, Futurepedia. Two findings ruled them out for
phase 1:

- **They are not independent sources.** Toolify's category ordering is driven primarily by SimilarWeb
  monthly visits, and the other large directories rank on the same underlying traffic signal.
  Aggregating three of them is aggregating one signal three times while *looking* like corroboration
  — the exact failure mode §3.2 is about, dressed up as diversity.
- **They are pay-to-rank and bot-blocked.** Toolify publishes paid tiers for landing in the top
  rankings; TAAFT returns HTTP 403 to a plain fetch. A source whose order can be bought is not
  evidence, and one that has to be scraped around is not maintainable.

### 3.3a What running the sources changed

Both surviving fetchers were wrong on first contact, in ways that only showed up
against live data. Recorded here because both failures are the kind that produce
plausible-looking output rather than an error.

- **GitHub was searching readmes.** `in:name,description,readme` matched every curated
  mega-list against every query — `sindresorhus/awesome` ranked *first* for "ai coding
  agent assistant", ahead of every actual coding agent, and would have been auto-created
  as a listing. Restricting to `in:name,description`, excluding `topic:awesome`, and
  filtering `awesome-*` / "curated list" repos took that query from 259,348 results to
  2,579 relevant ones.
- **Hacker News cannot rank hosted products.** A bare domain on HN means someone posted a
  link, not that the thing is a product. Ranking domains by points put `arstechnica.com`
  top for "ai coding agent". No threshold fixed it: requiring repeat stories keeps the
  news sites, which publish constantly, and drops the products, whose launch is a single
  thread. HN is therefore **corroboration only** — a domain scores only when it already
  matches a listing we hold, and discovery from HN is limited to GitHub links, where the
  URL itself proves what the thing is.

The second finding narrows §3.4 further: with HN unable to introduce hosted products,
**Product Hunt is the only SaaS discovery source in phase 1**, and it is the one that
needs a token.

### 3.4 The asymmetry comes back, for a different reason

§3 claimed aggregating published rankings fixes the SaaS gap. That is true in principle and false in
practice for phase 1: **the sources that are actually accessible are developer-skewed.** GitHub and
npm do not cover hosted products at all; Product Hunt over-weights new launches; HN over-weights
developer-facing tools. The directories that genuinely rank mainstream SaaS are precisely the ones
rejected above.

So, for phase 1:

- `oss` and `skill` — both standings computed from sources. Works well.
- `saas` — `emerging` computed from Product Hunt + HN, which is what those sources are actually good
  at. **`leading` stays human-ordered.** The job leaves it alone.

That is a smaller claim than "the algorithm ranks everything", and it is the true one. Widening SaaS
coverage is a phase-2 question about finding one non-traffic-derived, non-purchasable source
(Reddit consensus via the API and Google Trends are the two candidates worth testing).

### 3.5 The aggregation rule

**Reciprocal Rank Fusion**, weighted per source:

```
score(listing) = Σ  weight_s / (60 + rank_s)     over each source s that ranked it
```

RRF is the standard way to fuse ranked lists — it is the default hybrid-ranking method in
Elasticsearch, OpenSearch, Azure AI Search and Weaviate — and `k = 60` is the long-standing empirical
default. The property that matters here: **it operates on rank positions, not on raw scores**, so
one source reporting 70,000 stars and another reporting 400 upvotes need no normalisation and cannot
drown each other out. It is also one line of code, which is the point of phase 1.

`leading` = top N by score. `emerging` = top N by growth (stars gained, PH recency) among listings
not in `leading`. Both capped at 10 per §"five by default, ten at most".

## 4. Schema — two tables

Natural keys throughout; no surrogate ids, no join table. `slug` is what the routes already use.

```sql
create table categories (
  slug        text primary key,
  name        text not null,
  money_tier  text not null default 'green'
              check (money_tier in ('green','yellow','red')),
  sort        int  not null default 0,
  note        text,                      -- per-category prose (current `notes`)
  refreshed_at timestamptz,
  updated_at  timestamptz not null default now()
);

create table listings (
  category_slug text not null references categories(slug) on delete cascade,
  tool_slug     text not null,           -- 'chatgpt', 'steven-tey--novel'

  -- identity
  name           text not null,
  owner          text,                   -- null for SaaS
  track          text not null check (track in ('saas','oss','skill')),
  homepage       text,
  repo_full_name text,                   -- drives GitHub polling
  package_name   text,                   -- drives npm / PyPI polling

  -- placement — machine-owned for leading/emerging, human-set for watchlist
  standing text not null check (standing in ('leading','emerging','watchlist')),
  rank     int,                          -- null for watchlist

  -- editorial, human-owned. All null on a machine-discovered row (§3.1a).
  reviewed_at timestamptz,               -- null = ranked by aggregation, not yet looked at
  summary     text,                      -- neutral one-liner (proto `desc`)
  edge        text,                      -- the one comparative advantage
  con         text,                      -- the single biggest disqualifier
  best_for    text,
  features    jsonb not null default '[]',
  pros        jsonb not null default '[]',
  cons        jsonb not null default '[]',
  sources     jsonb not null default '[]',   -- [{name, url}]
  confidence  text check (confidence in ('high','medium','low')),

  -- pricing, timestamped separately because it rots fastest
  pricing_model      text,
  pricing_free       text,
  pricing_paid       text,
  pricing_checked_at timestamptz,

  -- machine-owned, overwritten every run
  -- { score, sources: [{site, rank, url}], metrics: {stars, downloads_year, ...} }
  evidence     jsonb not null default '{}',
  refreshed_at timestamptz,

  updated_at timestamptz not null default now(),

  primary key (category_slug, tool_slug),
  constraint uq_rank unique (category_slug, standing, rank) deferrable initially deferred
);

create index on listings (category_slug, standing, rank);
```

Four choices worth stating, because each one is a table someone might expect and won't find:

- **No `tools` table.** A tool in three categories is three rows, duplicating `homepage` and
  `repo_full_name`. That costs a few hundred bytes and three GitHub calls instead of one — against
  5000 authenticated calls/hour and 374 total listings, irrelevant. It buys removing a table and a
  join. It is also semantically right: `edge`, `con` and `rank_basis` are *category-relative* claims,
  not properties of the tool.
- **`evidence` is jsonb, not columns.** It holds heterogeneous input — a list of which sources ranked
  this listing and where, plus whatever track-specific metrics exist (OSS has stars and downloads,
  SaaS has none). Typed columns would be mostly null and would imply a rigour the inputs do not have.
  The job computes the order in memory over 374 rows, so nothing needs to sort on this in SQL.
  Because it is overwritten every run, it is exactly one day old — which is what it is for.
- **No `rank_basis` column.** Under an aggregation algorithm the basis is not prose someone wrote
  once; it is `evidence.sources`. The detail page's "why it ranks here" renders that.
- **`uq_rank` is `deferrable initially deferred`** so the job can rewrite a whole standing inside one
  transaction without tripping over intermediate states. Without deferral, reordering means
  delete-then-insert. `rank` is null for watchlist rows and Postgres treats nulls as distinct, so
  those rows are unconstrained.
- **`pricing_checked_at` is separate from `updated_at`.** Wrong pricing is the error visitors punish
  hardest and the field most likely to be stale while everything else is fine. The detail page should
  render this date, not a generic "last updated".

## 5. Scheduled job

Deployed with `n-easyapp` **cap6**, which reuses the project's existing image
`acreasyapp.azurecr.io/whichtouse:latest` and only overrides the startup command — so the job
entrypoint is an ordinary file in this repo, shipped by the normal build. Cap6 injects
`DATABASE_URL` and `DATABASE_SCHEMA` automatically and evaluates cron in **UTC**.

### `refresh` — daily 03:00 UTC

`caj-whichtouse-refresh` → `node .output/server/jobs/refresh.mjs`

1. Read the source allowlist (§3.3) and fetch each source's current ranking per category.
2. Match returned entries to existing listings; **create rows for ones we do not have** (§3.1a),
   with `reviewed_at` null.
3. Fuse with weighted RRF (§3.5); write `evidence` and `refreshed_at` in place.
4. Recompute standings per category and write `standing` + `rank` in one transaction (`uq_rank` is
   deferred, so intermediate states inside the transaction are fine).
   **Skip `saas` + `leading`** — human-ordered in phase 1 (§3.4).
5. Leave `watchlist` rows alone — that placement is a human decision.

Deterministic, no LLM. **It never touches editorial prose or `reviewed_at`.** It does reorder
`leading` on the tracks it covers; under an aggregation algorithm that is the job.

Matching in step 2 is the part most likely to be wrong: the same tool appears as `ChatGPT`,
`chatgpt.com` and `openai/chatgpt` across sources. Phase 1 should match on normalised homepage
domain and `repo_full_name` only, and drop anything ambiguous rather than guess — a duplicate row
in a standing is far more visible than a missing one.

### Editorial re-check — deferred

A second job that re-verifies pricing and prose needs a model, and a model writing review copy
unattended is how a site whose entire pitch is "we actually checked" quietly stops being true; the
output always looks plausible, so the failure is invisible. That job therefore has to write
*proposals* a human accepts, which needs both a proposals table and a review surface. **Neither is in
this design** — adding a table with no writer now would be dead weight. Revisit when the review
surface is a decision someone wants to make.

Until then the site's "weekly re-checked" copy is not backed by anything. Soften it or accept the gap.

## 6. Application changes

- `catalog.ts` stops using `import.meta.glob`, becomes async DB reads behind server functions. Route
  loaders are already `async`, so call sites change shape but not structure.
- Short in-process cache (5 min), mirroring [github-trending.ts](../app/src/lib/github-trending.ts).
- `db.ts` unchanged — it finally gets used.

**Tradeoff to accept:** today the content is in the bundle, so a database outage cannot take the site
down. Afterwards it can. Recommend caching last-good results in memory and serving stale on error;
if traffic ever justifies it, have the build bake a JSON snapshot into the image as a cold-start
fallback.

## 7. Migration

1. Confirm the old `categories` / `items` / `rankings` are droppable, drop them, apply the new
   `whichtouse.sql`.
2. `app/scripts/import-content.mjs` reads the 25 JSON files → seeds `categories` + `listings`. Run
   once, locally, against prod.
3. Keep `app/src/content/c/*.json` in git as the seed of record.

### 7.1 What the import cannot fill

The current content has **no `edge` and no `con` one-liners** — those are v2 concepts from `proto/`.
The importer can seed them from `pros[0]` / `cons[0]`, but those were written as list items, not as
the single sharpest comparative claim, and they will read that way. Likewise `track`: current content
only knows `app` and `skill`, so every `skill` entry that is really a repo has to move to `oss` — a
heuristic on `repo_full_name` gets most of it, not all.

Roughly 374 listings across 25 categories. This is editorial labour and nothing in this plan removes
it.

## 8. Sequencing

| Step | Output | Blocked by |
|---|---|---|
| 1 | Rewrite `whichtouse.sql`; drop old tables; apply | — |
| 2 | `import-content.mjs`; seed prod; verify counts | 1 |
| 3 | `catalog.ts` reads DB; cache; deploy; verify page-for-page identical | 2 |
| 4 | Source allowlist JSON; aggregation rule; `jobs/refresh.mjs`; cap6 deploy; watch three runs | 3 |
| 5 | Human pass over `edge` / `con` / `track` | 2 |

## 9. Copy that this design makes false

Both live in [proto/shared.js](../proto/shared.js) and were written against the old model:

- `LISTS[0].note` — *"held the top for 12+ months"*. Dropped as a claim. The `leading` standing now
  means *ranked highest across the sources we aggregate today*, and the note should say that.
- The announcement banner — *"Content Writing re-checked — 3 entries dropped, 2 added"*. No diff is
  computed, so this cannot be generated. Replace with something the design can back, e.g. the
  `refreshed_at` date.

Separately, the site's "weekly re-checked" line refers to the editorial pass (§5), which is deferred.
The daily `refresh` job re-derives *order*, not reviews — those are different promises and the copy
should not blur them.

## 10. Open questions

- Per-source weights in the allowlist. RRF works with all weights at 1.0; that is the sane starting
  point and it should stay there until a run shows a source is systematically wrong.
- How a machine-discovered, unreviewed listing renders on the card (§3.1a). It needs a visible
  marker; what it says is a copy decision.
- Phase-2 SaaS coverage (§3.4): Reddit consensus via the API, or Google Trends. Both need testing
  before either is trusted.
