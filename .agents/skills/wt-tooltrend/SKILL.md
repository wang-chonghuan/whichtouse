---
name: wt-tooltrend
description: WhichToUse "Before you pick" refresh. Research a category's buying lens — what actually decides the choice, the pitfall buyers regret, where the category's capabilities are heading — and write the three lines into the corpus. Load when the user says "refresh before you pick", "which categories are due", "wt-tooltrend <slug>", "更新选品指标", or wants the indigo callout on an area page filled or re-researched. Do not load to rank items, discover candidates, or enrich a single product (that is wt-enrich).
---

# wt-tooltrend

The indigo callout at the top of every area page. Three lines that say *how to
choose here*, never *which product to choose* — the lists below already answer
that, and a card that repeats them costs a screenful to say nothing.

The prompt and the reasoning behind every clause in it live in the global
`n-tooltrend` skill (`references/research-prompt.md`). This file is the
WhichToUse-specific half: which categories are due, how to run one, and what has
to be true before anything is written.

## The loop

```bash
cd app
node scripts/before-you-pick.mjs due --days 90      # what needs a look
node scripts/before-you-pick.mjs prompt <slug>      # the filled research prompt
#   ... run that prompt in a subagent with web search + file read ...
node scripts/before-you-pick.mjs apply <slug> < result.json
```

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

## The expansion pass

`byp_details` is the prose behind each line, revealed by "View all" on the card.
It is a **second pass with its own subagent**, not a longer first answer — the
one-liner has to survive a 25-word limit, and a researcher writing both at once
writes the short one to fit the long one.

```bash
#   ... one expansion subagent per category, fed that category's three lines ...
node --env-file=.env scripts/write-byp-details.mjs --batch <n> < details.json
```

Brief the expander to **verify before it expands**. Batch 1's pass is the
argument for it: given three published lines to elaborate, the agents instead
found that Coding's `avoid` was half wrong at the level it claimed, that Voice &
Audio's `moving` overstated how far control had shifted, and that a source
behind Voice & Audio's `avoid` stated a revenue threshold its own licence text
does not contain. An expander that only elaborates would have dressed all three.

Detail runs about 200 words a point. That is three times the card's collapsed
height, which is why it is behind a toggle — and why the writer refuses anything
under 60 words, since a "detail" the length of the line is the line again.

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
