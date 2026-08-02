# IntentMill Draft

## Source

- ticket key: `WHICHTOUSE-21-category-classification`
- ticket id: `WHICHTOUSE-21`
- `.intentmill/tickets/WHICHTOUSE-21-category-classification/meta.json` read (branch and `worktree_path` confirmed; cwd is that worktree).
- `.intentmill/tickets/WHICHTOUSE-21-category-classification/intent.md` read as the raw original user input. Not rewritten, translated or normalised anywhere in this draft.
- `AGENTS.md` read (router: charter is binding, ticket-first, verify by running).
- `.prodfarm/charter/` read: `goal.md`, `redlines.md`, `engineering-rules.md`, `architecture.md`, `runbook.md`. The ticket inlines all five verbatim; the files exist on disk and were cross-checked (`engineering-rules.md` "无谓依赖铁律" present in both).
- `.evodocs/modules/module-index.json` read; `.evodocs/modules/mod--web-app--catalog.md`, `.evodocs/modules/mod--web-app--github-trending.md` read; `.evodocs/modules/mod--ingest-pipeline.md` read (inlined in the ticket, already flagged there as outdated). Substantive evodocs exist and were used as a map; where they disagree with code, code is treated as authoritative — see `## Code And Evodocs Findings`.
- code areas inspected:
  - `app/jobs/refresh.mjs` (read in full)
  - `app/src/content/sources.json` (read in full)
  - `app/src/lib/catalog-db.ts`, `app/src/lib/catalog-types.ts` (rank filter, track/standing ordering, `signals`)
  - `ssot-schemas/db-schemas/whichtouse.sql`
  - `specs/content-in-db.md` (§3.1, §3.1a, §3.3, §3.3a, §3.4, §3.5, §5)
  - `app/scripts/describe-emerging.mjs` (the pass that wrote the 100 misfiled labels), `app/scripts/build-jobs.mjs`, `app/scripts/gen-crawl-surface.mjs`
  - `app/src/lib/github-trending-enrichment.ts` (`CATEGORY_RULES` / `classifyTrendingRepository` — the repo's other keyword classifier), `app/src/lib/github-trending-parser.ts`, `app/src/lib/github-trending.ts` (its fetch helpers' failure behaviour)
  - `app/src/components/category-page.tsx`, `app/src/components/home-page.tsx`, `app/src/components/app-frame.tsx`, `app/src/lib/catalog.ts` (`getHomeFeatured`), `app/src/routes/_app/c.$slug.tsx`, `app/src/routes/_app/c_.$slug.$item.tsx`
  - `app/src/content/categories.json` (25 slugs, names, blurbs, practitioners, domain hints)
  - `app/package.json`, `app/vitest.config.ts` (dependency set and test reach)
  - `git log` on `app/jobs/refresh.mjs`, `app/src/content/sources.json` and the three `enrich` commits that produced the labelled baseline
- external docs: fetched with the repo-configured Context7 CLI (`ctx7`).
  - `/websites/github_en_rest` — `GET /search/repositories` contract, `GET /rate_limit` buckets (`core` 5000/h, `search` 30/min authenticated).
  - `/openapi/raw_githubusercontent_github_rest-api-description_...` — repository/topics endpoints.
  - `/websites/api-v2-docs_producthunt_s3-website-us-east-1_amazonaws` and `/websites/api_producthunt_v2` — `Post` object fields, `posts(topic:)` semantics, complexity quota 6250 points / 15 min.
  - One read-only, unauthenticated cross-check call to `https://api.github.com/search/repositories?q=topic:agent-skills` to confirm that search results really do carry `topics` (they do). No credential was used and nothing was written.
- `nf-db`: **not available** — no `nf-db` skill is installed in this environment and none is vendored in the repo. No database operation, live inspection, read or write was performed in cap3, and this draft does **not** settle an alternative route: reading production through the runbook's `.pgpass`/`psql` path is an option that needs a human decision (who runs it, under what approval), not a route this draft may choose on its own. Every DB fact in this draft comes from `ssot-schemas/db-schemas/whichtouse.sql`, `specs/content-in-db.md`, the job/script code, and the counts frozen in the ticket. The row counts (287 emerging, 100 labelled misfiled) are therefore **unverified in cap3** — see `## Assumptions` and R13.
- frontend `DESIGN.md`: **none exists**. `find` over the repo returns no `DESIGN.md`; `.prodfarm/charter/architecture.md` records that the old `demo/` static reference and its `DESIGN.md` were deleted when Tailwind was removed, and that the binding style authority is now `app/src/theme/neutralTheme.ts` plus `@astryxdesign/core` components (semantic tokens only; component props over `xstyle`). Any UI touched by this ticket is bound by that authority instead.

## Draft Spec

Draft material. Every uncertain point below is labelled as an assumption or a risk; nothing here is a settled requirement yet.

