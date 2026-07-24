import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { Boxes, Package, Search, X } from 'lucide-react'

import type { CatalogSearchEntry } from '~/lib/catalog'
import { OPEN_CATALOG_SEARCH_EVENT } from '~/lib/catalog-search'

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= b.length; j++) {
      const old = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diagonal = old
    }
  }
  return previous[b.length]
}

function isAdjacentTransposition(query: string, value: string): boolean {
  if (query.length !== value.length) return false
  const mismatches: number[] = []
  for (let i = 0; i < query.length; i++) {
    if (query[i] !== value[i]) mismatches.push(i)
    if (mismatches.length > 2) return false
  }
  return (
    mismatches.length === 2 &&
    mismatches[1] === mismatches[0] + 1 &&
    query[mismatches[0]] === value[mismatches[1]] &&
    query[mismatches[1]] === value[mismatches[0]]
  )
}

function fuzzyScore(query: string, value: string): number | null {
  const q = normalize(query)
  const candidate = normalize(value)
  if (!q || !candidate) return null
  if (candidate === q) return 0
  if (candidate.startsWith(q)) return 1 + (candidate.length - q.length) / 100

  const words = candidate.split(' ')
  if (words.some((word) => word.startsWith(q))) return 2
  if (words.some((word) => isAdjacentTransposition(q, word))) return 2.5

  const includedAt = candidate.indexOf(q)
  if (includedAt >= 0) return 3 + includedAt / 100

  let queryIndex = 0
  let firstMatch = -1
  let lastMatch = -1
  for (let i = 0; i < candidate.length && queryIndex < q.length; i++) {
    if (candidate[i] === q[queryIndex]) {
      if (firstMatch < 0) firstMatch = i
      lastMatch = i
      queryIndex++
    }
  }
  if (queryIndex === q.length && lastMatch - firstMatch + 1 <= q.length + 2) {
    return 4 + (lastMatch - firstMatch - q.length) / 100
  }

  const maxDistance = Math.max(1, Math.floor(q.length * 0.34))
  const distance = Math.min(...words.map((word) => editDistance(q, word)))
  return distance <= maxDistance ? 5 + distance : null
}

const s = stylex.create({
  bar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: { default: 'var(--spacing-8)', '@media (max-width: 640px)': 'var(--spacing-3)' },
    height: 60,
    paddingInline: { default: 'var(--spacing-5)', '@media (max-width: 640px)': 'var(--spacing-3)' },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    flexShrink: 0,
    zIndex: 120,
  },
  logo: {
    fontSize: { default: 20, '@media (max-width: 640px)': 17 },
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  logoAccent: { color: 'var(--color-text-accent)' },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: { default: 'var(--spacing-5)', '@media (max-width: 640px)': 'var(--spacing-2)' },
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: { default: 14, '@media (max-width: 640px)': 12 },
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    paddingBlock: 'var(--spacing-1)',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    fontFamily: 'inherit',
  },
  active: {
    color: 'var(--color-text-accent)',
    borderBottomColor: 'var(--color-text-accent)',
  },
  search: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 'var(--radius-full)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    borderWidth: 0,
    backgroundColor: { default: 'transparent', ':hover': 'var(--color-overlay-hover)' },
    padding: 0,
  },
  searchMode: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', width: '100%' },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderWidth: 0,
    outline: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit',
    fontSize: 15,
  },
  results: {
    position: 'absolute',
    top: 59,
    left: 0,
    right: 0,
    maxHeight: 'min(520px, calc(100vh - 72px))',
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-high)',
  },
  resultGroup: { paddingBlock: 'var(--spacing-1)' },
  resultLabel: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 700,
  },
  result: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    borderWidth: 0,
    borderRadius: 'var(--radius-element)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--color-overlay-hover)' },
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  resultActive: { backgroundColor: 'var(--color-accent-muted)' },
  resultIcon: { display: 'flex', color: 'var(--color-text-secondary)', flexShrink: 0 },
  resultBody: { display: 'block', minWidth: 0 },
  resultName: { display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resultMeta: { display: 'block', marginTop: 2, fontSize: 12, color: 'var(--color-text-secondary)' },
  empty: { padding: 'var(--spacing-5)', color: 'var(--color-text-secondary)', fontSize: 13, textAlign: 'center' },
})

type ScoredEntry = CatalogSearchEntry & { score: number }

