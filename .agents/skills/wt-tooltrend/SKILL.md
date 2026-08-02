---
name: wt-tooltrend
description: WhichToUse "Before you pick" refresh. Research a category's buying lens — what actually decides the choice, the pitfall buyers regret, where the category's capabilities are heading — and write the three lines into the corpus. Load when the user says "refresh before you pick", "which categories are due", "wt-tooltrend <slug>", "更新选品指标", or wants the indigo callout on an area page filled or re-researched. Do not load to rank items, discover candidates, or enrich a single product (that is wt-enrich).
---

# wt-tooltrend

The indigo callout at the top of every area page. Three lines that say *how to
choose here*, never *which product to choose* — the lists below already answer
that, and a card that repeats them costs a screenful to say nothing.

Two prompts drive it, and they live in different places on purpose. Pass 1's
research prompt is domain-general — it works for any comparison site — so it
lives in the global `n-tooltrend` skill (`references/research-prompt.md`) and
`before-you-pick.mjs` reads it from there. Pass 2's prompt is written against
this card, this reader and this card's register, so it lives here in
`references/detail-prompt.md`.

The rest of this file is what neither prompt can carry: which categories are
due, how a run gets into the database, and what has to be true before anything
is published.

## Two passes

The card has two layers and they are produced by two separate subagent runs.

**Pass 1 — the lines.** Three findings, 25 words each, in the collapsed card.

```bash
cd app
node scripts/before-you-pick.mjs due --days 90      # what needs a look
node scripts/before-you-pick.mjs prompt <slug>      # the filled research prompt
#   ... run that prompt in a subagent with web search + file read ...
node scripts/before-you-pick.mjs apply <slug> < result.json
node --env-file=.env scripts/publish-before-you-pick.mjs   # see below
```

**Pass 2 — the prose.** What the reader opens under "View all".

```bash
node scripts/before-you-pick.mjs detail-prompt <slug>
#   ... run that prompt in a subagent with web search + file read ...
node --env-file=.env scripts/write-byp-details.mjs --batch <n> < details.json
```

Keep them separate. A researcher writing both at once writes the short line to
fit the long one, and the short line is the one that has to stand alone.

`due` is the periodic entry point. Run it on whatever cadence the market
justifies — 90 days is a starting guess, not a finding. Categories that have
never been researched sort first, then oldest.

`prompt` fills the placeholders from `src/content/categories.json` and the
category's own corpus. It never invents them: `blurb`, `practitioners` and
`domainHint` are optional fields on the category index, and a missing `blurb`
prints a warning because the scope line then just repeats the category name,
which tells the researcher nothing.

`apply` validates and writes. It refuses on: a line over 25 words, a bare figure
(`96%`, `4.6x`) with no citation, missing or non-URL sources, all three lines
empty. Empty *individual* lines are accepted and stored as null — the card
renders only the lines that exist.

Run one subagent per category, in parallel. Expect two to four minutes and
fifteen to twenty tool calls each; a subagent that returns in under a minute did
not search.

## Landing it in the database

`apply` writes the corpus file. Getting it into Postgres is a second step, and
the obvious command is the wrong one:

**Do not run `scripts/import-content.mjs` to publish these.** It upserts every
listing and overwrites `standing` and `rank` from the corpus, discarding
whatever the daily refresh job has computed since. Write only the five
`pick_*` columns for the affected slugs.

## Recording the run

```bash
node --env-file=.env scripts/record-byp-run.mjs --batch <n>
```

Appends one row per researched category to `before_you_pick_runs`, which is the
history: every investigation ever made, never updated. `categories.pick_*` is
the published answer the site renders — one row per category, overwritten each
time. Two different jobs, so a run can be recorded without being shipped, and a
change in what the site says can be traced back to a batch and a date.

The row keeps the exact brief the researcher was given, the sources it returned,
and any editorial change made before publication (`src/content/byp-edits.json`).

## Pass 2 in detail

The prompt lives in `references/detail-prompt.md`; `detail-prompt <slug>` fills
it from the published lines and their sources. Two things about it are worth
knowing before you run it.

**It verifies before it expands, and that is most of its value.** Batch 1 sent
75 published lines into this pass. 31 came back wrong: claims true of one vendor
stated as category rules, mechanisms inferred from an adjacent fact, thresholds
traced back to vendors selling the fix, and two lines contradicted by a source
they cited themselves. None of it was catchable by the validator — see
`src/content/byp-line-review.md` for the list. An expander briefed only to
elaborate would have dressed all 31.

**The correction never appears in the detail.** The reader is choosing a tool,
not reviewing our work, so a detail that opens "the line overstates this" has
mistaken its audience. The researcher writes what is true and puts the
correction in a note *outside* the JSON, for whoever edits the published line.
The first run of this pass lacked that rule and the details read as audit
extracts.

Roughly 200-250 words a point, four to six short paragraphs. `write-byp-details`
refuses anything under 60 words — a "detail" the length of the line is the line
again — and merges rather than replaces, so one point can be rewritten without
resupplying the other two.

## Before it goes live

The three lines are opinions, some of them strong — "model choice barely matters
now" is an argument, not a fact. Read them before publishing, and check what the
validator cannot:

- **`moving` is the slot that goes wrong.** It attracts prices, launches and
  dates, and those are what secondary blogs repeat without checking. Three SEO
  sites agreeing is one source. Require the vendor's own changelog, pricing page
  or help centre, or drop the line.
- **Read the `weigh` lines across categories together.** "They all demo well on
  X; the real test is Y" is a good line once and a template by the fifth time.
- **A number that survived the validator still needs its source checked.** The
  validator catches `%` and `x`; it does not catch "half of", "most", or a bare
  count.

Never let a scheduled job generate *and publish* these unattended. `due` is
schedulable; the research and the review are not.

## What the research keeps finding

Both runs so far surfaced staleness in the corpus they read — prices that had
moved, a top-ranked open-source entry whose licence forbids the commercial use
it is ranked for. That is a finding about the content, not about the card.
Report it separately; do not fold it into the three lines.