### Intent (preserved from the ticket)

The daily discovery job has no independent category-assignment step: a candidate's category is implied by *which per-category search found it*, so the query string is acting as the classifier — and several categories' queries are a single common English word. The delivered capability is: **every candidate is judged once against all 25 categories before it is written, and a candidate whose assignment is not sufficiently supported is discarded rather than defaulted into the category that happened to find it.** The partially-bypassed "a new row needs two independent sources" rule is tightened at the same time, in a form that survives the fact that every skill-track source is GitHub.

### Scope (confirmed by the ticket contract)

- **S1 — an explicit assignment stage.** Candidates from every row-creating source pass through one category judgement covering all 25 categories, before placement. The row-creating sources are `github-stars`, `github-new`, `github-skills` (global sweep + per-category topic search), `producthunt`, and `hn` (GitHub links only). `npm` cannot create rows — it only re-ranks listings that already carry `package_name`.
- **S2 — no default category.** When the judgement is not confident enough, the candidate is dropped. It is never written to the category whose query returned it, and never to any other fallback.
- **S3 — the corroboration bypass is tightened.** `sources.json` `selfPlacing: true` on `github-skills` and `producthunt` currently skips `minCorroborationForNew: 2` entirely. That bypass must be narrowed, under the hard constraint that an absolute two-origin rule would empty the whole skill track (all skill sources are GitHub) and, per `specs/content-in-db.md` §3.3a/§3.4, `saas`/`emerging` as well (Product Hunt is the only SaaS discovery source and Hacker News cannot introduce hosted products).
- **S4 — substring matching must not survive.** The named failures are `resume` matching "resumable" and `sql` matching "SQLite"; both come from `classifySkill`'s `hay.includes(w)` in `app/jobs/refresh.mjs`.
- **S5 — the change is measurable against the existing baseline.** Re-judging the 287 existing emerging rows must be possible, and its result comparable against the 100 rows already labelled misfiled.

Inferred, not contract-confirmed (see A8): the ticket names the query collisions as the *diagnosis*, not as a required edit. S1 neutralises them by construction, so whether `skillQueries`/`phTopics` themselves are also rewritten is an open direction rather than settled scope. The collisions are: `skillQueries` maps several categories onto one common word (`support`, `data`, `browser`, `pdf`, `image`, `email`, `social`, `design`, `research`, `legal`, `coding`, `workflow`); `phTopics` maps 6 categories onto `productivity` and 5 onto `artificial-intelligence`.

### Non-scope (from the ticket's constraints)

- `leading` rows' category membership and ordering — human corpus, human decision.
- The 100 misfiled labels in production (`standing = 'emerging' and rank is not null and best_for = ''`): not deleted, not overwritten, not regenerated.
- The 10-per-bucket cap (`topN`).
- `watchlist` placement, editorial prose, `reviewed_at`, `pricing_*` — machine-untouchable per `specs/content-in-db.md` §3.1.
- Any dependency, external service or paid API change (`engineering-rules.md` 无谓依赖铁律).
- Anything under `.prodfarm/charter/`.
- Achieving acceptance by blanket tightening that empties or nearly empties any category's emerging list.

### Contracts that constrain the solution

- **Placement contract (`app/jobs/refresh.mjs`, per-category transaction).** Each run sets `rank = null` for every row in the category except `watchlist` and `saas`+`leading`, then writes the new placements. Rows are never deleted. A candidate that fails classification therefore *loses its rank* and keeps its row, its `best_for` and its history.
- **Render contract (`app/src/lib/catalog-db.ts`).** `rows.filter(r => r.standing !== 'watchlist' && r.rank !== null)` — a row with `rank = null` disappears from the site the moment the job commits, and `Category.ready` is `ranked.length > 0`.
- **Evidence contract.** `evidence = { score, sources: [{site, rank, url}], metrics }` is machine-owned and rewritten every run; `catalog-db.ts` renders `evidence.sources` as `signals` ("GitHub (stars) #5") for rows with no `rank_basis`.
- **Label contract (`app/scripts/describe-emerging.mjs`).** `best_for = null` means "nobody has looked at this row"; `best_for = ''` means "looked at, deliberately no line — misfiled or unidentifiable". The refresh job never writes `best_for`. This distinction *is* the evaluation baseline and must keep its meaning.
- **SSOT.** `ssot-schemas/db-schemas/whichtouse.sql` is the only source of the data contract; any stored classifier output (e.g. a confidence or the deciding evidence) has to land in an existing column — `evidence` jsonb is the natural home — or the SSOT changes first.

### Behavioural requirements implied by the above (draft)

