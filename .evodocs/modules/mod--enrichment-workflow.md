# purpose

The enrichment workflow turns a bare ranked catalog item into the evidence-rich detail shown by WhichToUse. It is a repository-local agent skill that governs research, synthesis, in-place JSON editing, and deterministic structural validation. It enriches existing rankings; it never discovers candidates, changes order, or claims hands-on testing that did not occur.

# structure

The skill defines six added fields: causal rank rationale, free-plan pricing, paid-plan pricing, features, strengths, and limitations. Its field specification gives source standards, JSON shape, and reference examples for SaaS and open-source products.

The semantic work belongs to the host agent. For SaaS, the agent reads the official overview, workflow, documentation, pricing, and relevant security or deployment material. For repositories and skills, it reads beyond the README into architecture, package metadata, runtime entry points, orchestration, and a representative service or data path.

The validator is intentionally structural. It requires original core fields, validates skill/repository kind, checks that all six enrichment fields exist with expected types, and constrains feature, strength, and limitation array sizes.

# flows

The workflow identifies the canonical product or repository, understands the job it performs, and forms a popularity thesis before writing. Rank rationale leads with the difficult workflow the product compresses, the mechanism that makes it credible, and the resulting user value. Rankings, stars, reviews, or community discussion may confirm the thesis but cannot substitute for it.

Pricing comes only from an official pricing surface. A standing free plan must include concrete limits where published; a trial is not a free plan. The basic paid description includes both price and resources, or uses an honest non-numeric phrase when the vendor publishes no rate. Open-source projects default to self-hosted free pricing unless a real hosted tier exists.

Features summarize primary capabilities. Strengths must connect a specific mechanism to a user outcome. Limitations come from issues, discussions, support documentation, reviews, or architectural tradeoffs and should name an actual failure mode.

After editing one category file in place, the validator runs against that file. Findings are fixed before the result is presented or the workflow moves to the next category.

# module-relationships

`web-app/catalog` owns the JSON files and item contract this workflow edits. The detail panel consumes the six fields directly. Any field-shape change therefore requires coordinated catalog types, UI rendering, skill instructions, examples, and validator updates.

The ingest pipeline discovers and ranks database candidates but does not feed this workflow automatically. Enrichment assumes ranking and item membership are already decided and forbids changing them.

Official vendor sites, documentation, repository code, issue trackers, and aggregated community sources provide evidence. The workflow's output remains source-backed synthesis, not an assertion that WhichToUse completed hands-on testing.

# constraints

Never invent prices, review sentiment, product limitations, or adoption causes. When evidence is unavailable, use an honest generic pricing phrase, shorten an array, or leave optional content absent rather than manufacturing specificity.

Preserve every existing field, item, rank, and order. Do not add or remove products. Skill-track items must retain a valid `skill` or `repo` kind.

Metrics alone are not rank rationale, and metrics are not user-facing strengths. Repository limitations must be specific rather than generic warnings about setup or maintenance.

# known-limits

The validator cannot determine whether claims are true, causal, current, or supported by the listed sources. It does not compare against a pre-edit snapshot, so it cannot mechanically prove that every unknown existing field or rank order was preserved. Its comment promises contiguous rank checking, but the implementation only labels items by their current rank.

Research quality depends on external source availability and the host agent's judgment. Prices and community findings age quickly, and category files have no automatic freshness schedule.

# notes-for-ai

Begin by reading the whole target item and its existing sources, then inspect the actual product workflow before judging popularity. For repositories, trace executable behavior rather than relying on the README headline.

After edits, review the diff specifically for rank/order changes and dropped fields before running the validator. Recheck official pricing dates and prefer named issue or review evidence for limitations. Keep the distinction between source-backed research and hands-on testing visible in wording and badges.
