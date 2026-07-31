// Search, opened from the header pill or ⌘K. Uses the demo's surface
// vocabulary: white card on a dimmed canvas, radius 20, one 1px border, no
// shadow beyond the panel itself.

import { useMemo, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'

import type { CatalogSearchEntry } from '~/lib/catalog'
import { MonoTile } from '~/components/ui/primitives'

const s = stylex.create({
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingInline: 16,
    paddingTop: '12vh',
    backgroundColor: 'rgba(26, 26, 26, 0.2)',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    overflow: 'hidden',
    borderRadius: 'var(--wt-r-2xl)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--wt-line)',
    backgroundColor: 'var(--wt-surface)',
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    paddingBlock: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line)',
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: 15,
    color: 'var(--wt-ink)',
    fontFamily: 'inherit',
  },
  kbd: { flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--wt-ink-muted)' },
  list: { maxHeight: '50vh', overflowY: 'auto', padding: 8 },
  empty: {
    paddingInline: 8,
    paddingBlock: 24,
    textAlign: 'center',
    fontSize: 13.5,
    color: 'var(--wt-ink-muted)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 8,
    paddingBlock: 10,
    borderRadius: 'var(--wt-r-lg)',
    textDecoration: 'none',
    color: 'var(--wt-ink)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--wt-fill)' },
  },
  label: { flex: 1, minWidth: 0, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { flexShrink: 0, fontSize: 12, color: 'var(--wt-ink-muted)' },
  icon: { flexShrink: 0, color: 'var(--wt-ink-muted)' },
})

export function SearchOverlay({
  entries,
  onClose,
}: {
  entries: CatalogSearchEntry[]
  onClose: () => void
}) {
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return []
    return entries
      .map((e) => {
        const i = e.label.toLowerCase().indexOf(needle)
        // Prefix matches first, then tasks ahead of products.
        return i < 0 ? null : { e, score: i * 10 + (e.kind === 'category' ? 0 : 1) }
      })
      .filter((x): x is { e: CatalogSearchEntry; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((x) => x.e)
  }, [entries, q])

  return (
    <div {...stylex.props(s.scrim)} onClick={onClose}>
      <div {...stylex.props(s.card)} onClick={(e) => e.stopPropagation()}>
        <div {...stylex.props(s.head)}>
          <svg
            {...stylex.props(s.icon)}
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools and tasks"
            {...stylex.props(s.input)}
          />
          <kbd {...stylex.props(s.kbd)}>esc</kbd>
        </div>

        <div {...stylex.props(s.list)}>
          {q.trim() && results.length === 0 ? (
            <p {...stylex.props(s.empty)}>Nothing matches “{q.trim()}”.</p>
          ) : null}
          {results.map((e) => (
            <Link
              key={`${e.kind}:${e.categorySlug}:${e.itemId ?? e.label}`}
              to="/c/$slug"
              params={{ slug: e.categorySlug }}
              hash={e.itemId ? `item=${e.itemId}` : undefined}
              onClick={onClose}
              {...stylex.props(s.row)}
            >
              <MonoTile name={e.label} />
              <span {...stylex.props(s.label)}>{e.label}</span>
              <span {...stylex.props(s.meta)}>
                {e.kind === 'category' ? 'Task' : e.categoryName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