- Classification runs inside the same unattended daily run (`caj-whichtouse-refresh`, 03:00 UTC); it cannot depend on a human or an interactive agent being present.
- Classification input must come from data the job already has or can obtain from interfaces it already uses, without new dependencies or secrets.
- The reviewed/`leading` path must not be re-categorised by the classifier: `reviewed_at != null` rows are placed by the reviewed-rows branch and their category is human-owned.
- Whatever rule replaces the `selfPlacing` bypass has to be expressible per source in `app/src/content/sources.json`, which is the versioned allowlist ("adding a source is a reviewed commit, never a silent change").

### UI requirement (draft, and one of the reasons grill is required)

The change alters *which rows the site shows*, so the surfaces listed in `## Code And Evodocs Findings` are in play. In particular the Emerging band's tooltip copy in `app/src/components/category-page.tsx` — "Newer challengers, surfaced by two or more sources." — is already untrue for `selfPlacing` sources and becomes more visibly untrue once the corroboration rule changes; the shipped rule and this copy must end up saying the same thing. Whether that is a copy edit, a rule change, or an accepted scope cut is not settled in this draft.

## Draft Plan

Rough direction only. No patch steps, no final structure.

### Where the work lands

- `app/jobs/refresh.mjs` — the per-source dispatch block inside `main()` (where each source's `entries` are built and pushed into `perSource`) and the emerging placement loop (`if (!item.selfPlacing && item.origins.size < minCorroboration) continue`). These are the two seams: one decides *what a candidate is*, the other decides *whether it may be written*.
- `app/src/content/sources.json` — the versioned config that already owns `queries`, `skillQueries`, `skillClassify`, `phTopics`, `selfPlacing`, `minCorroborationForNew`, `topN`. Classification vocabulary and any per-source placement rule belong here rather than in a new config file.
- Likely a small pure module under `app/src/lib/` holding the assignment logic, because that is the only tree the test runner can reach (`app/vitest.config.ts` includes `src/**/*.test.ts`) and `app/scripts/build-jobs.mjs` bundles the job with esbuild, which resolves such an import without any config change. This is a testability consequence, not a product choice.
- `ssot-schemas/db-schemas/whichtouse.sql` only if a stored per-row classification artefact is required; the default direction is to reuse the existing `evidence` jsonb.

### What is reused rather than invented

- `skillClassify` in `app/src/content/sources.json` is already a 25-slug, ordered, specific-first category vocabulary with a documented "first match wins" contract. It is the natural seed for a whole-corpus classifier — its *matching* (`includes`) is the defect, not its existence.
- `CATEGORY_RULES` / `classifyTrendingRepository` in `app/src/lib/github-trending-enrichment.ts` is the repo's other classifier: ordered word-boundary regexes over `name + description + language + topics + readme.slice(0, 4000)`. Its technique (word boundaries, ordered rules, topics as input) is directly applicable; its `?? 'Coding'` default fallback is exactly what the ticket forbids and must not be copied.
- `app/scripts/describe-emerging.mjs` is the repo's established shape for judgement that a runtime cannot make: a deterministic script produces a prompt, an agent answers offline, `apply` validates the shape before writing. If any part of the assignment needs judgement the daily job cannot make, this is the existing pattern to extend rather than a new mechanism.
- The existing throttles (`githubThrottled`, `phThrottled`) and the existing identity helpers (`repoOf`, `domainOf`, `NOT_IDENTITY`) stay as-is.

### Why this is the simplest effective direction currently known

The job is a single deterministic script with no model and no classifier dependency, and none may be added. Everything needed for a first pass — repo name, description, topics, Product Hunt name/tagline — is either already in hand or reachable by editing an existing query. Adding text (README, repo metadata) is possible but costs one `core`-bucket call per candidate and a second failure mode, so it belongs behind evidence that the cheap text is insufficient, not in front of it.

### Sequencing constraints

1. The assignment rule and its vocabulary must exist and be unit-testable before either seam is rewired, because the two named regressions (`resume`/"resumable", `sql`/"SQLite") are the first things that must be pinned.
2. The corroboration change (S3) has to be evaluated *after* the assignment change, since assignment quality is what makes a relaxed origin rule defensible.
3. Re-judging the existing 287 rows (S5) needs the finished rule, and it must run in a form that cannot delete or rewrite the labelled rows.

### Likely test areas

- Pure unit tests under `app/src/lib/` for the assignment rule: the two named substring regressions, the single-common-word collisions (`support`, `data`, `browser`, `pdf`, `image`), the multi-category Product Hunt case (one product that today lands in Meeting Notes + Legal & Contracts + Workflow Automation), and the "not confident → dropped" path.
- An offline re-judgement over the existing rows for AC1/AC2, reading `name`, `owner`, `repo_full_name`, `homepage`, `source_description`.
- `node --env-file=.env .output/jobs/refresh.mjs --dry --category <slug>` as the end-to-end check: `--dry` writes nothing (verified in code), but it reads the production schema and hits the live sources, so it inherits the same access question as R13 rather than sidestepping it.

### What must be left untouched

`leading` placement and the `saas`+`leading` freeze; the `watchlist` branch; the deferred `uq_rank` transaction shape; `app/scripts/describe-emerging.mjs`'s null-vs-empty-string semantics; `app/src/lib/catalog-db.ts` and the UI components except where a decision explicitly requires a copy change; every editorial column; the two job secrets and the deployment path.

## Code And Evodocs Findings

### F1 — there is genuinely no assignment step

In `app/jobs/refresh.mjs`, `main()` iterates categories, computes `const query = config.queries?.[category.slug] ?? category.name`, calls each source with that query, and pushes the results into `perSource` *for that category*. Nothing between the fetch and `place(...)` ever asks what the candidate is. The category is a property of the loop iteration, not of the candidate.

### F2 — the one classifier that exists is substring-based and only covers the skill sweep

```js
const hay = `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase()
for (const [slug, words] of config.skillClassify ?? []) {
  if (words.some((w) => hay.includes(w))) return slug
}
```

Consequences visible in the shipped vocabulary: `resume` (resume-jobs) matches "resumable"; `sql` (data-analysis) matches "SQLite", "PostgreSQL", "NoSQL"; `editor` (content-writing) matches any text/code editor; `image` (image-generation) matches "Docker image"; `code`, `test`, `git`, `review` (coding, the last rule) match almost any developer repo; `document` (pdf-documents) matches "documentation"; `memory` (knowledge-base) and `integration`/`automation` (workflow-automation) match agent infrastructure generally. First-match-wins over an ordered array also means a repo matching two rules is silently assigned the earlier one with no signal that it was ambiguous.

Its reach is narrower than "the skill source is classified": `classifySkill` runs only inside `skillsForCategory`, i.e. over the **global sweep** half of `github-skills`. The other half — `githubSkillSearch`, the per-category `topic:… <word>` search — is unioned in **unclassified** in the same block, and `github-skills` is `selfPlacing`, so `topic:agent-skills support` can write a Customer Support row on its own with neither classification nor corroboration. The remaining row-creating sources (`github-stars`, `github-new`, `producthunt`, `hn`) have no classification at all.

### F3 — `skillQueries` are single common words, ANDed against a topic filter

`sources.json` documents why they are short (GitHub ANDs terms with the topic filter, so a full sentence returns nothing). The result is that `customer-support` asks for `topic:agent-skills support`, `data-analysis` for `data`, `browser-automation` for `browser`, `pdf-documents` for `pdf`, `image-generation` for `image`. Anything in the skills topic whose description contains the word "support" is a Customer Support candidate. This is the mechanism behind the ticket's "Data Analysis and Customer Support are 11/11 wrong".

### F4 — `phTopics` collapses the taxonomy, and Product Hunt is `selfPlacing`

Counted from `app/src/content/sources.json`: `productivity` is shared by 6 categories (presentation, meeting-notes, pdf-documents, resume-jobs, legal-contract, workflow-automation); `artificial-intelligence` by 5 (video-generation, voice-audio, research-search, knowledge-base, translation); `developer-tools` by 3; `design-tools` by 3; `marketing` by 2. `refresh.mjs` also hard-codes `artificial-intelligence` as the fallback for a category with no mapping — latent rather than live, since all 25 slugs currently have an entry, but it means a future 26th category is filed silently under `artificial-intelligence`, already the second most crowded topic in the map. Every post returned for `productivity` is therefore offered to all six of those categories, and because `producthunt` carries `selfPlacing: true` each one can be written with no second origin. That is a complete mechanical explanation of the ticket's symptom "one team email client written into Meeting Notes, Legal & Contracts and Workflow Automation at once".

### F5 — the corroboration guard is bypassed exactly where volume is highest

```js
if (!item.selfPlacing && item.origins.size < minCorroboration) continue
```

`selfPlacing: true` is set on `github-skills` and `producthunt`. Origins are `github` (shared by `github-stars`, `github-new`, `github-skills`), `hn`, `producthunt`, `npm`. So: the skill track is entirely `github`; `saas` discovery is entirely `producthunt` (HN is corroboration-only by design, `specs/content-in-db.md` §3.3a). For `oss` there are three paths: `github` + an HN GitHub link reaches two origins; `github` + `producthunt` also does; and a Product Hunt post whose `website` is a GitHub URL is typed `track: 'oss'` by `repoOf(node.website) ? 'oss' : 'saas'` and, being `selfPlacing`, creates an `oss` row **alone**. Still, enforcing two origins absolutely empties the skill track *and* `saas`/`emerging` — which is why the ticket states the constraint, and the design doc reaches the same conclusion independently.

### F6 — failing classification withdraws a row without destroying it

The per-category transaction nulls `rank` for everything except `watchlist` and `saas`+`leading`, then writes placements; there is no `delete`. `catalog-db.ts` filters `rank !== null`. So a row that no longer classifies into its category stops rendering immediately but keeps `category_slug`, `tool_slug`, `best_for` and `evidence`. The 100 labelled rows survive a re-run by construction — provided nothing new deletes rows or rewrites `best_for`.

### F7 — the baseline's exact semantics

`app/scripts/describe-emerging.mjs` selects `standing = 'emerging' and rank is not null and best_for is null` as "needs a line", and `apply` writes `''` for an honest blank: "An honest blank is still an answer: record it as one so the row is not re-researched on every future run." Commit `5b59016` backfilled 86 already-researched rows to `''`; commit `1f88b17` recorded 82 rows found misfiled across twenty areas, with Customer Support and Data Analysis at 0/11 correct each. The ticket's 100 is the current total. Any cleanup that deletes rows, or any enrichment pass that overwrites `''`, erases the only measurement this ticket has.

### F8 — what text each source can offer a classifier, without new dependencies

| source | text available now | to get more |
|---|---|---|
| `github-stars` / `github-new` | `name`, `description`, `topics`, `homepage`, `language` (search response) | README / full metadata = one `core` call per candidate |
| `github-skills` (sweep + scoped) | same; sweep keeps whole repo objects, scoped mapping drops everything but description | same |
| `producthunt` | `name`, `tagline` (current query) | `description` and the `topics` connection are on `Post` — a query edit, no new dependency |
| `hn` | **nothing** — entries are built with `description: null`; a repo URL and a points total | one GitHub `core` call per candidate |
| `npm` | reuses existing listing rows | n/a |

A second asymmetry matters for anything that wants to re-derive these inputs later: a stored row can be re-fetched only if it has a repo handle. `refresh.mjs` sets `repoFullName: repoOf(node.website)` on Product Hunt entries and types precisely the rows where that is null as `track: 'saas'`; the schema agrees (`repo_full_name` nullable, `owner` commented "null for hosted products"). So `oss`/`skill` rows can be re-hydrated from GitHub, and `saas` rows cannot be re-hydrated at all — the only text they will ever have again is `name` plus the `source_description` captured at discovery, which for a PH row is its tagline.

Note also that `githubSearch` and `githubSkillSearch` currently *discard* `topics` when mapping to entries (only `sweepSkills` keeps the raw repo objects, which is why only it can classify). Whatever classifier is written needs its input carried through the mapping.

### F9 — no model, no classifier dependency, and none may be added

`app/package.json` runtime dependencies are `postgres`, `@astryxdesign/core`, `@stylexjs/stylex`, TanStack, React, `lucide-react`, `vite`. The job imports only `postgres` and `sources.json`. The job's environment holds `GITHUB_TOKEN`, `PRODUCTHUNT_TOKEN`, `DATABASE_URL`/`DATABASE_SCHEMA` — no model endpoint or key. `engineering-rules.md` forbids adding, removing or changing any dependency when the existing stack can do the job, and forbids silent installs outright. The assignment logic is therefore deterministic code plus versioned config, optionally fed by an offline agent pass whose output is committed as data (the `describe-emerging.mjs` pattern), and cannot be a runtime model call.

### F10 — R-UI: every user-visible surface this change touches

The change alters which rows exist on the public site, so these are all in play. Verified in code:

- **The Emerging band vanishes silently.** `Standing` in `app/src/components/category-page.tsx` returns `null` when its item list is empty. A track that loses all its emerging rows shows the Leading list with no indication that a band was removed.
- **A fully empty track shows a generic empty state.** `TrackColumn` renders Astryx `EmptyState` with title "Nothing here yet" and description "Nothing on this route has made the shortlist." — which reads as "the world is thin here", not "we discarded what we found".
- **The Emerging tooltip is a factual claim about the rule this ticket changes**: "Newer challengers, surfaced by two or more sources." It is already false for `selfPlacing` sources and is the copy most directly invalidated by S3.
- **The home page counts categories.** `catalog-db.ts` sets `ready = ranked.length > 0`; `home-page.tsx` renders `${ready.length} areas of work`. A category emptied of ranked rows changes a number on the front page.
- **The site description hard-codes the taxonomy size.** `app/src/theme/brand.json` and `app/public/site.webmanifest` both say "…across 25 areas of work…", while the home page's own figure is `ready.length`. The two disagree the moment a category loses every ranked row — 25 stays true of the taxonomy, but the page beside it says 24.
- **The site-wide category rail greys the category out.** `app/src/components/app-frame.tsx` renders each category as `<ListItem … isDisabled={!category.ready} />`, with the comment "A task with nothing ranked in it yet is still part of the map … but it is not somewhere to send a reader." A category emptied by the new rule becomes an unclickable nav row **on every page of the site** — the most visible possible consequence of over-tightening, and the surface the ticket's "no emptied lists" constraint is really protecting.
- **The home page's four featured leaderboards can change or thin out.** `getHomeFeatured` in `app/src/lib/catalog.ts` takes `snap.categories`, maps each to `tracks.app`, keeps those with `items.length >= 5` and slices the first four. It reads the **app track only**, which is exactly the track Product Hunt alone discovers, so thinning `saas`/`emerging` can change which categories the front page leads with, or leave fewer than four cards.
- **Site search loses entries.** `searchEntries` is built only from ranked rows, so every withdrawn row also leaves the search palette (`app/src/components/search-palette.tsx` consumers).
- **Item detail URLs 404.** `app/src/routes/_app/c_.$slug.$item.tsx` looks the item up in `view.tracks` and throws `notFound()` when it is absent. Withdrawing ~100 misfiled rows turns ~100 previously live `/c/{slug}/{item}` URLs into 404s. The sitemap is unaffected — `app/scripts/gen-crawl-surface.mjs` emits category paths from `categories.json` only, no item URLs.
- **`signals` text changes with the evidence.** Machine rows render `evidence.sources` as "GitHub (stars) #5"; if the corroboration or source-attribution rule changes, that rendered line changes with it.
- **No `DESIGN.md` exists** (confirmed by search); `architecture.md` records it was deleted with the `demo/` reference. Binding UI authority is `app/src/theme/neutralTheme.ts` semantic tokens plus `@astryxdesign/core` components, with the explicit rule that a component's own prop is used instead of `xstyle`. Any empty-state or copy change must use the existing `EmptyState`/`Text`/`Button` components and existing tokens; no new colour, spacing or component.

**Peer/industry practice for this class of change** (what comparable products do when a ranked list is thinned by a confidence rule):

- **Product Hunt's own model is many-topics-per-post** — `Post.topics` is a `TopicConnection` and `posts(topic:)` selects posts having that slug as *one of* their topics (documented, see R-EXT below). PH shows a post under every topic it claims and never picks one for the reader. Our `phTopics` inherits that many-to-many shape but writes it as if it were one-to-one — the fix has to choose per candidate, which PH itself never does.
- **GitHub Topics / GitHub search** state absence explicitly ("no repositories matched") and report a result count rather than silently rendering a shorter list; a query that returns little is shown as returning little, never quietly substituted.
- **Reviewed-goods publishing practice (Wirecutter-style)** marks an unvetted entry rather than hiding it — and this repo already took that position deliberately: `specs/content-in-db.md` §3.1a argues the visible difference between "ranked here by aggregation" and "we sat down with this one" is "the site's whole pitch", which is why `reviewed_at` and `signals` exist. Silently emptying a band is the one behaviour that contradicts the site's own stated posture; naming the absence is consistent with it.
- The compact/honest constraint in `goal.md` cuts the other way against a chatty empty state: whatever is shown must be one line inside the existing card, not a new surface.

### F11 — R-EXT: documented behaviour of the interfaces this ticket leans on harder

No new external interface is introduced — the constraint forbids it. The risk is in *new operations on existing ones*, so the documented behaviour was checked:

- **GitHub `GET /search/repositories`** (Context7 `/websites/github_en_rest`): up to 100 results/page, `q` + `sort` + `order` + `per_page`; the response item carries `full_name`, `description`, `homepage`, `topics`, `stargazers_count`. Cross-checked live: `topic:agent-skills` returns items with a populated `topics` array (`anthropics/skills` → `["agent-skills"]`), so `classifySkill`'s use of `repo.topics` is sound and topics are available to any classifier at zero extra cost. **README text is not in the search response.**
- **Rate-limit buckets** (`GET /rate_limit`): `search` = 30/min authenticated (the job's `GH_MIN_INTERVAL_MS = 2100` is sized to it), `core` = 5000/hour. The operation cross-check that matters: enriching candidates with README or full repo metadata spends the **core** bucket, not the search bucket, so it does not compete with the searches — at ~25 categories × ≤40 candidates ≈ ≤1000 calls it fits inside 5000/hour, but it lengthens a run that already spends ≈104 serialised searches × 2.1 s ≈ 4 minutes in throttling alone, and each call is a new failure point that fails *quietly*: the repo's existing helpers for exactly these two calls, `githubJson` and `githubReadme` in `app/src/lib/github-trending.ts`, swallow every error and return `null` / `''`.
- **GitHub token posture** (`runbook.md`): a zero-scope classic PAT; write operations return 404. Nothing here needs more scope, and no new secret is required.
- **Product Hunt GraphQL** (Context7 `/websites/api-v2-docs_...producthunt...`, `/websites/api_producthunt_v2`): `Post` exposes `name`, `tagline`, `description` (plain text), `slug`, `votesCount`, `website`, and a `topics` `TopicConnection`; `posts(topic:)` selects posts having the given slug as *one of* their topics. Quota is complexity-based: **6250 points per 15 minutes**, reported in `X-Rate-Limit-Limit/Remaining/Reset`. So richer classification input for PH candidates is a query edit within the existing token, at extra complexity cost per post — and the multi-topic shape confirms F4's mechanism. The job's existing `phThrottled` retries once on 429 after 15 s.
- **Hacker News (Algolia)**: no auth, returns story url/points/title; the job builds entries with `description: null` deliberately. Documented consequence for this ticket: a text-based classifier will reject every HN-discovered candidate unless the job spends a GitHub `core` call to fetch the repo — i.e. tightening classification silently removes HN's discovery contribution unless that is handled.
- **Product Hunt commercial use** is flagged in `architecture.md`/`redlines.md` as needing human approval for commercial use; this ticket does not change what is stored from PH, only how it is filed.

### F12 — R-TEST: what cap6 will actually hit

Recorded in full under `## Risks`.

### F13 — evodocs vs code (code is authoritative)

- `.evodocs/modules/mod--web-app--catalog.md` describes the catalog as version-controlled JSON eagerly imported at build time, with two authored tracks and `ready` derived from file presence. **Code disagrees**: `app/src/lib/catalog-db.ts` loads categories and listings from Postgres, there are three tracks (`saas`/`oss`/`skill`), and `ready` is `ranked.length > 0`. Code is authoritative.
- `.evodocs/modules/mod--ingest-pipeline.md` describes `.agents/skills/wt-ingest` and `resources/content/wt-sources.json` as the discovery path. **Code disagrees**: `app/src/content/sources.json` records that file and skill as retired ("the refresh job owns discovery now"), and commit `1500ebd` removed them. The ticket already flags this doc as outdated. Its `known-limits` section is still accurate and predicted this exact ticket: dedicated skill discovery is over-narrow, "GitHub search and unaudited age-normalized velocity can favor old or ambiguously categorized repositories", and "inspect track overlap and category fit rather than trusting keyword matches".
- `.evodocs/modules/mod--web-app--github-trending.md` matches the code and was used to find `CATEGORY_RULES`.
- No evodocs module covers `app/jobs/refresh.mjs` at all — the module this ticket changes is undocumented, which is why this draft leans on direct code reading and `specs/content-in-db.md`.

## Assumptions

- **A1 — no schema change is needed.** The assignment result rides in the existing machine-owned `evidence` jsonb, or is not persisted at all. Low risk to assume for drafting, but if a per-row confidence or "deciding evidence" column is wanted, `ssot-schemas/db-schemas/whichtouse.sql` is the SSOT and changes first.
- **A2 — the classifier is deterministic code plus versioned config, running inside the unattended job.** Forced by `engineering-rules.md` and by the job's environment (F9). If the accepted design instead requires offline judgement, the `describe-emerging.mjs` pattern is the precedent — but then the daily job still needs a rule for candidates that pass through before the offline pass has seen them, which is unresolved.
- **A3 — withdrawing a row by leaving `rank = null` is the intended way to unfile a misfiled row** (F6), and losing the resulting `/c/{slug}/{item}` URLs is acceptable. This is an assumption about product tolerance, not a code fact, and it is the reason the R-UI material below is not a formality.
- **A4 — the ticket's counts (287 emerging, 100 labelled) are accurate as of the ticket freeze.** Not verified in cap3: `nf-db` is unavailable and cap3 performed no database access. How they get verified later — and by whom, under what approval, given that the only route left is a direct read of the production schema — is unresolved, not assumed (R13).
- **A5 — `leading`/reviewed rows are out of the classifier's reach.** They are placed by the reviewed-rows branch before the emerging loop, and the ticket says their category is human-decided. Assumed: the classifier never withdraws or re-files a row with `reviewed_at != null`.
- **A6 — `--dry` is write-safe, not access-free.** Verified in code: it logs and `continue`s before the transaction, so it writes nothing. But it opens a connection to the production schema and selects from `categories` and `listings` before that point, so it is itself a production database read — the same access question R13 raises, not an exemption from it. It also needs both source tokens.
- **A7 — the AC's "re-judge the existing 287 rows" can be satisfied by running the new rule over the stored row fields** (`name`, `owner`, `repo_full_name`, `homepage`, `source_description`) rather than by re-fetching every source. If the rule needs text that is not stored (topics are not persisted anywhere in `listings`), this assumption breaks and the evaluation needs live fetches — which are possible for `oss`/`skill` rows via `repo_full_name` and impossible for `saas` rows, which carry no repo handle (F8).
- **A8 — rewriting `skillQueries` / `phTopics` themselves is treated as optional.** The ticket diagnoses them but does not mandate the edit, and S1 neutralises them by construction. Recorded as an assumption because the opposite reading (fix the queries too) changes which files are touched.

## Risks

- **R1 — UI: bands disappear with no explanation.** `Standing` returns `null` on an empty list, so a category losing its emerging rows just gets shorter; a wholly empty track shows "Nothing here yet / Nothing on this route has made the shortlist", which attributes the emptiness to the world rather than to our filter. Directly in tension with `goal.md`'s honesty claim.
- **R2 — UI copy becomes a false claim.** "Newer challengers, surfaced by two or more sources." is already false for `selfPlacing` sources and is precisely the rule S3 rewrites.
- **R3 — UI/SEO: ~100 item URLs start returning 404** (`c_.$slug.$item.tsx` throws `notFound()`); the home page's "N areas of work" count can move; a category that loses every ranked row is greyed out and unclickable in the rail on every page (`app-frame.tsx`, `isDisabled={!category.ready}`); and the four home-page featured leaderboards can change or drop below four (`getHomeFeatured`, app track, `items.length >= 5`). No sitemap change, but external and indexed links break.
- **R4 — acceptance criteria pull against a ticket constraint.** AC3 ("at most one wrong entry per list, on three sampled categories") rewards strictness; the constraint "no category's emerging list may be emptied or nearly emptied" punishes it. A single global confidence threshold may not satisfy both, and per-category calibration is itself a judgement call with no settled owner.
- **R5 — the `productivity` collapse may be unrecoverable from PH text alone.** Six categories share that topic; if a tagline (or even a tagline plus description) cannot separate presentation from meeting-notes from legal-contract, the honest outcome is dropping those candidates — which lands straight on R4's constraint, since PH is the only `saas` discovery source.
- **R6 — HN-discovered candidates carry no text at all** (F8): a text-based rule rejects every one of them unless the job spends a GitHub `core` call. HN is one of the two corroborating origins that let an `oss` candidate clear the two-origin bar (the other being Product Hunt, F5), so silently dropping HN candidates narrows `oss` discovery at the same time as S3 tightens it.
- **R7 — dependency/redline pressure.** The obvious "real" fixes (embeddings, an LLM classifier, a taxonomy service) are all forbidden by 无谓依赖铁律 and by the no-paid-API constraint. Any drift toward "just add a small library" is a charter breach, and a silent install is explicitly called out as an abort condition.
- **R8 — production data risk.** The 100 labels are the only evaluation baseline and live in production. Deleting rows, re-running the enrichment pass over them, or a "cleanup" script that rewrites `best_for` destroys them; `redlines.md` classifies destructive writes to `whichtouse-schema` as human-approval-only.
- **R9 — configuration drift.** `queries`, `skillQueries`, `skillClassify` and `phTopics` are already four parallel per-category vocabularies in one file. A fifth (the classifier's) is a fifth place to drift out of sync with `categories.json`'s 25 slugs.
- **R10 — runtime budget.** A full run already spends ≈4 minutes in serialised GitHub search throttling; per-candidate enrichment calls add to that, and the job's timeout/retry posture in Azure Container Apps Jobs is not recorded anywhere in the repo.
- **R11 (R-TEST) — the job is unreachable by the test runner.** `app/vitest.config.ts` includes only `src/**/*.test.ts`; `app/jobs/refresh.mjs` is outside it, exports nothing, and calls `main()` at module top level — importing it from a test would execute the job against whatever `DATABASE_URL` is in the environment. Any unit test requires extracting a pure module (or widening the include), which is a change cap6 must make deliberately.
- **R12 (R-TEST) — there is exactly one existing test** (`app/src/lib/github-trending-parser.test.ts`, a pure HTML parser) and no fetch-mocking pattern anywhere in the repo. Testing anything that touches GitHub/PH/HN needs a stubbing approach invented for this ticket.
- **R13 (R-TEST) — the acceptance criteria are measured against production data, and the sanctioned DB route is missing.** There is no local database, no seeded test schema, and no committed fixture of the 287 rows. `nf-db` — the tool the engineering rules route every database operation through — is not installed, and the common rule says to stop rather than proceed unsafely. That leaves only a direct read of the production schema via the runbook's `.pgpass` + `psql` path (host IP must be in the PG firewall), which is a human decision about access and approval, not something this ticket may assume. Where an exported fixture would live, whether it is committed, and whether it may contain production rows are all open.
- **R14 (R-TEST) — the end-to-end check needs live credentials.** `--dry` needs `GITHUB_TOKEN`, `PRODUCTHUNT_TOKEN` and `DATABASE_URL` from the gitignored root `.env`; without `PRODUCTHUNT_TOKEN` the PH source is skipped and the run silently exercises a different code path than production.
- **R15 — silent-failure precedent.** This exact job has already shipped two failures that produced plausible output instead of errors (the `query.split(' ')[0]` → `"ai"` Product Hunt bug that returned zero rows for all 25 categories without an error, and readme-scope search ranking `sindresorhus/awesome` first). Any new classification stage that drops candidates will look identical to "the sources returned less today" unless it reports what it discarded and why.
- **R16 — stale evodocs may mislead implementation** (F13); `app/jobs/refresh.mjs` has no module doc at all.

## Grill Required

yes
