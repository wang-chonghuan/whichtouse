// Search, opened from the header pill or ⌘K. Styled to the proto's surface
// vocabulary: white card on a dimmed canvas, 20px radius, 1px border, no shadow
// beyond the panel lift.

import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'

import type { CatalogSearchEntry } from '~/lib/catalog'

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
    const scored = entries
      .map((e) => {
        const label = e.label.toLowerCase()
        const i = label.indexOf(needle)
        if (i < 0) return null
        // Prefix matches first, then categories over products.
        return { e, score: i * 10 + (e.kind === 'category' ? 0 : 1) }
      })
      .filter((x): x is { e: CatalogSearchEntry; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
    return scored.slice(0, 10).map((x) => x.e)
  }, [entries, q])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/20 px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <svg
            className="size-4 shrink-0 text-muted-foreground"
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
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="shrink-0 text-[11px] font-semibold text-muted-foreground">esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim() && results.length === 0 ? (
            <p className="px-2 py-6 text-center text-[13.5px] text-muted-foreground">
              Nothing matches “{q.trim()}”.
            </p>
          ) : null}
          {results.map((e) => (
            <Link
              key={`${e.kind}:${e.categorySlug}:${e.itemId ?? e.label}`}
              to="/c/$slug"
              params={{ slug: e.categorySlug }}
              hash={e.itemId ? `item=${e.itemId}` : undefined}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary text-[11px] font-bold text-secondary-foreground">
                {e.label.replace(/^.*\//, '').charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{e.label}</span>
              <span className="shrink-0 text-[12px] text-muted-foreground">
                {e.kind === 'category' ? 'Task' : e.categoryName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
