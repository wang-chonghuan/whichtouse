import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'

import {
  monogramColor,
  ProductDetailPanel,
  type DetailPanelItem,
} from '~/components/product-detail-panel'
import type { CategoryView, Confidence, RankItem } from '~/lib/catalog'

type Track = 'app' | 'oss' | 'skill'
type Row = DetailPanelItem & { score: number }

const CONF: Record<Confidence, { variant: 'green' | 'yellow' | 'red'; label: string }> = {
  high: { variant: 'green', label: 'High' },
  medium: { variant: 'yellow', label: 'Medium' },
  low: { variant: 'red', label: 'Low' },
}

// Derived display score (placeholder until hands-on testing), BANDED BY
// CONFIDENCE so the number can never contradict the confidence label — a
// low-confidence pick can never show a high score. Within a band, score steps
// down by position. Items are expected pre-sorted high→medium→low.
const BAND: Record<Confidence, number> = { high: 9.4, medium: 7.3, low: 5.4 }
function scoreFor(confidence: Confidence, indexInBand: number): number {
  return Math.max(0, Math.round((BAND[confidence] - indexInBand * 0.3) * 10) / 10)
}

function toRows(items: RankItem[], track: Track): Row[] {
  const bandSeen: Record<Confidence, number> = { high: 0, medium: 0, low: 0 }
  return items.map((it) => ({
    ...it,
    track,
    typeLabel:
      track === 'app' ? 'App / SaaS' : track === 'oss' ? 'Open Source' : 'Agent Skill',
    score: scoreFor(it.confidence, bandSeen[it.confidence]++),
    // The DB tool_slug, not position: the two right-hand tracks (oss + skill)
    // share a column, so `track:rank` is no longer unique, and a rank can move
    // under a deep link between refreshes.
    id: it.id,
  }))
}

const s = stylex.create({
  main: { position: 'relative', height: '100%', overflowY: 'auto' },
  inner: { maxWidth: 1120, marginInline: 'auto', paddingInline: 'var(--spacing-6)', paddingBlock: 'var(--spacing-7)' },
  h1: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: 0, marginBottom: 'var(--spacing-2)' },
  lede: { fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0, marginBottom: 'var(--spacing-6)', maxWidth: 620 },
  cols: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr 1fr 1fr',
      '@media (max-width: 1180px)': '1fr 1fr',
      '@media (max-width: 900px)': '1fr',
    },
    gap: 'var(--spacing-6)',
    minWidth: 0,
  },
  track: { minWidth: 0 },
  colHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-2)',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    marginBottom: 'var(--spacing-1)',
  },
  colDot: { width: 8, height: 8, borderRadius: 'var(--radius-full)', flexShrink: 0 },
  colLabel: { fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-primary)' },
  colCount: { fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-background-muted)', borderRadius: 'var(--radius-full)', paddingInline: 'var(--spacing-2)', paddingBlock: 1 },
  list: { display: 'flex', flexDirection: 'column' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-2)',
    cursor: 'pointer',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--color-overlay-hover)' },
  },
  rowSel: { backgroundColor: 'var(--color-accent-muted)', boxShadow: 'inset 3px 0 0 var(--color-text-accent)' },
  rank: { color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums', width: 18, textAlign: 'center', fontSize: 13, flexShrink: 0 },
  mono: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 'var(--radius-element)', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  body: { flex: 1, minWidth: 0 },
  name: {
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontSize: 14,
    display: '-webkit-box',
    overflow: 'hidden',
    overflowWrap: 'anywhere',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
  },
  meta: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: 3 },
  price: { fontSize: 11.5, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  score: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)', fontSize: 15, flexShrink: 0 },
  empty: { fontSize: 13, color: 'var(--color-text-disabled)', paddingBlock: 'var(--spacing-4)' },
})

