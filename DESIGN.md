# DESIGN.md — Visual system

Reference implementation: **huntifyai.com** (audited 2026-07-26, desktop 1440×1000 + tool detail page).
Every number below is a **measured computed value** from the live site, not a guess. Where the site
uses a Tailwind utility whose computed value differs from the Tailwind default, the computed value wins.

Stack it is built on: **Tailwind CSS v4 + shadcn/ui**, `class="light"` on `<html>`, dark-mode variants
present in markup but light is the shipped default.

---

## 1. Foundations

### 1.1 Root

| Property | Value |
|---|---|
| Root font size | `16px` |
| `html` background | `#fafaf9` |
| `body` background | `#fafaf9` |
| `body` colour | `#1a1a1a` |
| `body` font-size | `16px` / line-height `24px` |
| `scroll-behavior` | `smooth` |
| Spacing base (`--spacing`) | `0.25rem` = 4px |

**The page is not pure white.** The canvas is warm-neutral `#fafaf9` (stone-50); white `#ffffff` is
reserved for cards, panels and the header. This one decision is what produces the whole "layered
but calm" look — every surface that matters is white *on* off-white, with a 1px border, and no shadow.

### 1.2 Typography

```
--font-sans:  "Space Grotesk", "Avenir Next", "PingFang SC", "Hiragino Sans GB",
              "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", ui-sans-serif, sans-serif
--font-mono:  "JetBrains Mono", monospace
--font-serif: "Source Serif 4", serif        /* declared, never used on any page */
```

Space Grotesk is loaded as a **variable font, weight range 300–700**. Only four weights are actually used:
`400` body · `500` nav / secondary UI · `600` buttons, labels, micro-copy · `700` all headings.
Mono appears exactly 3 times on the homepage (numeric stats). Effectively a **one-typeface system**.

The CJK fallbacks sit *inside* the sans stack, so Chinese renders in PingFang/Noto without a separate
font-family declaration.

#### Type scale (measured)

| Role | Size | Line-height | Weight | Tracking | Colour |
|---|---|---|---|---|---|
| Hero H1 | `clamp(28px, 4.6vw, 42px)` | `1.08` (45.36px @42) | 700 | `-0.025em` (−1.05px) | `#1a1a1a` |
| Detail H1 | `30px` → `sm:34px` | `1.25` (42.5px) | 700 | `-0.025em` | `#1a1a1a` |
| Section H2 (large) | `clamp(24px, 4vw, 32px)` | `1.25` (40px) | 700 | `-0.025em` | `#1a1a1a` |
| Section H2 (standard) | `24px` | `32px` | 700 | `-0.025em` (−0.6px) | `#1a1a1a` |
| Detail H2 (with brand bar) | `20px` → `md:22px` | `1.4` (30.8px) | 700 | `-0.025em` | `#1a1a1a` |
| H3 | `16px` | `24px` | 600 | normal | `#1a1a1a` |
| Body | `16px` | `24px` | 400 | normal | `#1a1a1a` |
| Body small | `14px` | `20px` | 400 | normal | `#1a1a1a` |
| Hero sub / lede | `15.5px` | `1.5` (23.25px) | 400 | normal | `#8a8a8a` |
| Card body | `14.5px` | `1.5` | 400 | normal | `#8a8a8a` |
| Micro action | `12.5px` | `1.5` | 600 | normal | `#8a8a8a` |
| Badge (large) | `11px` | `16.5px` | 700 | `0.05em` uppercase | contextual |
| Badge (small) | `9.5px` | `14.25px` | 700 | `0.025em` uppercase | contextual |
| Inline CTA in button | `13.5px` | `1.5` | 600 | normal | `#ffffff` |

**Rule: every heading carries `tracking-tight` (−0.025em). Body text never does.** That single
contrast — tight headings against normal-tracked body — is most of the typographic character.

Tailwind text tokens present in the theme:

```
--text-xs .75rem   --text-sm .875rem  --text-base 1rem/1.5  --text-lg 1.125rem
--text-xl 1.25rem  --text-2xl 1.5rem  --text-3xl 1.875rem/1.2
--text-4xl 2.25rem --text-5xl 3rem/1  --text-6xl 3.75rem/1
--leading-tight 1.25  --leading-snug 1.375  --leading-normal 1.5  --leading-relaxed 1.625
```

### 1.3 Colour

The full shadcn token set as shipped:

```css
:root {
  /* surfaces */
  --background:            #fafaf9;   /* page canvas — warm off-white */
  --foreground:            #1a1a1a;   /* 15.9:1 on canvas */
  --card:                  #ffffff;
  --card-foreground:       #1a1a1a;
  --popover:               #ffffff;
  --popover-foreground:    #1a1a1a;
  --sidebar:               #fbfbfa;

  /* primary is BLACK, not the brand colour */
  --primary:               #1a1a1a;
  --primary-foreground:    #ffffff;

  --secondary:             #f4f5f2;   /* chips, logo tiles, quiet fills */
  --secondary-foreground:  #3f3f3c;

  --muted:                 #f2f2ee;
  --muted-foreground:      #8a8a8a;   /* 3.5:1 — deliberately low, secondary text only */

  --accent:                #eef4d9;   /* brand tinted to ~15% — banners, soft badges */
  --accent-foreground:     #3d4a12;

  /* the actual brand colour */
  --brand:                 #c9f158;   /* electric lime */
  --brand-foreground:      #1a1a1a;   /* black on lime, never white */

  --destructive:           #c0564f;
  --destructive-foreground:#ffffff;

  --border:                #e6e6e2;
  --input:                 #e0e1de;
  --ring:                  #1a1a1a;   /* focus ring is black, not brand */

  --sidebar-accent:        #c9f158;
  --sidebar-accent-foreground: #1a1a1a;
  --sidebar-border:        #e6e6e2;
  --sidebar-foreground:    #3f3f3c;
  --sidebar-primary:       #1a1a1a;
  --sidebar-primary-foreground: #ffffff;

  /* charts */
  --chart-1: #1a1a1a;  --chart-2: #c9f158;  --chart-3: #7ea62e;
  --chart-4: #8a8a8a;  --chart-5: #d5e2a8;
}
```

**The governing idea: `--primary` is black; the lime is a separate `--brand` token used sparingly.**
Black carries all structural weight (headings, primary buttons, focus rings, chart series 1). Lime
appears maybe eight times per page — one CTA, one hero highlight, one section panel, a handful of
badges — and never as a large text colour. That restraint is why a colour this loud does not feel cheap.

Three one-off hexes are used inline instead of tokens (worth promoting to tokens if adopting):

| Hex | Used for |
|---|---|
| `#fbfde9` | Sponsored card fill (lime tinted to ~6%) |
| `#fafbf6` + border `#eef1e6` | "Browse all tools" panel |
| `#f1f0ea` | FAQ panel (warm grey) |

Alpha-modified colours seen in the wild: `border-border/70`, `border-foreground/5`,
`border-foreground/10`, `text-foreground/60`, `text-foreground/70`, `bg-brand/85` (hover),
`bg-primary/88` (hover), `bg-muted/50`.

### 1.4 Radius

Theme tokens:
```
--radius: 0.75rem;              /* 12px */
--radius-md: calc(0.75rem - 2px); /* 10px */
```

Measured radii in use — this is a **wide** scale, deliberately, with radius signalling scale of surface:

| Radius | Applied to |
|---|---|
| `7px` | 24px inline logo tile |
| `9px` | Hero highlight mark |
| `10px` | Small icon buttons, hero "Submit a tool" CTA |
| `12px` | Nav menu items |
| `13px` | 50px logo tile |
| `16px` | All standard buttons, search field |
| `18px` | Compact tool card |
| `20px` | Featured card, detail hero card |
| `28px` | Full-width section panels |
| `9999px` | All badges and pills, language selector |

Practical rule observed: **radius ≈ 0.4 × the element's padding**, and section panels always land on 28.

### 1.5 Elevation

