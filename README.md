# WhichToUse

Find the best AI tool for the job — limits first.

Live at **[whichtouse.com](https://whichtouse.com)**. 25 areas of work; each
shows three routes side by side — SaaS, an open-source repo you run, and an
agent skill you drop into a coding agent — because those are three different
decisions, not three flavours of one.

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

The interface enforces this with colour. Exactly three surfaces are tinted, and
each means one thing:

| surface | means |
|---|---|
| indigo | **a judgement we made** — one callout per page, always labelled *Our read* |
| coral | **limits**, and nothing else |
| grey | **demoted** — Signals, evidence, Quick facts, the area rail, Emerging |

Strengths are marked in plain ink, never green. Green as "good" collides with
green as a brand colour, and green/red is the one pair colour-blind readers
cannot separate — so coral carries the signal alone, which is also what the
product promises.

The per-entry review state is tracked in the database (`reviewed_at`) and
governs what the refresh job may overwrite, but it is **not surfaced in the
UI**. An earlier build labelled every row *Reviewed* / *Not yet reviewed*; that
was removed deliberately. Do not reintroduce it without asking.

## Vocabulary

Fixed, and it has already drifted twice. The block at the top of
`app/src/components/home-page.tsx` is the canonical copy.

| word | means | where it may appear |
|---|---|---|
| **the job** | what the reader is trying to get done | prose only — "the best AI tool for the job". Never a label |
| **area** | one of the 25 | anywhere it must be named |
| **route** | SaaS, open source, skills | the three per area |
| **standing** | leading, emerging | the two within a route |

"task" was the word for the container until it was checked against the list.
Half of the 25 span several verbs — Voice & Audio is TTS *and* music *and*
listening; Bookkeeping & Finance is ledgers *and* spend management *and* CFO
services — so naming them after one action makes the label lie about its own
list. That is the same failure the rule above forbids, in the navigation instead
of the content. "Task" also reads as a to-do item, which undersells a decision
you live with for months.

The labels themselves are broad subject nouns on purpose. Do not verb them.

**The database still says `category`** — the table, the type, the `/c/:slug`
route. That is schema vocabulary and changing it buys nothing a reader can see.
The split is deliberate; do not "fix" it.

`.agents/skills/wt-enrich` is the written form of this rule, and is worth
reading before touching any copy the app generates.

## Layout

| path | what it is |
|---|---|
| `app/` | the site — TanStack Start + Astryx + StyleX, Postgres-backed |
| `app/src/theme/wtuTheme.ts` | **the whole look**, as tokens. See "Theming" |
| `app/src/theme/brand.json` | the handful of values the theme cannot reach |
| `app/src/components/` | seven files; every page is one of them |
| `app/public/prototype/` | design artifact, served at `/prototype`. See "Design decisions" |
| `resources/wtu-logo-2.png` | the mark. Every icon is generated from it |
| `resources/wtu-logo-name.png` | the wordmark master. The topbar lockup is cut from it |
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

The visual system is [`app/src/theme/wtuTheme.ts`](app/src/theme/wtuTheme.ts):
one file, written to be read. Colour, type scale and motion are token
definitions there, so a rebrand is an edit in that file — **no component carries
an interface colour**.

There are now **no colour literals in `app/src/components/` at all**. There used
to be one deliberate exception — `Wordmark` set "WhichToUse" as type and held
the mark's three hexes, because a logo should not recolour when the palette
does. The wordmark is drawn art now (see "Brand assets") and carries its own
colour inside the file, so the exception is gone. Any hex in a component is a
bug.

The rule it stood for got one carve-out in the process. "Which" *is* the
primary: the master was drawn in #2A38A4 and the interface is #4F46E5, and two
indigos that close read as a mistake rather than as two decisions. So
`crop-wordmark.mjs` pulls it onto the primary as it cuts the asset — **change
the primary and that script has to be re-run**. "Use" is #0E6E66, the
prototype's deep teal. The coral "To" is left where the artist put it, hotter
than the #D4553C limits colour, because a neon sign should be.

It is written fresh rather than scaffolded from a shipped Astryx theme. A
600-line inherited palette is not a file anyone re-reads, and re-reading this
one is the point. `npx @astryxdesign/cli theme add <slug> src/theme` still
works if you want to start over from one of theirs.

The primary is a six-stop ramp derived from one hex by a lightness-proportional
rule, so changing it is six values rather than a redesign. **Proportional, not
absolute**: fixed stops (600 at 39% lightness, 700 at 32%) work for a mid blue
and invert for anything darker — ink green sits at L=24, where a "darker" 700
came out lighter than the button it was meant to deepen.

### brand.json

Four things consume a colour or a font outside React and so cannot follow the
theme: the `theme-color` meta the browser paints its chrome with, the webfont
`<link>`, the generated `site.webmanifest`, and the social card rendered by a
node script. They read
[`app/src/theme/brand.json`](app/src/theme/brand.json), which both the app and
`scripts/gen-icons.mjs` import.

**Its values duplicate theme tokens, and that duplication has already drifted
once.** Changing `--color-background-body` without changing
`brand.backgroundBody` shipped a mobile browser chrome painted in the previous
canvas colour. Move them together.

Type is **one family, everywhere**: Bricolage Grotesque, across body, headings,
labels and numbers. It used to be two — Inter for the interface, Bricolage
reserved for the wordmark — and Inter is now gone from the app entirely.

The font URL asks for the variable font's whole 200–800 weight range plus the
optical-size axis, because one file now has to cover 11px row text and display
headings. Narrowing it back to a few static weights flattens the type scale
without erroring.

**Bricolage's figures are proportional, and Inter's were tabular.** Measured at
40px, "111" sets 34.5px wide against 76.1px for "000" — a ranking column would
ripple at every row. The theme turns `font-variant-numeric: tabular-nums` on at
`app-shell` so the whole app inherits it. That line is load-bearing; deleting it
does not break anything visibly enough to notice, which is the problem.

### Three rules that have each been violated once

- **No colour, spacing or radius literals outside the theme.** Components use
  semantic tokens (`colorVars['--color-border']`). A value written into a
  component is invisible from the theme and survives a theme swap looking wrong.
- **Where an Astryx component owns a property, set it with that component's
  prop, not `xstyle`.** Astryx's pre-compiled CSS carries a `:not(#\#)`
  specificity boost and wins silently. Our StyleX is namespaced
  `classNamePrefix: 'wt'` (`vite.config.ts`) so the two builds can no longer
  emit the same atomic class name — without it, our `display` and Astryx's were
  literally the same class, and a media query of ours could not turn it off.
- **On an `<a>`, `color` and `border-color` cannot be set from StyleX at all.**
  Astryx's reset has `:where(a){color:inherit}` and
  `:where(*){border-color:currentColor}` — zero specificity, but `@layer reset`
  is declared *after* our StyleX layers, and layer order beats specificity.
  `background-color` has no reset rule, which is why it worked and the other two
  did not. `ActionLink` in `components/bits.tsx` puts the colour on an inner
  `<span>` and draws its outline with an inset `box-shadow`.

## Brand assets

Every favicon, app icon, the social card and the manifest come from one image:

```bash
cd app && npm run icons
```

`scripts/gen-icons.mjs` is the list of what it emits and why each size is padded
the way it is. **Nothing under `app/public/` is edited by hand** — the next run
overwrites it.

The master is `resources/wtu-logo-2.png`, the "wtu" neon lockup. It replaced a
traced SVG of a three-letter W/T/U monogram, and the tradeoff is worth knowing
before anyone "fixes" it: the monogram was upright geometric letterforms and
resolved at 16px; **this one does not.** At 32px — what a retina tab actually
draws — it reads; at 16px it is three coloured smudges. That is a property of
setting a cursive script into 16 pixels, not of the padding, and no crop
recovers it. `scripts/trace-logo.mjs` and `resources/brand/wtu-logo.svg` are the
retired monogram, kept because they are the only vector the brand has ever had.

The script measures the crop box off the alpha channel rather than hard-coding
it, so re-rendering the master at a different position or scale needs no edit.
Two numbers there were measured against *this* file and would have to be
re-measured for another one: the alpha threshold, because the master carries a
stray smudge at alpha 1–3 well below the lettering that swells the box by half
if it is counted, and `MARGIN`, which is deliberately near zero — this master
has a hard alpha edge, so unlike the wordmark below there is no bloom outside
the ink to protect.

The topbar wordmark is a different asset with a different master, and it *does*
have that bloom — drawn art no font and no trace can reproduce — so it stays a
bitmap:

```bash
cd app && npm run wordmark
```

`scripts/crop-wordmark.mjs` measures the lettering's bounding box in
`resources/wtu-logo-name.png`, pulls its blue onto the theme primary, crops with
a margin for the glow, and writes `public/wordmark-116.webp` and its 2x. It
takes 2.1 MB of mostly empty transparent canvas down to 3.8 kB. The display
height lives in two places that must agree — `HEIGHT` in that script and
`wordmark` in `components/bits.tsx`.

Three words, three colours, none of them painted by hand. The master carries two
— blue for "Which" *and* "Use", coral for "To" — so the script separates them
with `SPLIT_X`, the midpoint of the 163px gap in the blue ink where the coral
"To" stands between the two words. "Use" is shifted to teal, then everything
still blue is shifted to the primary.

Each shift is a hue/saturation/lightness *relationship* measured between two
named colours, not a fill: the letters have a darker outline and the bloom is a
long alpha falloff, and flooding matched pixels with one value flattens both.

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

## Design decisions

`app/public/prototype/index.html` is a self-contained page for choosing a
direction: candidate schemes over the three real page shapes, a live primary
picker, and a type switcher. The three mockups are written once and switching
only repaints CSS variables — a scheme that only works because a mockup was
hand-tuned for it would not survive contact with the app.

It is served from production so it can be looked at on a real screen, carries
`noindex`, and is disallowed in `robots.txt`. **It is not the source of truth
for anything.** Once a decision is implemented the values live in
`app/src/theme/`, and the directory should be deleted.

## Development notes

**The design system decides, not a mockup.** Compose from
`npx @astryxdesign/cli component <Name>` before reaching for a `<div>`, and read
`npx @astryxdesign/cli docs layout` before inventing a page frame. A Card is a
widget container — it wraps a whole leaderboard, never an individual row, which
Astryx calls card soup.

**Verify by measuring the DOM, not by eyeballing screenshots.** Screenshots have
been actively misleading in this repo. A style that fails to apply looks like a
design choice; `getComputedStyle` says which it is. Both specificity traps above
were invisible in a screenshot and obvious in one computed value.

**One styling system.** Astryx + StyleX, no exceptions. Tailwind was tried and
removed: both systems define `--color-accent`, Astryx sets it with `!important`,
and it silently overrode ported markup.

**`vite dev` needs a hand to deliver StyleX's CSS.** The unplugin ships its
atomic CSS by rewriting `index.html`; TanStack Start renders the document from a
component and serves no `index.html`, so that hook never fires and every StyleX
class comes up unstyled. `__root.tsx` loads `/@id/virtual:stylex:runtime` in dev
to do the job the plugin would have. Production is unaffected.

**Router scroll restoration is off on purpose.** It manages window scroll, and
it also wrote a stale offset onto the layout's scroll container after every
navigation — opening a listing from halfway down an area page landed halfway down
the listing. `AppFrame` resets scroll on each navigation instead. Consequence:
back also returns to the top.

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
Note that this script runs `git add -A` and commits before it deploys, so leave
nothing in the working tree you did not intend to ship.