function TrackColumn({
  label,
  dotColor,
  rows,
  selectedId,
  onSelect,
}: {
  label: string
  dotColor: string
  rows: Row[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <section {...stylex.props(s.track)}>
      <div {...stylex.props(s.colHead)}>
        <span {...stylex.props(s.colDot)} style={{ backgroundColor: dotColor }} />
        <span {...stylex.props(s.colLabel)}>{label}</span>
        <span {...stylex.props(s.colCount)}>{rows.length}</span>
      </div>
      <div {...stylex.props(s.list)}>
        {rows.length === 0 && <div {...stylex.props(s.empty)}>No solid picks yet.</div>}
        {rows.map((it) => {
          const conf = CONF[it.confidence]
          return (
            <div key={it.id} {...stylex.props(s.row, selectedId === it.id && s.rowSel)} onClick={() => onSelect(it.id)}>
              <span {...stylex.props(s.rank)}>{it.rank}</span>
              <span {...stylex.props(s.mono)} style={{ backgroundColor: monogramColor(it.name) }}>
                {it.name.charAt(0).toUpperCase()}
              </span>
              <div {...stylex.props(s.body)}>
                <div {...stylex.props(s.name)}>{it.name}</div>
                <div {...stylex.props(s.meta)}>
                  {/* A row the refresh job placed by aggregation, that nobody has
                      opened, must not look like one we sat down with — that
                      difference is the entire premise of the site. */}
                  {it.reviewed ? (
                    <Badge variant={conf.variant} label={conf.label} />
                  ) : (
                    <Badge variant="yellow" label="Not yet reviewed" />
                  )}
                  <span {...stylex.props(s.price)}>{it.pricing ?? '—'}</span>
                </div>
              </div>
              <span {...stylex.props(s.score)}>{it.score.toFixed(1)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function RankingView({ view }: { view: CategoryView }) {
  const appRows = useMemo(() => toRows(view.tracks.app, 'app'), [view])
  const ossRowsMemo = useMemo(() => toRows(view.tracks.oss, 'oss'), [view])
  const skillRows = useMemo(() => toRows(view.tracks.skill, 'skill'), [view])
  const all = useMemo(
    () => [...appRows, ...ossRowsMemo, ...skillRows],
    [appRows, ossRowsMemo, skillRows],
  )
  const hash = useRouterState({ select: (state) => state.location.hash })
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const itemId = params.get('item')
    setSelected(itemId && all.some((row) => row.id === itemId) ? itemId : null)
  }, [all, hash, view.category.slug])

  const apps = appRows
  const ossRows = ossRowsMemo
  const skills = skillRows

  const selItem = selected ? all.find((r) => r.id === selected) ?? null : null
  const siblings = selItem ? all.filter((r) => r.track === selItem.track) : []

  return (
    <div {...stylex.props(s.main)}>
      <div {...stylex.props(s.inner)}>
        <h1 {...stylex.props(s.h1)}>Best {view.category.name} AI tools</h1>
        <p {...stylex.props(s.lede)}>
          Apps and open-source skills for {view.category.name.toLowerCase()} that we opened, read up
          on, and ranked — with the reasoning behind every pick.
        </p>

        <div {...stylex.props(s.cols)}>
          {/* One column per form. An earlier pass merged oss and skill because
              the skill track held 0-2 entries in 11 of 25 categories — but that
              gap was produced by searching repo names for "ai <category> skill"
              rather than by the ecosystem. Searching the agent-skills topics
              instead turned pdf-documents from 2 entries into 12. The column
              earns its place; the search did not. */}
          <TrackColumn label="APP / SAAS" dotColor="#4a2fa8" rows={apps} selectedId={selected} onSelect={setSelected} />
          <TrackColumn label="OPEN SOURCE" dotColor="#0f7a3d" rows={ossRows} selectedId={selected} onSelect={setSelected} />
          <TrackColumn label="AGENT SKILLS" dotColor="#c0662f" rows={skills} selectedId={selected} onSelect={setSelected} />
        </div>

      </div>

      {selItem && (
        <ProductDetailPanel
          item={selItem}
          siblings={siblings}
          onClose={() => setSelected(null)}
          onSelect={(id) => setSelected(id)}
        />
      )}
    </div>
  )
}
