---
name: wt-enrich
description: WhichToUse detail-panel enrichment. Given a tool/app/skill/repo name, research and produce its detail fields — rankBasis, pricingFree, pricingPaid, features, pros, cons — for items in app/src/content/c/<category>.json. Load when the user says "enrich the item details", "fill rankBasis/pricing/pros/cons", "wt-enrich <category>", or wants to turn a bare ranked item into a full detail card. Do not load for ranking/ordering items or for discovering new items.
---

# wt-enrich

For each item in a WhichToUse category file, add six detail-panel fields, grounded in real
research and honestly sourced. Preserve every existing field and the existing rank order —
this pass enriches items, it never re-ranks or adds/removes them.

Target files: `app/src/content/c/<category>.json`, arrays `tracks.app[]` and `tracks.skill[]`.
Each item already has `rank, name, homepage, pricing, bestFor, confidence, badge, sources` (and
`kind` on the skill track). Add the six fields below to each item.

## The six fields

| field | type | what |
|---|---|---|
| `rankBasis` | string | CONCRETE reason it ranks here — cite real signals (avg position across major "best X" roundups, GitHub stars, G2/Capterra rating + review count, Reddit/community mention volume). Never an abstract score or "it's good". |
| `pricingFree` | string \| null | The free plan in concrete terms (credits/limits), or `null` if none. OSS → `"Free & open-source (self-host)"`. |
| `pricingPaid` | string \| null | The most basic/common PAID plan: price **and** what resources it includes (credits/seats/limits), or `null` if fully free. |
| `features` | string[] | 2–4 main features, short phrases. |
| `pros` | string[] | 2–3 competitive strengths, from aggregated reviews/community. |
| `cons` | string[] | 2–3 real shortcomings/limitations, from aggregated reviews/community. |

Full per-field rules, the JSON schema, and worked examples (Firecrawl SaaS + Crawl4AI OSS):
read `references/field-spec.md`.

## Per-item pipeline

1. **Identify** — resolve the official site (its `homepage`) and what the tool actually is.
2. **rankBasis** — search "best <use case> 2026", the tool's G2/Capterra page, its GitHub repo, and
   community threads. Synthesize ONE concrete sentence naming the signals (roundup rank, stars,
   rating+count, mentions). Auditable, not abstract.
3. **Pricing** — open the OFFICIAL pricing page. Extract the free plan (or null) and the basic paid
   plan with its price + resources. For OSS repos: `pricingFree="Free & open-source (self-host)"`,
   `pricingPaid=null` (or a real hosted/cloud tier if one genuinely exists).
4. **features** — 2–4 main features from the official site.
5. **pros / cons** — from aggregated reviews (G2, Capterra, Reddit, roundups). Real strengths and
   real limitations. These are consensus, NOT our own hands-on test — keep that framing.

## Honesty redlines (this is the whole point — do not violate)

- **Never invent a pricing number.** If a price is not verifiable on the official page, write
  `"Paid tiers available"` / `"consumption-based"` — no fake figure.
- **pros/cons must come from real aggregated sources**, never guessed. If you cannot find sentiment,
  leave the array short or omit — do not fabricate.
- **rankBasis must cite concrete signals**, never a bare adjective or the derived score.
- Do not touch `rank`, order, or any existing field; do not add or drop items.

## Boundary (agent vs code)

- **Host agent (you)**: all research, judgment, and synthesis of the six fields.
- **Deterministic**: `scripts/validate.mjs` checks a file's items for structural completeness
  (all six fields present, correct types, non-empty arrays, existing fields preserved). Run it
  after enriching each file; fix anything it flags.

## Invocation & modes

**Default is overwrite-in-place**: enrich the items inside the existing
`app/src/content/c/<category>.json` and write the file back. Do not create a copy, a backup, or a
new file, and do not ask for confirmation — overwriting the old file is the expected behavior.

Pick the category from the request:
- **A category is named** ("run lead-gen", "跑 lead-gen") → that file.
- **"one category" with none named** ("跑一个品类") → the first category under
  `app/src/content/c/` whose items are not yet enriched (no `rankBasis`); if all are enriched, the
  first file. State which one you picked.
- **"all categories"** ("跑所有品类") → iterate every `app/src/content/c/*.json`, one at a time:
  enrich → validate → present, then move to the next. `web-scraping.json` is already enriched and
  is the reference standard to match.

After enriching a file:

```bash
repo_root="$(git rev-parse --show-toplevel)"
node "$repo_root/.agents/skills/wt-enrich/scripts/validate.mjs" "$repo_root/app/src/content/c/<category>.json"
```

Fix anything it flags before presenting. The app-track (SaaS) items carry the real pricing detail;
OSS skill/repo items are mostly `Free & open-source`, so their value is in rankBasis
(stars/adoption), features, and pros/cons.

## Present the result

"Show it" / "展示" means: after validation passes, print a compact per-item summary so the user can
review the enriched content — for each item: `name — rankBasis` then `free / paid` then top
`pros` and `cons`. For "all categories", also print a one-line-per-category roll-up (category → #1
pick, item count). Mention that `cd app && npm run build && PORT=3001 node .output/server/index.mjs`
renders it in the detail panel if they want to see it in the UI.
