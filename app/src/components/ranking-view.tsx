import { useMemo, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Check, ExternalLink, Minus, Search, X } from 'lucide-react'

import type { CategoryView, Confidence, RankItem } from '~/lib/catalog'

type Track = 'app' | 'skill'
type Row = RankItem & { track: Track; typeLabel: 'App / SaaS' | 'Skill / Repo'; score: number; id: string }

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

function monogramColor(name: string): string {
  const hues = ['#0d7d78', '#3b6fb0', '#8e5bb5', '#c0662f', '#2f9e6b', '#b8860b']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % hues.length
  return hues[h]
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
  h1: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: 0, marginBottom: 'var(--spacing-4)' },
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
  secTitle: { fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 },
  secSub: { fontSize: 13.5, color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)', marginBottom: 'var(--spacing-5)' },
  cols: {
    display: 'grid',
    gridTemplateColumns: { default: '1fr 1fr', '@media (max-width: 900px)': '1fr' },
    gap: 'var(--spacing-6)',
  },
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
  name: { fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: 3 },
  price: { fontSize: 11.5, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  score: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)', fontSize: 15, flexShrink: 0 },
  empty: { fontSize: 13, color: 'var(--color-text-disabled)', paddingBlock: 'var(--spacing-4)' },
  foot: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-6)', fontSize: 12, color: 'var(--color-text-secondary)' },
  scrim: { position: 'fixed', inset: 0, backgroundColor: 'rgba(20,24,31,0.28)', zIndex: 90 },
})

