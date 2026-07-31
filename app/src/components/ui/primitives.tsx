// Shared visual primitives for the app UI.
//
// The design source of record is demo/ (frozen) and the numbers behind it are
// in DESIGN.md. Measuring the demo first showed 264 utility classes but only
// 25 class-lists used more than once — so the demo is mostly one-off page
// layout, and the genuinely reusable surface is small. These are those pieces.
// Everything else belongs in the page that uses it.
//
// Values are transcribed from DESIGN.md rather than eyeballed from the demo,
// which is what makes "identical" checkable instead of a matter of opinion.

import * as stylex from '@stylexjs/stylex'

/* --------------------------------------------------------------------------
 * Panel — §3.4. Four surface levels: the canvas is off-white, so a plain white
 * panel already reads as raised with no shadow. Radius is always 28.
 * ----------------------------------------------------------------------- */

const panel = stylex.create({
  base: { borderRadius: 'var(--wt-r-3xl)', minWidth: 0 },
  surface: { backgroundColor: 'var(--wt-surface)', padding: 28 },
  tint: {
    backgroundColor: 'var(--wt-panel-tint)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--wt-panel-tint-border)',
    padding: { default: 26, '@media (max-width: 640px)': 20 },
  },
  brand: {
    backgroundColor: 'var(--wt-brand)',
    color: 'var(--wt-on-brand)',
    padding: { default: 40, '@media (max-width: 640px)': 28 },
  },
})

export function Panel({
  variant = 'surface',
  children,
  style,
}: {
  variant?: 'surface' | 'tint' | 'brand'
  children: React.ReactNode
  style?: stylex.StyleXStyles
}) {
  return <section {...stylex.props(panel.base, panel[variant], style)}>{children}</section>
}

/* --------------------------------------------------------------------------
 * MonoTile — §3.3. A logo is never a bare image; it is a contained mark on a
 * tinted square. We have no logo files, so the mark is the initial.
 * ----------------------------------------------------------------------- */

const tile = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--wt-fill)',
    color: 'var(--wt-ink-secondary)',
    fontWeight: 700,
  },
  sm: { width: 24, height: 24, borderRadius: 'var(--wt-r-sm)', fontSize: 11 },
  lg: { width: 50, height: 50, borderRadius: 13, fontSize: 20 },
})

export function MonoTile({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const letter = name.replace(/^.*\//, '').charAt(0).toUpperCase()
  return <span {...stylex.props(tile.base, tile[size])}>{letter}</span>
}

/* --------------------------------------------------------------------------
 * Pill — §3.2. All badges are fully rounded, bold, uppercase. The plan ramp is
 * the clearest idea in the reference: paid = black, mid = tinted brand,
 * free = grey. Three tiers in contrast alone, no hue coding.
 * ----------------------------------------------------------------------- */

const pill = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 9999,
    fontWeight: 700,
    textTransform: 'uppercase',
    paddingInline: 8,
    paddingBlock: 2,
    fontSize: 9.5,
    letterSpacing: '0.025em',
    whiteSpace: 'nowrap',
  },
  strong: { backgroundColor: 'var(--wt-ink)', color: 'var(--wt-brand)' },
  mid: { backgroundColor: 'var(--wt-accent)', color: 'var(--wt-on-accent)' },
  quiet: { backgroundColor: 'var(--wt-fill)', color: 'var(--wt-ink-muted)' },
  brand: { backgroundColor: 'var(--wt-brand)', color: 'var(--wt-on-brand)' },
})

export function Pill({
  tone = 'quiet',
  children,
}: {
  tone?: 'strong' | 'mid' | 'quiet' | 'brand'
  children: React.ReactNode
}) {
  return <span {...stylex.props(pill.base, pill[tone])}>{children}</span>
}

/* --------------------------------------------------------------------------
 * ValenceLine — the edge/drawback pair. Green and red are load-bearing here,
 * which is why the brand colour is violet and not the reference's lime.
 * ----------------------------------------------------------------------- */

const valence = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 13.5,
    lineHeight: 1.45,
    color: 'var(--wt-ink)',
  },
  dot: { width: 6, height: 6, borderRadius: 9999, flexShrink: 0, marginTop: 7 },
  edge: { backgroundColor: 'var(--wt-edge)' },
  con: { backgroundColor: 'var(--wt-con)' },
})

export function ValenceLine({ kind, children }: { kind: 'edge' | 'con'; children: React.ReactNode }) {
  return (
    <p {...stylex.props(valence.row)}>
      <span {...stylex.props(valence.dot, valence[kind])} />
      <span>{children}</span>
    </p>
  )
}

/* --------------------------------------------------------------------------
 * Mockup — content the demo shows that the app cannot supply yet. Rendered in
 * a distinct grey so a placeholder can never be mistaken for real data; that
 * distinction is the whole premise of the product.
 * ----------------------------------------------------------------------- */

const mock = stylex.create({
  text: {
    color: '#a9a2c4',
    fontStyle: 'italic',
  },
})

export function Mockup({ children }: { children: React.ReactNode }) {
  return (
    <span {...stylex.props(mock.text)} data-mockup="true" title="Placeholder — not real data yet">
      {children}
    </span>
  )
}

/* --------------------------------------------------------------------------
 * SectionHeading — §3.8. The 2px brand bar is the only structural use of the
 * brand colour in long-form content.
 * ----------------------------------------------------------------------- */

const heading = stylex.create({
  h: {
    marginBlock: 0,
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--wt-brand)',
    paddingLeft: 14,
    fontSize: { default: 22, '@media (max-width: 768px)': 20 },
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: 'var(--wt-ink)',
  },
})

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 {...stylex.props(heading.h)}>{children}</h2>
}

/* --------------------------------------------------------------------------
 * ListRow — §3.5, the dominant content primitive. The padding-left nudge on
 * hover is the reference's one signature micro-interaction: the text slides
 * rather than changing colour.
 * ----------------------------------------------------------------------- */

export const row = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 10,
    paddingInline: { default: 2, ':hover': null },
    paddingLeft: { default: 2, ':hover': 10 },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line-soft)',
    fontSize: 14,
    color: 'var(--wt-ink)',
    textDecoration: 'none',
    transitionProperty: 'padding',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  rank: {
    width: 12,
    flexShrink: 0,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--wt-ink-muted)',
  },
  body: { minWidth: 0, flex: 1 },
  name: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
})
