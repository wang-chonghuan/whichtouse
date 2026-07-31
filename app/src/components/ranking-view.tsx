// Category page — implements demo/category.html.
//
// Three columns, one per form. Each column carries two standings: what has held
// up, and what is climbing. A row shows rank, name, a neutral one-liner, the one
// comparative advantage, and the single biggest drawback — nothing else. A list
// exists to decide what to open; everything further lives in the detail panel.

import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'

import {
  monogramColor,
  ProductDetailPanel,
  type DetailPanelItem,
} from '~/components/product-detail-panel'
import { Mockup, Panel, Pill, SectionHeading, ValenceLine } from '~/components/ui/primitives'
import type { CategoryView, RankItem, Track } from '~/lib/catalog'

type Row = DetailPanelItem

const TRACKS: Array<{ key: Track; label: string; dot: string }> = [
  { key: 'app', label: 'App / SaaS', dot: '#4a2fa8' },
  { key: 'oss', label: 'Open Source', dot: '#0f7a3d' },
  { key: 'skill', label: 'Agent Skills', dot: '#c0662f' },
]

const STANDINGS = [
  {
    key: 'leading' as const,
    label: 'Leading',
    // The demo said "held the top for 12+ months". Nothing can back that: we
    // keep no history, because order is re-derived from the current sources on
    // every run. This is what `leading` actually means.
    note: 'reviewed by hand, top of today’s aggregate',
  },
  {
    key: 'emerging' as const,
    label: 'Emerging',
    note: 'surfaced by two or more sources, not yet reviewed',
  },
]

const TYPE_LABEL: Record<Track, string> = {
  app: 'App / SaaS',
  oss: 'Open Source',
  skill: 'Agent Skill',
}

const s = stylex.create({
  main: { position: 'relative', height: '100%', overflowY: 'auto' },
  page: {
    maxWidth: 'var(--wt-container)',
    marginInline: 'auto',
    marginTop: 28,
    marginBottom: 64,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    paddingInline: { default: 16, '@media (min-width: 640px)': 24, '@media (min-width: 1024px)': 32 },
  },

  // §3.9 breadcrumb
  crumbs: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--wt-ink-muted)' },
  crumbHere: { fontWeight: 600, color: 'var(--wt-ink)' },

  h1: {
    margin: 0,
    fontSize: { default: 34, '@media (max-width: 640px)': 28 },
    lineHeight: 1.25,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: 'var(--wt-ink)',
  },
  lede: {
    marginBlock: 0,
    marginTop: 12,
    maxWidth: 768,
    fontSize: 15.5,
    lineHeight: 1.5,
    color: 'var(--wt-ink-muted)',
  },
  note: {
    marginBlock: 0,
    marginTop: 8,
    maxWidth: 768,
    fontSize: 14.5,
    lineHeight: 1.5,
    color: 'var(--wt-ink-muted)',
  },

  cols: {
    marginTop: 32,
    display: 'grid',
    columnGap: 36,
    rowGap: 48,
    gridTemplateColumns: {
      default: '1fr 1fr 1fr',
      '@media (max-width: 1180px)': '1fr 1fr',
      '@media (max-width: 820px)': '1fr',
    },
  },
  col: { minWidth: 0 },
  colHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  colDot: { width: 10, height: 10, borderRadius: 9999, flexShrink: 0 },

  standing: { marginTop: 28 },
  standingHead: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 8,
    rowGap: 2,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line)',
  },
  standingLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--wt-ink)',
  },
  standingNote: { fontSize: 12.5, color: 'var(--wt-ink-muted)' },

  row: {
    display: 'block',
    width: '100%',
    textAlign: 'start',
    borderWidth: 0,
    backgroundColor: { default: 'transparent', ':hover': 'transparent' },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line-soft)',
    paddingBlock: 14,
    paddingLeft: { default: 2, ':hover': 10 },
    paddingRight: 2,
    cursor: 'pointer',
    transitionProperty: 'padding',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
  },
  rowSel: { backgroundColor: 'var(--wt-brand-tint)' },
  rowInner: { display: 'flex', gap: 10 },
  rank: {
    width: 12,
    flexShrink: 0,
    paddingTop: 2,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--wt-ink-muted)',
  },
  body: { minWidth: 0, flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: 600, color: 'var(--wt-ink)' },
  desc: {
    marginBlock: 0,
    marginTop: 2,
    fontSize: 13.5,
    lineHeight: 1.45,
    color: 'var(--wt-ink-muted)',
  },
  valence: { marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 },

  more: {
    marginTop: 0,
    paddingTop: 14,
    width: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: 600,
    color: { default: 'var(--wt-ink-muted)', ':hover': 'var(--wt-ink)' },
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  empty: { paddingTop: 14, textAlign: 'center', fontSize: 12.5, color: 'var(--wt-ink-muted)' },

  watchHead: { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 12, rowGap: 4 },
  h2: { margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--wt-ink)' },
  watchChips: { marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'var(--wt-line)', ':hover': 'rgba(26,26,26,0.2)' },
    backgroundColor: 'var(--wt-surface)',
    paddingInline: 12,
    paddingBlock: 4,
    fontSize: 13.5,
    fontWeight: 500,
    color: 'rgba(26,26,26,0.7)',
    textDecoration: 'none',
  },
  footNote: { marginTop: 20, marginBottom: 0, fontSize: 12.5, color: 'var(--wt-ink-muted)' },
})