const panel = stylex.create({
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 'min(560px, 100vw)',
    backgroundColor: 'var(--color-background-surface)',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-high)',
    zIndex: 100,
    overflowY: 'auto',
    padding: 'var(--spacing-6)',
  },
  head: { display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' },
  mono: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-container)', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 },
  name: { fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' },
  pricing: { fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 },
  close: { marginInlineStart: 'auto', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' },
  desc: { fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-primary)', marginBlock: 'var(--spacing-4)' },
  btns: { display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-5)' },
  section: { marginTop: 'var(--spacing-5)' },
  secLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' },
  glance: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-3)' },
  glanceItem: { borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-element)', padding: 'var(--spacing-3)' },
  glanceK: { fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 },
  glanceV: { fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' },
  why: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' },
  whyRow: { display: 'flex', gap: 'var(--spacing-2)', fontSize: 13.5, color: 'var(--color-text-primary)', alignItems: 'flex-start' },
  pending: { borderWidth: 1, borderStyle: 'dashed', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-element)', padding: 'var(--spacing-3)', fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 },
  srcRow: { display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' },
  src: { fontSize: 12, color: 'var(--color-text-accent)', textDecoration: 'none', borderBottomWidth: 1, borderBottomStyle: 'dotted', borderBottomColor: 'var(--color-border)' },
  alts: { display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' },
  alt: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', paddingInline: 'var(--spacing-3)', paddingBlock: 'var(--spacing-1)', fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)', background: 'none', cursor: 'pointer' },
  altMono: { width: 18, height: 18, borderRadius: 4, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  green: { color: 'var(--color-success)', display: 'flex', flexShrink: 0, marginTop: 2 },
  official: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 'var(--spacing-2)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-accent)',
    textDecoration: 'none',
  },
  basis: { fontSize: 13.5, lineHeight: 1.5, color: 'var(--color-text-primary)' },
  priceGrid: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' },
  priceRow: { display: 'flex', gap: 'var(--spacing-3)', fontSize: 13.5, alignItems: 'baseline' },
  priceK: { width: 88, flexShrink: 0, color: 'var(--color-text-secondary)', fontSize: 12 },
  priceV: { color: 'var(--color-text-primary)', fontWeight: 500 },
  featList: { display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' },
  feat: {
    fontSize: 12.5,
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  pcGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' },
  pcCol: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' },
  pcHead: { fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--color-text-secondary)' },
  pcItem: { display: 'flex', gap: 'var(--spacing-2)', fontSize: 13, color: 'var(--color-text-primary)', alignItems: 'flex-start', lineHeight: 1.4 },
  con: { color: 'var(--color-error)', display: 'flex', flexShrink: 0, marginTop: 2 },
  caveat: { fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)', fontStyle: 'italic' },
})

function DetailPanel({
  item,
  siblings,
  updated,
  onClose,
  onSelect,
}: {
  item: Row
  siblings: Row[]
  updated: string
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const conf = CONF[item.confidence]
  const alts = siblings.filter((x) => x.id !== item.id).slice(0, 4)
  const hasPricing = item.pricingFree != null || item.pricingPaid != null
  const hasPC = (item.pros?.length ?? 0) > 0 || (item.cons?.length ?? 0) > 0
  return (
    <>
      <div {...stylex.props(s.scrim)} onClick={onClose} />
      <aside {...stylex.props(panel.panel)}>
        <div {...stylex.props(panel.head)}>
          <div {...stylex.props(panel.mono)} style={{ backgroundColor: monogramColor(item.name) }}>
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div {...stylex.props(panel.name)}>
              {item.name}
              <Badge variant={item.track === 'app' ? 'blue' : 'purple'} label={item.typeLabel} />
            </div>
            {item.homepage && (
              <a href={item.homepage} target="_blank" rel="noreferrer" {...stylex.props(panel.official)}>
                Official site <ExternalLink size={13} />
              </a>
            )}
          </div>
          <span {...stylex.props(panel.close)} onClick={onClose}>
            <X size={20} />
          </span>
        </div>

        <p {...stylex.props(panel.desc)}>{item.bestFor}</p>

        <div {...stylex.props(panel.btns)}>
          <Button variant="primary" label="Compare" isDisabled />
          {item.homepage && (
            <Button variant="secondary" label="Visit site" onClick={() => window.open(item.homepage!, '_blank', 'noreferrer')} />
          )}
        </div>

        <div {...stylex.props(panel.section)}>
          <div {...stylex.props(panel.secLabel)}>WHY IT RANKS #{item.rank}</div>
          <p {...stylex.props(panel.basis)}>
            {item.rankBasis ??
              `Ranked by consensus across ${item.sources.length} independent ${item.sources.length === 1 ? 'source' : 'sources'} (${conf.label.toLowerCase()} confidence). ${item.bestFor}`}
          </p>
        </div>

        <div {...stylex.props(panel.section)}>
          <div {...stylex.props(panel.secLabel)}>PRICING</div>
          {hasPricing ? (
            <div {...stylex.props(panel.priceGrid)}>
              <div {...stylex.props(panel.priceRow)}>
                <span {...stylex.props(panel.priceK)}>Free plan</span>
                <span {...stylex.props(panel.priceV)}>{item.pricingFree ?? 'None'}</span>
              </div>
              <div {...stylex.props(panel.priceRow)}>
                <span {...stylex.props(panel.priceK)}>Basic paid</span>
                <span {...stylex.props(panel.priceV)}>{item.pricingPaid ?? '—'}</span>
              </div>
            </div>
          ) : (
            <p {...stylex.props(panel.basis)}>{item.pricing ?? '—'}</p>
          )}
        </div>

        {item.features && item.features.length > 0 && (
          <div {...stylex.props(panel.section)}>
            <div {...stylex.props(panel.secLabel)}>KEY FEATURES</div>
            <div {...stylex.props(panel.featList)}>
              {item.features.map((f, i) => (
                <span key={i} {...stylex.props(panel.feat)}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div {...stylex.props(panel.section)}>
          <div {...stylex.props(panel.secLabel)}>STRENGTHS &amp; LIMITATIONS</div>
          {hasPC ? (
            <>
              <div {...stylex.props(panel.pcGrid)}>
                <div {...stylex.props(panel.pcCol)}>
                  <div {...stylex.props(panel.pcHead)}>STRENGTHS</div>
                  {(item.pros ?? []).map((p, i) => (
                    <div key={i} {...stylex.props(panel.pcItem)}>
                      <span {...stylex.props(panel.green)}>
                        <Check size={15} />
                      </span>
                      {p}
                    </div>
                  ))}
                </div>
                <div {...stylex.props(panel.pcCol)}>
                  <div {...stylex.props(panel.pcHead)}>LIMITATIONS</div>
                  {(item.cons ?? []).map((c, i) => (
                    <div key={i} {...stylex.props(panel.pcItem)}>
                      <span {...stylex.props(panel.con)}>
                        <Minus size={15} />
                      </span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <div {...stylex.props(panel.caveat)}>
                From aggregated reviews &amp; community — not our own hands-on test yet.
              </div>
            </>
          ) : (
            <div {...stylex.props(panel.pending)}>
              📋 Review pending — competitive strengths and limitations are added from aggregated
              reviews and our own testing.
            </div>
          )}
        </div>

        <div {...stylex.props(panel.section)}>
          <div {...stylex.props(panel.secLabel)}>SOURCES ({item.sources.length})</div>
          <div {...stylex.props(panel.srcRow)}>
            {item.sources.map((src, i) => (
              <a key={i} href={src.url} target="_blank" rel="noreferrer" {...stylex.props(panel.src)}>
                {src.name}
              </a>
            ))}
          </div>
        </div>

        {alts.length > 0 && (
          <div {...stylex.props(panel.section)}>
            <div {...stylex.props(panel.secLabel)}>OTHER {item.typeLabel.toUpperCase()} OPTIONS</div>
            <div {...stylex.props(panel.alts)}>
              {alts.map((a) => (
                <button key={a.id} {...stylex.props(panel.alt)} onClick={() => onSelect(a.id)}>
                  <span {...stylex.props(panel.altMono)} style={{ backgroundColor: monogramColor(a.name) }}>
                    {a.name.charAt(0).toUpperCase()}
                  </span>
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

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
    <section>
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
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const flt = (rows: Row[]) => (q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows)
  const apps = flt(appRows)
  const skills = flt(skillRows)

  const all = [...appRows, ...skillRows]
  const selItem = selected ? all.find((r) => r.id === selected) ?? null : null
  const siblings = selItem ? all.filter((r) => r.track === selItem.track) : []

  return (
    <div {...stylex.props(s.main)}>
      <div {...stylex.props(s.inner)}>
        <h1 {...stylex.props(s.h1)}>Find the best tools, apps, and skills for what you&rsquo;re doing.</h1>

        <div {...stylex.props(s.searchWrap)}>
          <Search size={18} color="var(--color-text-secondary)" />
          <input
            {...stylex.props(s.searchInput)}
            placeholder="Search tools in this use case…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <h2 {...stylex.props(s.secTitle)}>{view.category.name}</h2>
        <p {...stylex.props(s.secSub)}>
          The best apps and skills for {view.category.name.toLowerCase()}, ranked side by side — pick the
          form that fits how you work.
        </p>

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
        <DetailPanel item={selItem} siblings={siblings} updated={view.updated} onClose={() => setSelected(null)} onSelect={(id) => setSelected(id)} />
      )}
    </div>
  )
}
