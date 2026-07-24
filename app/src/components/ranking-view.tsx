import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'
import { Search } from 'lucide-react'

import {
  monogramColor,
  ProductDetailPanel,
  type DetailPanelItem,
} from '~/components/product-detail-panel'
import type { CategoryView, Confidence, RankItem } from '~/lib/catalog'

type Track = 'app' | 'skill'
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
    typeLabel: track === 'app' ? 'App / SaaS' : 'Skill / Repo',
    score: scoreFor(it.confidence, bandSeen[it.confidence]++),
    id: `${track}:${it.rank}`,
  }))
}

const s = stylex.create({
  main: { position: 'relative', height: '100%', overflowY: 'auto' },
  inner: { maxWidth: 1120, marginInline: 'auto', paddingInline: 'var(--spacing-6)', paddingBlock: 'var(--spacing-7)' },
  h1: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: 0, marginBottom: 'var(--spacing-2)' },
  lede: { fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0, marginBottom: 'var(--spacing-5)', maxWidth: 620 },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    height: 44,
    borderRadius: 'var(--radius-element)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    marginBottom: 'var(--spacing-6)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--color-text-primary)', fontFamily: 'inherit' },
  cols: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', '@media (max-width: 900px)': '1fr' },
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
  foot: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-6)', fontSize: 12, color: 'var(--color-text-secondary)' },
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
                  <Badge variant={conf.variant} label={conf.label} />
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
  const skillRows = useMemo(() => toRows(view.tracks.skill, 'skill'), [view])
  const all = useMemo(() => [...appRows, ...skillRows], [appRows, skillRows])
  const hash = useRouterState({ select: (state) => state.location.hash })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
    const itemId = params.get('item')
    setSelected(itemId && all.some((row) => row.id === itemId) ? itemId : null)
  }, [all, hash, view.category.slug])

  const q = query.trim().toLowerCase()
  const flt = (rows: Row[]) => (q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows)
  const apps = flt(appRows)
  const skills = flt(skillRows)

  const selItem = selected ? all.find((r) => r.id === selected) ?? null : null
  const siblings = selItem ? all.filter((r) => r.track === selItem.track) : []

  return (
    <div {...stylex.props(s.main)}>
      <div {...stylex.props(s.inner)}>
        <h1 {...stylex.props(s.h1)}>Best {view.category.name} AI tools</h1>
        <p {...stylex.props(s.lede)}>
          The best apps and open-source skills for {view.category.name.toLowerCase()}, ranked side by
          side — pick the form that fits how you work.
        </p>

        <div {...stylex.props(s.searchWrap)}>
          <Search size={18} color="var(--color-text-secondary)" />
          <input
            {...stylex.props(s.searchInput)}
            placeholder={`Search ${view.category.name.toLowerCase()} tools…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div {...stylex.props(s.cols)}>
          <TrackColumn label="APP / SAAS" dotColor="#4257c9" rows={apps} selectedId={selected} onSelect={setSelected} />
          <TrackColumn label="SKILL / REPO" dotColor="#7a49d6" rows={skills} selectedId={selected} onSelect={setSelected} />
        </div>

        {view.notes && (
          <p {...stylex.props(s.foot)}>
            <span>⚠ {view.notes}</span>
          </p>
        )}

        <div {...stylex.props(s.foot)}>
          <span>Last updated: {view.updated || '—'}</span>
          <span>📋 provisional — ranked from public sources, not yet hands-on tested</span>
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
