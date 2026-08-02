# prototype/

A design artifact, not part of the app. One self-contained HTML file: open it.

```bash
open prototype/index.html
```

Four candidate colour schemes across the three real page shapes — home, task,
tool. The tabs at the top are the only interactive thing on the page; every
button, link and row inside a mockup is deliberately dead (`pointer-events:
none`), because this is a colour decision and a link that responds to a click
invites people to test the wrong thing.

The markup for the three pages is written **once**. Switching schemes only
re-paints CSS variables. That is the point: a scheme that only works because a
mockup was hand-tuned for it will not survive contact with the real app.

## What is being decided

The brief was a not-too-heavy dark green or teal, with coral as the accent.
The complication is that this product already spends green and red as *meaning*
— "does this well" and "here is the catch". A green brand collides with the
first; a coral accent collides with the second.

All four schemes resolve it the same way: **retire the green/red pair, and let
coral be the limits colour.** Strengths get a plain ink bullet. Coral becomes
the only hue on the page with a job, which matches the positioning ("limits
first") and removes the red-green pairing that colour-blind readers cannot
separate.

They differ on the two things that actually change the character: how warm the
paper is, and how heavy the brand green sits.

## Once a scheme is picked

It stops living here. The values move into an Astryx theme file under
`app/src/theme/`, plus `app/src/theme/brand.json` for the handful of colours
consumed outside React. Nothing in `app/src/components/` carries a colour — see
the Theming section of the root README. **This directory is not the source of
truth for anything** and should be deleted once a decision has been made and
implemented, or it will start disagreeing with the app.
