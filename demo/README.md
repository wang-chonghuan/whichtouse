# demo/ — frozen design reference

This is the **design source of record** for the app UI. It is not a prototype to
iterate on any more, and it should not be edited while the app is being built
against it: if the reference moves, "does the app match?" stops having an
answer.

Serve it and compare side by side:

```bash
cd demo && python3 -m http.server 5300 --bind 127.0.0.1
```

- http://127.0.0.1:5300/home.html
- http://127.0.0.1:5300/category.html
- http://127.0.0.1:5300/product.html

The app runs on 5200 (`cd app && npm run dev`).

## What is here

| file | the surface it defines |
|---|---|
| `shared.js` | shell — announcement banner, sticky header, task sidebar — plus the sample data |
| `home.html` | hero, "Find your tool by the job" columns, Trending panel, claims panel |
| `category.html` | three track columns, leading/emerging standings, edge/con lines, watchlist |
| `product.html` | detail as a **full page**: breadcrumb, hero card, two-column body |
| `theme.js` | the token table, transcribed from `../DESIGN.md` |

## Numbers live in DESIGN.md, not here

`theme.js` is a transcription. Every radius, type size, spacing step and colour
in it comes from [`../DESIGN.md`](../DESIGN.md), which recorded them as measured
values. When the app is checked against this demo, disagreements are settled by
DESIGN.md — that is what makes "identical" checkable rather than a matter of
opinion.

## The demo is Tailwind; the app is not

The demo loads Tailwind from the CDN, which is fine for a static reference and
is *not* how the app is built. The app implements the same design in
StyleX + Astryx, so the app carries one styling system rather than two. Values
are transcribed from DESIGN.md, not translated class-by-class.

## Known divergences, deliberate

Two things in the demo the app does not reproduce, because the app cannot back
them honestly:

- The banner reads "Content Writing re-checked — 3 entries dropped, 2 added".
  No diff is computed anywhere: we keep no history, because ranking order is
  re-derived from the current sources on every run. The app states the refresh
  instead.
- `LISTS[0].note` originally read "held the top for 12+ months". Nothing can
  support that for the same reason. It now says what `leading` actually means.
