---
name: wt-enrich
description: WhichToUse detail-panel enrichment. Research a product or repository's official docs, code entry path, user workflow, popularity causes, pricing, strengths, and limitations; then produce rankBasis, pricingFree, pricingPaid, features, pros, and cons — plus the category's own "How we ranked these" note. Load when the user says "enrich the item details", "fill rankBasis/pricing/pros/cons", "rewrite the category note", "wt-enrich a category", or wants a bare ranked item turned into a researched detail card. Do not load for ranking/ordering items or candidate discovery.
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
| `rankBasis` | string | Causal explanation of why people adopt/share it and why it deserves this position. Explain the problem it compresses, the product/technical mechanism, and the user outcome; use rankings, stars, reviews, and usage only as confirmation. |
| `pricingFree` | string \| null | The free plan in concrete terms (credits/limits), or `null` if none. OSS → `"Free & open-source (self-host)"`. |
| `pricingPaid` | string \| null | The most basic/common PAID plan: price **and** what resources it includes (credits/seats/limits), or `null` if fully free. |
| `features` | string[] | 2–4 main features, short phrases. |
| `pros` | string[] | 2–3 competitive strengths. Each must name a specific mechanism/capability and the resulting user benefit, grounded in docs/code and validated by reviews/community where available. |
| `cons` | string[] | 2–3 real shortcomings/limitations, from aggregated reviews/community. |

Full per-field rules, the JSON schema, and worked examples (Firecrawl SaaS + Crawl4AI OSS):
read `references/field-spec.md`.

## Per-item pipeline

1. **Identify** — resolve the canonical product/site/repository and describe what job it actually
   performs for a user.
2. **Understand the product before judging it**:
   - App/SaaS: read the official overview, docs, primary workflow, pricing, and security/deployment
     material when relevant.
   - Repo/skill: read the README and architecture docs, then inspect the package manifest, runtime
     entry point, primary orchestration layer, and one representative data/service path. Do not infer
     the product from the README headline alone.
3. **Form a popularity thesis** — explain why users choose or share it:
   - What fragmented, expensive, or difficult workflow does it compress?
   - What is the immediate product hook or time-to-value?
   - Which technical/product choices make the promise credible?
   - Which distribution moment, community use case, or review pattern accelerated adoption?
   Metrics are evidence that the thesis resonated; they are not the thesis.
4. **rankBasis** — write 1–2 evidence-dense sentences answering why it belongs at this rank.
   Lead with the popularity thesis and differentiator. End with concrete adoption/review signals as
   confirmation when useful. Never lead with star growth or say that it ranks here because it is
   currently trending.
5. **Pricing** — open the OFFICIAL pricing page. Extract the free plan (or null) and the basic paid
   plan with its price + resources. For OSS repos: `pricingFree="Free & open-source (self-host)"`,
   `pricingPaid=null` (or a real hosted/cloud tier if one genuinely exists).
6. **features** — 2–4 main capabilities from the official site/docs and verified code paths.
7. **pros** — synthesize mechanism → outcome:
   - Good: `"cross-source corroboration suppresses single-feed noise before an alert reaches users"`.
   - Bad: `"strong adoption"`, `"many stars"`, `"active repository"`, `"easy to use"`.
   Stars, contributor counts, release cadence, and open-source status belong in `rankBasis` or
   sources unless they directly create a concrete user benefit.
8. **cons** — inspect current issues/discussions, reviews, support docs, and architectural tradeoffs.
   Prefer a measured limitation with a named failure mode over generic self-hosting/setup caveats.

## The category note (`notes`)

One string per file, beside `tracks` — not inside it. The app renders it under
**"How we ranked these"**, in a demoted card below the three route columns.

It is written for a reader who has just looked at the lists and wants to know
whether to trust them. **It is not a changelog, and it is not for us.**

| rule | why |
|---|---|
| **45 words, hard ceiling.** Two or three sentences. | It sits below the content it describes. A reader who has to work at it will simply not read it, and a long note is a worse answer than a short one, not a more thorough one. |
| **Plain words only.** No `rank determinant`, no `kind ('skill'\|'repo')`, no field names, no `track`. | These are our schema, not the reader's vocabulary. If a sentence needs a word that only exists inside this repo, it is being written to the wrong audience. |
| **Say what decided the order.** | The one thing the reader actually asked. "Ordered by how widely each one is actually used, then checked by hand" is a whole answer. |
| **Never a diff.** No "previously", "this fixes", "the prior bug", "was excluded because", "no longer". | The reader never saw the old version. Repair work is a commit message. |
| **No numbers as reasons.** No star counts, no "~260k★", no rankings quoted as justification. | Site-wide rule: numbers decide the order, they never supply the reason. This field is where that rule has been broken most. |
| **Only what is true of this category.** | A note that would read identically on another area page is filler — cut it rather than pad. |

If there is nothing specific to say, say the method plainly in one sentence and
stop. A short honest note beats a long one that performs thoroughness.

Bad — 152 words, and every clause is us talking to ourselves:

> Rich, high-consensus category with a genuine Agent Skill ecosystem. App track reflects settled
> 2026 developer consensus… The skill track now ranks genuine SKILL.md skills AND notable
> open-source coding-agent repos TOGETHER by real adoption/reputation (GitHub stars), with kind
> ('skill'|'repo') as a tag only — NOT a rank determinant. This fixes the prior bug where all
> skills were forced above all repos… Roo Code was excluded as its main repo is archived…

Good — 38 words, same facts a reader can use:

> Skills and open-source agents are ranked together here, by how widely each is
> actually used rather than by which kind of thing it is. Every entry was opened
> and tried; the write-ups are ours, not the vendors'.

## Honesty redlines (this is the whole point — do not violate)

- **Never invent a pricing number.** If a price is not verifiable on the official page, write
  `"Paid tiers available"` / `"consumption-based"` — no fake figure.
- **pros/cons must come from real aggregated sources**, never guessed. If you cannot find sentiment,
  leave the array short or omit — do not fabricate.
- **rankBasis must explain cause, not merely correlation.** Stars, review counts, or today's growth
  cannot be the reason by themselves.
- **No metric-shaped pros.** `"X stars"`, `"trending today"`, `"active repository"`, and
  `"large community"` are not strengths unless followed by a specific user-facing consequence.
- **Repo limitations must be specific.** Use issue titles, measured performance regressions,
  missing guarantees, licensing constraints, or documented workflow gaps; never auto-fill
  `"requires setup and maintenance"` without evidence.
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