```
--shadow-2xs / --shadow-xs : 0 1px 3px 0 rgba(0,0,0,.05)
--shadow-sm  / --shadow    : 0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.10)
--shadow-md                : 0 1px 3px 0 rgba(0,0,0,.10), 0 2px 4px -1px rgba(0,0,0,.10)
--shadow-lg                : 0 1px 3px 0 rgba(0,0,0,.10), 0 4px 6px -1px rgba(0,0,0,.10)
--shadow-xl                : 0 1px 3px 0 rgba(0,0,0,.10), 0 8px 10px -1px rgba(0,0,0,.10)
--shadow-2xl               : 0 1px 3px 0 rgba(0,0,0,.25)
```

Every shadow shares the same `0 1px 3px` base and only grows a second, softer layer — so elevation
reads as a single consistent light source and never gets glossy.

**In practice almost nothing has a shadow.** Cards use `border: 1px solid var(--border)` and nothing
else. Only the hero search field ships `shadow-sm`, upgrading to `shadow-md` on hover. Depth is
communicated by *border + background delta + hover lift*, not by blur.

### 1.6 Motion

```
--default-transition-duration: 0.15s
--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)
```

Three transitions exist on the whole site:

| Trigger | Property | Duration |
|---|---|---|
| Any interactive element | `color, background-color, border-color, box-shadow, opacity` | `150ms ease` |
| Card hover | `transform` → `translateY(-3px)` | `150ms cubic-bezier(.4,0,.2,1)` |
| List row hover | `padding-left` `2px → 10px` | `150ms` |

That row-hover padding shift is the site's one signature micro-interaction: the text slides right
instead of changing colour. Cheap, tactile, and it does not fight the palette.

---

## 2. Layout

### 2.1 Container

```html
<div class="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
```

| Breakpoint | Horizontal padding |
|---|---|
| base | `16px` |
| `sm` (640) | `24px` |
| `lg` (1024) | `32px` |

At a 1440px viewport the content box is **1376px**. Hero copy is separately constrained to
`max-w-3xl` (768px), the hero search row to `max-w-[560px]`, section ledes to `max-w-xl` (576px).

Container scale tokens: `--container-xs 20rem` through `--container-6xl 72rem`.

### 2.2 Vertical rhythm

Section blocks stack in a `flex flex-col gap-7` (28px) column with `mt-7 mb-16` on the wrapper.
Inside a section: heading → `mb-3.5` (14px) → content. Section panels use `p-7` (28px) at desktop.

Observed gap frequency across the homepage — the working spacing scale is
**4 · 6 · 8 · 10 · 12 · 16 · 20 · 28 · 32 · 36 · 40 · 48**, with 8px and 10px doing the bulk of the work.

### 2.3 Grids

| Block | Classes | Desktop gap |
|---|---|---|
| Featured cards | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` | `16px` |
| Use-case columns | `sm:grid-cols-2 xl:grid-cols-4` | `36px` |
| Compact tool cards | `grid-cols-1 sm:2 md:3 xl:4` | `12px` |
| Category link lists | `grid-cols-1 sm:2 lg:4` | `10px` row / `48px` column |
| Detail page | `grid-cols-1 lg:grid-cols-3` (content spans 2, sidebar 1) | `32px` |
| Wide list row | `grid-cols-[36px_1fr_52px] sm:grid-cols-[56px_1fr_52px]` | `16px` → `20px` |
| Footer | `grid-cols-1 sm:2 lg:[1.7fr_1fr_1fr_1fr]` | `32px` |

Note the pattern: **card grids get tight gaps (12–16px) because the card border already separates them;
borderless column layouts get wide gaps (36–48px) because nothing else does.**

### 2.4 Header

```html
<div class="sticky top-0 z-40 w-full">
  <header class="hidden justify-center border-b bg-card md:flex"> … </header>  <!-- desktop -->
  <header class="flex justify-center border-b bg-card md:hidden"> … </header>  <!-- mobile -->
