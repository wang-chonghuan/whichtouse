# WhichToUse

Find the best AI tool for your task — limits first.

Live at **[whichtouse.com](https://whichtouse.com)**. 25 tasks; each shows three
routes side by side — SaaS, an open-source repo you run, and an agent skill you
drop into a coding agent — because those are three different decisions, not
three flavours of one.

Each route carries two standings: **Leading** (established picks, top of today's
aggregate) and **Emerging** (newer challengers, surfaced by two or more
sources). Five entries by default, ten at most.

## The one rule everything else follows

**Numbers decide the order. They never supply the reason.**

Stars, upvotes and trending position order a list; they do not explain why a
tool is good, and they must never be dressed up as if they did. Where the app
has no authored reasoning for an entry, it renders a grey placeholder saying so
rather than a convincing blank, and never borrows a metric to fill the hole.
The whole product is the difference between "ranked by aggregation" and "we
actually opened this" — a UI that blurs the two destroys the only thing it
sells.

The per-entry review state is tracked in the database (`reviewed_at`) and
governs what the refresh job may overwrite, but it is **not surfaced in the
UI**. An earlier build labelled every row *Reviewed* / *Not yet reviewed*; that
was removed deliberately. Do not reintroduce it without asking.

`.agents/skills/wt-enrich` is the written form of this rule, and is worth
reading before touching any copy the app generates.

## Layout

| path | what it is |
|---|---|
| `app/` | the site — TanStack Start + Astryx + StyleX, Postgres-backed |
| `app/src/theme/neutralTheme.ts` | **the whole look**, as tokens. See "Theming" below |
| `app/src/components/` | the five view components; every page is one of them |
| `specs/content-in-db.md` | why content lives in Postgres and how the refresh job works |
| `ssot-schemas/db-schemas/whichtouse.sql` | the schema, single source of truth |
| `.prodfarm/charter/runbook.md` | deploy, database and job operations |

## Running it

```bash
cd app && npm ci && npm run dev
```

http://localhost:5200. Needs `EASYAPP_DATABASE_URL` in `app/.env` (gitignored;
the repo-root `.env` holds the source API tokens, not the database).

```bash
cd app && npm run build && npm test
```

## Theming

The entire visual system is [`app/src/theme/neutralTheme.ts`](app/src/theme/neutralTheme.ts) —
scaffolded from Astryx's `neutral` theme and owned by this repo. Colour, type
scale, radius and motion are all token definitions in that one file, so a
rebrand is an edit there and nothing else. To start over from a different
Astryx theme:

```bash
cd app && npx @astryxdesign/cli theme add <slug> src/theme
```

then point the `<Theme theme={…}>` in `app/src/routes/__root.tsx` at it.
`npx @astryxdesign/cli theme list` shows what ships.

Two rules keep that promise real, and both have already been violated once:

- **No colour, spacing or radius literals outside the theme file.** Component
  code uses semantic tokens (`colorVars['--color-border']`), never hex. A value
  written into `app.css` or a component is invisible from the theme and will
  survive a theme swap looking wrong.
- **Where an Astryx component owns a property, set it with the component's own
  prop, not `xstyle`.** Astryx's pre-compiled CSS carries a `:not(#\#)`
  specificity boost; a consumer rule for the same property loses silently. Our
  StyleX is namespaced `classNamePrefix: 'wt'` (see `vite.config.ts`) so the two
  builds can no longer produce the same atomic class name — without that, our
  `display` and Astryx's were literally the same class.

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

**The design system decides, not a mockup.** The frontend was rebuilt on Astryx
components against the `neutral` theme; there is no longer a static reference to
diff against. Compose from `npx @astryxdesign/cli component <Name>` before
reaching for a `<div>`, and read `npx @astryxdesign/cli docs layout` before
inventing a page frame — dense rankings are rows, not cards.

**Verify by measuring the DOM, not by eyeballing screenshots.** Screenshots have
been actively misleading in this repo. A style that fails to apply looks like a
design choice; `getComputedStyle` says which it is. The specificity collision
described under Theming was invisible in a screenshot and obvious in one
`getComputedStyle(el).display`.

**One styling system.** Astryx + StyleX, no exceptions. Tailwind was tried and
removed: both systems define `--color-accent`, Astryx sets it with `!important`,
and it silently overrode ported markup.

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
