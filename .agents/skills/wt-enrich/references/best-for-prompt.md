# `bestFor` prompt

The one line under a row's name, in the ranked lists. Leading rows have one
because a human wrote it. Emerging rows are machine-placed and arrive with
nothing but a name, a link, and whatever the project says about itself.

This is the cheap pass that gives them a line — not full enrichment. It writes
one field. `field-spec.md` and the six-field pipeline are still what a row gets
when it is promoted to leading and someone actually opens it.

Send it to a subagent with web search and fetch. Fill `{{CATEGORY}}`,
`{{CATEGORY_BLURB}}` and `{{ROWS}}`; `describe-emerging.mjs prompt <slug>` does
that from the database.

---

## The prompt

```text
whichtouse.com ranks AI tools by area of work. Under each row's name sits one
line saying what that tool is for, so a reader scanning a column of ten
unfamiliar names can tell them apart without opening any of them.

The rows below have no such line. Write one for each.

AREA: **{{CATEGORY}}** — {{CATEGORY_BLURB}}.

{{ROWS}}

Each row shows what the project says about itself, where that exists. Treat it
as a lead, not as an answer — it is marketing copy written by the author, and
it is frequently a slogan, a list of emoji, or a claim about being the best.
Open the link before you write. If the self-description and the actual project
disagree, the project wins.

## What the line has to do

One sentence, 12 to 25 words. It answers "what is this for, and who is it
for" — enough that a reader choosing between ten rows can rule this one in or
out.

Say what it does and what makes it different from its neighbours in this list.
The rows are all in the same area, so "an AI tool for {{CATEGORY}}" separates
nothing and is worse than no line at all.

## Rules

- **Plain English, no marketing.** Never "powerful", "seamless", "blazing
  fast", "comprehensive", "cutting-edge", "revolutionary". If the project's own
  copy is adjectives, throw all of them away and describe the mechanism.
- **No emoji, no slogans, no title case.** One plain sentence, sentence case.
- **Never repeat the row's own name** at the start — the name is directly above
  the line and repeating it wastes the only sentence you have.
- **Do not rank, praise or recommend.** No "the best", "the most popular", "the
  go-to". Position is what the list itself says; this line says what the thing
  is. A star count is not a description.
- **Say what it actually is** when that differs from what it is filed as. If a
  row turns out to be a curated list of links, a tutorial, a personal
  dotfiles repo, or a tool for a completely different job, say so plainly in
  the line and flag it in your notes — a wrongly filed row is more useful to us
  than a description that covers for it.
- **If you cannot tell what it does** after opening it, return an empty string
  for that row. A blank line is honest; an invented one is not, and it will sit
  under a name on a page that promises the opposite.

## Return

ONLY this JSON, one entry per row, keyed by the `id` given above:

{"category":"{{CATEGORY}}","rows":{"<id>":"<the line>", ...}}

After the JSON, add a short note listing any row that is misfiled, dead,
abandoned, or not what its name suggests. That note is for the editor and
does not go on the page.
```

## Why each part is load-bearing

**"Open the link before you write" exists because the input is vendor copy.**
`source_description` is captured verbatim from GitHub and Product Hunt, and a
pass that paraphrases it produces a page of the authors' own marketing in our
voice — the same failure that put 31 wrong lines into "Before you pick", where
competitor blogs and vendor pages were read as evidence.

**The "no ranking" rule protects the two-standing split.** Emerging means
"surfaced by two or more sources", not "worse". A line reading "a popular
alternative to X" turns a neutral row into a verdict nobody made.

**The misfiled-row rule earns its keep immediately.** The first backfill put
`Claude-Red`, a library of offensive-security skills, in UI Design. Discovery
classifies by topic and description, so it will keep happening, and the pass
that reads every row one by one is the cheapest place to notice.

**The empty-string rule** is the same one the research prompt carries, for the
same reason: without it, a subagent that cannot work out what something does
writes a plausible sentence anyway, and that sentence is the one nobody checks.