</div>
```

| Property | Value |
|---|---|
| Sticky wrapper | `position: sticky; top: 0; z-index: 40` |
| Inner bar height | `64px` (`h-16`); outer 65px including border |
| Background | `#ffffff` (card, not canvas) |
| Bottom border | `1px solid #e6e6e2` |
| Logo mark | `32×32` (`size-8`), gap `8px` to wordmark |
| Nav items | `h-36 px-8 py-6` radius `12px`, `16px/500`, colour `foreground/60`, hover `bg-muted` |
| Right cluster | brand CTA · pill selector · black CTA |

Two separate `<header>` elements swapped at `md`, rather than one responsive header. Simpler to
reason about; costs a little duplicated markup.

### 2.5 Announcement bar

Sits above the sticky header (scrolls away).

| Property | Value |
|---|---|
| Height | `46px` |
| Background | `#eef4d9` (`bg-accent`) |
| Bottom border | `1px solid rgba(61,74,18,0.10)` (`accent-foreground/10`) |
| Content | lime pill badge · text (truncated) · `Try it →` link · close button |
| Close button | `26×26`, radius `10px`, `p-1.5`, `text-accent-foreground/60`, absolute `right-3.5 sm:right-5`, hover `bg-accent-foreground/10` |
| Inner padding | `px-4 pr-14 sm:pr-24` — extra right padding reserves space for the close button |

---

## 3. Components

### 3.1 Buttons

All buttons share: `inline-flex items-center`, `font-semibold` (600), `text-sm` (14px),
`rounded-xl` → **16px**, `gap-2` (8px), `transition-colors 150ms`, `cursor-pointer`.

| Variant | Height | Padding-x | Background | Text | Border | Hover |
|---|---|---|---|---|---|---|
| **Brand** ("Submit") | `40px` | `18px` (`px-4.5`) | `#c9f158` | `#1a1a1a` | none | `bg-brand/85` |
| **Primary** ("Log in") | `40px` | `18px` | `#1a1a1a` | `#ffffff` | `1px transparent` | `bg-primary/88` |
| **Primary lg** ("Visit") | `42px` (`h-10.5`) | `20px` | `#1a1a1a` | `#ffffff` | none | `bg-primary/88` |
| **Outline** ("Claim") | `42px` | `16px` | `#ffffff` | `#1a1a1a` | `1px #e0e1de` | `border-foreground` |
| **Ghost nav** | `36px` | `8px` | transparent | `foreground/60` | none | `bg-muted` (radius 12px) |
| **Pill** ("EN") | `36px` | `12px` | `#ffffff` | `foreground/70` | `1px border/70` | `border-foreground/20` |
| **Hero CTA** ("Submit a tool") | `44px` min | `16px` | `#1a1a1a` | `#ffffff` | none | radius **10px**, text `13.5px` |
| **Text link CTA** ("See more →") | `33px` | 0 | none | `#8a8a8a` | none | `text-foreground` |

Primary buttons carry `tracking-[-0.015em]`. `--ring: #1a1a1a` — focus is a black ring, not lime.

### 3.2 Badges & pills

All pills are `rounded-full`, `font-bold` (700), `uppercase`.

| Badge | Size | Padding | Background | Text |
|---|---|---|---|---|
| Brand tag ("SPONSORED") | `11px` / ls `0.05em` | `4px 10px` | `#c9f158` | `#1a1a1a` |
| Brand tag small | `10px` / ls `0.025em` | `2px 8px` | `#c9f158` | `#1a1a1a` |
| Dark metric ("DR 54") | `12px` / w600 | `2px 8px` | `#1a1a1a` | `#c9f158` |
| Plan · paid ("PRO") | `9.5px` / ls `0.025em` | `2px 8px` | `#1a1a1a` | `#c9f158` |
| Plan · mid ("BASIC") | `9.5px` | `2px 8px` | `#eef4d9` | `#3d4a12` |
| Plan · free ("FREE") | `9.5px` | `2px 8px` | `#f4f5f2` | `#8a8a8a` |
| Container pill | `12px` / w600, `h-30` | `4px 12px 4px 6px` | `#f4f5f2` + `1px #e6e6e2` | `#1a1a1a` |

