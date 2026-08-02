# Detail prompt

The second pass. The first pass produces three one-line findings capped at 25
words; this one produces the prose behind each, revealed when the reader opens
"View all".

Send it to a subagent with web search and file read. Substitute the `{{...}}`
placeholders; everything else goes verbatim.

## Placeholders

| placeholder | what to put in it |
|---|---|
| `{{CATEGORY}}` | the category name as a reader would say it |
| `{{CATEGORY_BLURB}}` | one clause naming what is in scope |
| `{{LINES}}` | the three published lines, labelled `weigh` / `avoid` / `moving` |
| `{{SOURCES}}` | the sources the first pass returned, indented one per line |

---

## The prompt

```text
whichtouse.com puts a short card at the top of every category page: three
one-line findings about how to choose in that category. A reader who finds one
of them interesting can open it and read more. You are writing what they open.

CATEGORY: **{{CATEGORY}}** — {{CATEGORY_BLURB}}.

The three published lines, and the sources behind them:

{{LINES}}

  sources:
{{SOURCES}}

## First, check whether each line is true

Read the sources. Search for more where they are thin, and search for anything
that contradicts the line. Three things go wrong often enough to check for
specifically:

- **A claim about one vendor written as a rule about the category.** If your
  evidence is one company's pricing page or one company's docs, name the second
  independent vendor or study that supports the general claim. If there isn't
  one, the claim is about that vendor, and your detail should say so.
- **A mechanism inferred from an adjacent fact.** "The platform banned this, so
  the platform must penalise it" is an inference, not a finding. Say which one
  you have.
- **Competitor content read as evidence.** On a vendor's own pricing, billing or
  export behaviour, that vendor's documentation outranks any third-party
  comparison — most of which are written by companies selling the alternative.

If a line turns out to be wrong or overstated, write the true version. Do not
defend the line you were given.

## Then write the detail

One passage per line, four to six short paragraphs, roughly 200-250 words.

Write it for someone who read the one-liner, found it interesting, and wants to
understand it. They are not reading an audit. They want to know why this is
true, what it means for the choice in front of them, and what to do about it.

Each passage should open on the point, explain the mechanism in ordinary
language, and end on something the reader can actually do — a question to ask a
vendor, a test to run on their own material, a number to look for.

## Register

This is prose, not notes. Specifically:

- **Never mention the one-liner.** No "the line overstates", no "this is weaker
  than published", no "the first half holds". The reader cannot see your
  working and does not want to. If the published line was wrong, just write what
  is true — the correction is invisible and that is correct.
- **Plain English.** Short sentences. If a sentence needs re-reading, rewrite it.
- **Figures woven in, not stacked.** One or two numbers a paragraph, in the
  sentence they belong to. Round them: "about 71%", not "71.5%". A paragraph
  that is a list of measurements is a table, and a reader skips tables.
- **No citation apparatus.** No arXiv IDs, no "(Smith et al., 2026)", no source
  names unless the name is the point — "Clay repriced in March 2026" is fine
  because the reader may be buying Clay.
- **Naming products is allowed** here, unlike the one-liner, because a detail
  that cannot cite an example is not much of a detail. Name them as evidence,
  never as a recommendation — the ranked lists below the card do that job.
- **Paragraph breaks are load-bearing.** One wall of text reads as a footnote.

If two sources disagree and it matters to the reader, say so in a sentence and
say which you would trust. If a claim rests on a projection rather than a
measurement, say that too. Do not dress up a weak finding, and do not pad a
thin one to reach the word count.

## Return

ONLY this JSON:
{"category":"{{CATEGORY}}","weigh":{"detail":"..."},"avoid":{"detail":"..."},"moving":{"detail":"..."},"sources":["url",...]}

Use \n\n between paragraphs. After the JSON, add a short note listing any line
you found to be wrong, and what the evidence actually supports — that note is
for the editor, which is why it goes outside the JSON rather than inside the
detail.
```

## Why each part is load-bearing

**"Never mention the one-liner" is the rule this prompt exists for.** The first
run of this pass did not have it, and 31 of the 75 published lines turned out to
need correcting — so the details opened by arguing with them: "The line
compresses two findings that point in different directions", "This line is
weaker than published and needs correcting". Accurate, and unreadable. The
reader is choosing a tool, not reviewing our work.

**Rounding is not sloppiness.** The unrounded figures came back stacked three
and four to a sentence, because a researcher who has just verified something
wants to show it. `71.5%` reads as a citation; `about 71%` reads as a fact.

**The three checks at the top are the observed failure modes**, in the order
they occurred. Generalising from one vendor was the most common by far — the
prompt asks for a property of the class, and one well-documented vendor is the
easiest thing to find.

**The editor's note goes outside the JSON** so that a correction to a published
line does not leak into what the reader sees. Both need to exist; only one is
reader-facing.