export function NavBar({ entries }: { entries: CatalogSearchEntry[] }) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const scored = entries
      .map((entry): ScoredEntry | null => {
        const score = fuzzyScore(query, entry.label)
        return score == null ? null : { ...entry, score }
      })
      .filter((entry): entry is ScoredEntry => entry != null)
      .sort((a, b) => a.score - b.score || (a.kind === b.kind ? 0 : a.kind === 'category' ? -1 : 1))

    const categories = scored.filter((entry) => entry.kind === 'category').slice(0, 4)
    const products = scored.filter((entry) => entry.kind === 'product').slice(0, 8)
    return [...categories, ...products]
  }, [entries, query])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    const openSearch = () => setOpen(true)
    window.addEventListener(OPEN_CATALOG_SEARCH_EVENT, openSearch)
    return () => window.removeEventListener(OPEN_CATALOG_SEARCH_EVENT, openSearch)
  }, [])

  useEffect(() => setActiveIndex(0), [query])

  const closeSearch = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }

  const choose = (entry: CatalogSearchEntry) => {
    void navigate({
      to: '/c/$slug',
      params: { slug: entry.categorySlug },
      hash: entry.itemId ? `item=${encodeURIComponent(entry.itemId)}` : '',
    })
    closeSearch()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeSearch()
      return
    }
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    }
    if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault()
      choose(results[activeIndex])
    }
  }

  return (
    <header ref={rootRef} {...stylex.props(s.bar)}>
      {open ? (
        <div {...stylex.props(s.searchMode)}>
          <Search size={19} color="var(--color-text-secondary)" />
          <input
            ref={inputRef}
            {...stylex.props(s.searchInput)}
            role="combobox"
            aria-label="Search categories and products"
            aria-expanded={results.length > 0}
            aria-controls="catalog-search-results"
            aria-activedescendant={results[activeIndex] ? `catalog-search-${activeIndex}` : undefined}
            placeholder="Search AI tools and categories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" aria-label="Close search" {...stylex.props(s.search)} onClick={closeSearch}>
            <X size={19} />
          </button>
          {query.trim() && (
            <div id="catalog-search-results" role="listbox" {...stylex.props(s.results)}>
              {results.length ? (
                <>
                  {(['category', 'product'] as const).map((kind) => {
                    const group = results
                      .map((entry, index) => ({ entry, index }))
                      .filter(({ entry }) => entry.kind === kind)
                    if (!group.length) return null
                    return (
                      <div key={kind} {...stylex.props(s.resultGroup)}>
                        <div {...stylex.props(s.resultLabel)}>
                          {kind === 'category' ? 'CATEGORIES' : 'PRODUCTS'}
                        </div>
                        {group.map(({ entry, index }) => (
                          <button
                            id={`catalog-search-${index}`}
                            key={`${entry.kind}:${entry.categorySlug}:${entry.itemId ?? entry.label}`}
                            type="button"
                            role="option"
                            aria-selected={index === activeIndex}
                            {...stylex.props(s.result, index === activeIndex && s.resultActive)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => choose(entry)}
                          >
                            <span {...stylex.props(s.resultIcon)}>
                              {entry.kind === 'category' ? <Boxes size={17} /> : <Package size={17} />}
                            </span>
                            <span {...stylex.props(s.resultBody)}>
                              <span {...stylex.props(s.resultName)}>{entry.label}</span>
                              {entry.kind === 'product' && (
                                <span {...stylex.props(s.resultMeta)}>{entry.categoryName}</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </>
              ) : (
                <div {...stylex.props(s.empty)}>No matching categories or products</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <Link to="/" {...stylex.props(s.logo)}>
            Which<span {...stylex.props(s.logoAccent)}>ToUse</span>
          </Link>
          <nav {...stylex.props(s.nav)}>
            <Link to="/" {...stylex.props(s.link, pathname === '/' && s.active)}>
              Home
            </Link>
            <Link
              to="/c/$slug"
              params={{ slug: 'coding' }}
              {...stylex.props(s.link, pathname.startsWith('/c/') && s.active)}
            >
              Rankings
            </Link>
            <button
              type="button"
              aria-label="Search"
              {...stylex.props(s.link, open && s.active)}
              onClick={() => setOpen(true)}
            >
              <Search size={15} />
              Search
            </button>
          </nav>
        </>
      )}
    </header>
  )
}