The plan-tag ramp is the clearest idea in the whole system: **paid = black, mid = tinted brand,
free = grey.** Three tiers encoded purely in contrast, no hue coding, no icons.

### 3.3 Cards

**Featured card** (the tall marketing card)
```
min-height 200px · radius 20px · padding 20px · gap 16px (flex-col)
background #ffffff · border 1px #e6e6e2 · no shadow
hover: translateY(-3px), 150ms
measured 332 × 219 at lg:grid-cols-4
```

**Sponsored variant** — identical geometry, only the skin changes:
```
border 1.5px #c9f158 · background #fbfde9
```

**Compact tool card**
```
radius 18px · padding 16px · gap 10px · border 1px rgba(26,26,26,0.05)
background #ffffff · measured 335 × 117
hover: translateY(-3px)
```

**Detail hero card**
```
radius 20px · padding 20px (sm: 24px) · border 1px #e6e6e2 · background #ffffff
```

**Logo tiles** — always a tinted square behind a contained logo, never a bare image:

| Size | Radius | Padding | Inner image | Background |
|---|---|---|---|---|
| `50×50` | `13px` | `8px` | `34×34` `object-contain` | `#f4f5f2` |
| `24×24` | `7px` | `3px` | fills | `#f4f5f2` |

### 3.4 Section panels

Full-bleed-within-container blocks, all at **radius 28px**:

| Variant | Background | Border | Padding |
|---|---|---|---|
| White | `#ffffff` | none | `28px` |
| Tinted | `#fafbf6` | `1px #eef1e6` | `20px` (`sm: 26px`) |
| Grey | `#f1f0ea` | none | `36px 24px` (`sm: 40px`) |
| Brand | `#c9f158` | none | `28px` (`sm: 40px`) |

Four surface levels total: canvas `#fafaf9` → white → tinted → grey/brand. Because the canvas is
*not* white, a plain white panel already reads as elevated with zero shadow.

### 3.5 List rows

The dominant content primitive — ranked lists inside panels.

```
display: flex · align-items: center · gap: 10px
padding: 10px 2px · height 45px
border-bottom: 1px solid rgba(230,230,226,0.7)   /* border/70 */
font-size: 14px
hover: padding-left → 10px (transition-[padding] 150ms)
```

Composition: rank number → 24px logo tile → name → `›` chevron. Terminated by a
`See more →` link at `12.5px/600/#8a8a8a`, `mt-auto pt-3.5`, centred.

**Wide row** (the full directory table):
```
grid-cols-[36px_1fr_52px] · sm:grid-cols-[56px_1fr_52px]
gap 16px → sm:20px · padding 16px 20px → sm:26px
border-top 1px rgba(26,26,26,0.10)
```

### 3.6 Search field

```
height 46px · padding 10px 16px · radius 16px · gap 12px
background #fafaf9 (canvas, inset against the white section)
border 1px #e6e6e2 · shadow-sm
hover: border-foreground/20 + shadow-md
placeholder 16px/400 · trailing ⌘K hint chip
```

Inverting the usual relationship — a *canvas-coloured* input on a *white* section — is what makes it
read as recessed rather than raised.

### 3.7 Hero highlight

```html
<span class="inline-block -rotate-2 rounded-[9px] bg-brand px-2 text-brand-foreground">best</span>
```
`105×49` at 42px type. The −2° rotation is the only non-orthogonal element on the site.

### 3.8 Detail-page section heading

```html
<h2 class="mb-3.5 scroll-mt-24 border-l-2 border-brand pl-3.5
           text-xl font-bold tracking-tight md:text-[22px]">
```
`22px/700/-0.025em`, left border `2px #c9f158`, padding-left `14px`, margin-bottom `14px`.
This is the only place brand colour is used structurally, and it is what ties long-form
content back to the brand without tinting any text.

### 3.9 Detail-page layout