const CAP = 5

function StandingBlock({
  items,
  label,
  note,
  selectedId,
  onSelect,
}: {
  items: Row[]
  label: string
  note: string
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? items : items.slice(0, CAP)
  const rest = items.length - CAP

  return (
    <section {...stylex.props(s.standing)}>
      <div {...stylex.props(s.standingHead)}>
        <span {...stylex.props(s.standingLabel)}>{label}</span>
        <Pill tone={label === 'Emerging' ? 'mid' : 'quiet'}>{items.length}</Pill>
        <span {...stylex.props(s.standingNote)}>{note}</span>
      </div>

      {shown.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onSelect(it.id)}
          {...stylex.props(s.row, selectedId === it.id && s.rowSel)}
        >
          <span {...stylex.props(s.rowInner)}>
            <span {...stylex.props(s.rank)}>{it.rank}</span>
            <span {...stylex.props(s.body)}>
              <span {...stylex.props(s.nameRow)}>
                <span {...stylex.props(s.name)}>{it.name}</span>
                {/* Aggregation must never be passed off as something we opened. */}
                {it.reviewed ? null : <Pill tone="mid">Not yet reviewed</Pill>}
              </span>
              {it.bestFor ? (
                <span {...stylex.props(s.desc)}>{it.bestFor}</span>
              ) : (
                <span {...stylex.props(s.desc)}>
                  <Mockup>No write-up yet — ranked from sources only.</Mockup>
                </span>
              )}
              <span {...stylex.props(s.valence)}>
                {it.edge ? <ValenceLine kind="edge">{it.edge}</ValenceLine> : null}
                {it.con ? <ValenceLine kind="con">{it.con}</ValenceLine> : null}
              </span>
            </span>
          </span>
        </button>
      ))}

      {items.length === 0 ? (
        <p {...stylex.props(s.empty)}>Nothing here clears the bar yet.</p>
      ) : rest > 0 ? (
        <button type="button" onClick={() => setExpanded((v) => !v)} {...stylex.props(s.more)}>
          {expanded ? 'Show top 5 only ↑' : `See ${rest} more →`}
        </button>
      ) : null}
    </section>
  )
}

function toRows(items: RankItem[], track: Track): Row[] {
  return items.map((it) => ({ ...it, track, typeLabel: TYPE_LABEL[track] }))
}

export function RankingView({ view }: { view: CategoryView }) {
  const cols = useMemo(
    () => TRACKS.map((t) => ({ ...t, rows: toRows(view.tracks[t.key], t.key) })),
    [view],
  )
  const all = useMemo(() => cols.flatMap((c) => c.rows), [cols])
  const hash = useRouterState({ select: (state) => state.location.hash })
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const itemId = params.get('item')
    if (itemId && all.some((r) => r.id === itemId)) setSelected(itemId)
  }, [hash, all])

  const selItem = all.find((r) => r.id === selected) ?? null
  const siblings = selItem ? all.filter((r) => r.track === selItem.track) : []

  return (
    <div {...stylex.props(s.main)}>
      <div {...stylex.props(s.page)}>
        <nav {...stylex.props(s.crumbs)}>
          <span>Tasks</span>
          <span>›</span>
          <span {...stylex.props(s.crumbHere)}>{view.category.name}</span>
        </nav>

        <Panel>
          <h1 {...stylex.props(s.h1)}>{view.category.name}</h1>
          {view.notes ? <p {...stylex.props(s.lede)}>{view.notes}</p> : null}
          <p {...stylex.props(s.note)}>
            Three forms, ranked separately — a hosted product, a repo you run, and a skill you drop
            into an agent are not the same decision. Each form has two standings: what has held up,
            and what is coming for it.
          </p>

          <div {...stylex.props(s.cols)}>
            {cols.map((col) => (
              <div key={col.key} {...stylex.props(s.col)}>
                <div {...stylex.props(s.colHead)}>
                  <span {...stylex.props(s.colDot)} style={{ backgroundColor: col.dot }} />
                  <SectionHeading>{col.label}</SectionHeading>
                </div>
                {STANDINGS.map((st) => (
                  <StandingBlock
                    key={st.key}
                    label={st.label}
                    note={st.note}
                    items={col.rows.filter((r) => r.standing === st.key)}
                    selectedId={selected}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            ))}
          </div>
        </Panel>

        {view.watchlist.length > 0 ? (
          <Panel variant="tint">
            <div {...stylex.props(s.watchHead)}>
              <h2 {...stylex.props(s.h2)}>Watchlist</h2>
              <span {...stylex.props(s.standingNote)}>pulled, or being re-checked</span>
            </div>
            <div {...stylex.props(s.watchChips)}>
              {view.watchlist.map((w) => (
                <a key={w.name} href={w.url ?? '#'} {...stylex.props(s.chip)}>
                  {w.name}
                </a>
              ))}
            </div>
            <p {...stylex.props(s.footNote)}>
              Five per standing by default, ten at most. Removing an entry is as much of the job as
              adding one.
            </p>
          </Panel>
        ) : null}
      </div>

      {selItem ? (
        <ProductDetailPanel
          item={selItem}
          siblings={siblings}
          onClose={() => setSelected(null)}
          onSelect={setSelected}
        />
      ) : null}
    </div>
  )
}

export { monogramColor }