```
grid-cols-1 lg:grid-cols-3 · gap 32px
  ├─ main content   → col-span-2   (907px @1440)
  └─ sticky sidebar → col-span-1   (437px @1440), flex-col gap-20px
```
Breadcrumb bar above with a `36px` circular back button. Sidebar stack: sponsor card → conversion
card → action row (`grid-cols-2 gap-2` Like / Report, then Copy Link + share icons).

---

## 4. What actually makes this style work

Five decisions, in order of impact. If you adopt only some of them, adopt them in this order.

1. **Off-white canvas, white cards.** `#fafaf9` under `#ffffff`. Every other layering decision
   becomes free.
2. **Black is the primary; the bright colour is a separate, rationed token.** Structure is
   monochrome. The brand colour is an accent applied fewer than ten times per page.
3. **Borders instead of shadows.** `1px #e6e6e2` everywhere; shadows exist in the theme but are
   almost never applied.
4. **One typeface, tight headings.** Space Grotesk at 400/500/600/700, `-0.025em` on every heading
   and nothing else.
5. **Motion is 150ms and geometric.** A 3px lift and a 8px text nudge. No fades, no scale, no colour
   sweeps.

---

## 5. Adoption notes for this repo

Direct ports, no conflict:

- Canvas `#fafaf9` / card `#ffffff` / border `#e6e6e2` / muted text `#8a8a8a`
- Black `--primary`, black focus ring
- Radius ladder 7 / 10 / 12 / 16 / 18 / 20 / 28 / full
- Border-not-shadow elevation
- 150ms motion, `translateY(-3px)` card lift, `padding-left` row hover
- Space Grotesk with the CJK fallback stack already in the family declaration
- The plan-tag contrast ramp (black → tinted → grey) maps cleanly onto our pricing tiers

**One conflict to resolve before adopting the palette wholesale.** HuntifyAI's brand is lime
`#c9f158`. In our ranking cards, green and red are already load-bearing semantics — the green dot
means "edge", the red dot means "the single biggest drawback". A lime brand colour sitting next to a
green semantic dot will blur that distinction, which is the one thing our list format cannot afford
to lose.

Two ways out, both consistent with the system above:

- **Keep the structure, change the hue.** Everything in this document except `--brand` is
  hue-agnostic. Swapping lime for violet `#6C3EF5` or another non-green, non-red bright colour
  preserves the entire look. This is the low-risk option.
- **Keep lime, change the semantics.** Drop the coloured dots and encode edge/drawback
  typographically instead (a `+`/`−` prefix, or the black/grey contrast ramp already used for plan
  tags). Higher risk, but it is arguably more in the spirit of the reference — note that HuntifyAI
  itself encodes its three-tier plan signal with *contrast*, not hue.

Either way, `--brand-foreground` must stay `#1a1a1a`: black on the bright colour, never white.

### Decision (2026-07-26)

We took the first route. `proto/` implements everything in this document verbatim **except the
brand hue**, which moves from the reference's lime to a light violet — both to keep green and red
free for the edge/drawback dots, and so the site is not mistaken for HuntifyAI.

| Token | Reference | Ours |
|---|---|---|
| `--brand` | `#c9f158` | `#c4b0ff` |
| `--brand-foreground` | `#1a1a1a` | `#1a1a1a` (unchanged, 9.0:1) |
| `--accent` | `#eef4d9` | `#ede8ff` |
| `--accent-foreground` | `#3d4a12` | `#362073` (11.6:1 on accent) |
| brand-tint / panel-tint / panel-tint-border | `#fbfde9` / `#fafbf6` / `#eef1e6` | `#f7f4ff` / `#faf9ff` / `#efecfa` |

The lime is kept as an unused `brand-lime` token in `proto/theme.js` so the derivation above stays
readable. Nothing else in this document changes — every other value is hue-agnostic, which is why
the swap is five lines.

Two tokens are added that the reference has no equivalent for, because our list format carries a
valence the reference's never does: `--edge #0f7a3d` (dark, cool green) and `--con #c0564f`
(= `--destructive`, not a second red).
