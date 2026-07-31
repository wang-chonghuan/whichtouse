// App chrome, ported class-for-class from proto/shared.js.
//
// The proto is the design source of record; every class list here is copied
// from it rather than re-derived, because hand-translating utilities is where
// visual drift comes from. Sections cited in the proto (DESIGN.md §2.4, §2.5,
// §3.1) are cited here too so the two stay diffable.

import { Link } from '@tanstack/react-router'

import type { Category, CatalogSearchEntry } from '~/lib/catalog'
import { useLayoutStore } from '~/lib/layout-store'

export const SIDEBAR_ID = 'use-case-sidebar'

/** §2.5 — sits above the sticky header, so it scrolls away.
 *
 * The proto's copy ("3 entries dropped, 2 added") is not reproduced: no diff is
 * computed, because we keep no history — order is re-derived from today's
 * sources on every run. This states the refresh date, which is a fact we have. */
function Banner({ updated }: { updated: string | null }) {
  return (
    <div className="relative shrink-0 border-b border-accent-foreground/10 bg-accent">
      <div className="mx-auto flex h-[46px] max-w-container items-center justify-center gap-3 px-4 pr-14 sm:px-6 sm:pr-24 lg:px-8">
        <span className="hidden shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold tracking-[0.025em] text-brand-foreground sm:block">
          UPDATED
        </span>
        <span className="truncate text-[13.5px] text-accent-foreground">
          Rankings re-derived from source{updated ? ` on ${updated}` : ''}
        </span>
      </div>
    </div>
  )
}

const IconTasks = () => (
  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
)

const IconSearch = ({ className = 'size-4 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

/** §2.4 — 64px inner bar, white on the off-white canvas, 1px bottom border.
 *  §3.1 — ghost nav items, pill search, brand CTA. */
function Header({ onSearch }: { onSearch: () => void }) {
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)
  const toggleMobile = useLayoutStore((s) => s.toggleMobile)

  return (
    <div className="sticky top-0 z-40 w-full shrink-0">
      <header className="flex justify-center border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-container items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:gap-6">
            <button
              type="button"
              aria-label="Open tasks"
              onClick={toggleMobile}
              className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-muted lg:hidden"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md bg-brand text-[17px] font-bold text-brand-foreground">
                W
              </span>
              <span className="hidden text-[19px] font-bold tracking-tight sm:block">WhichToUse</span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <button
                type="button"
                aria-controls={SIDEBAR_ID}
                onClick={toggleSidebar}
                className="flex h-9 items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-foreground/60 transition-colors hover:bg-muted"
              >
                <IconTasks />
                Tasks
              </button>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onSearch}
              className="hidden h-9 w-[260px] cursor-text items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-sm font-medium text-foreground/70 transition-colors hover:border-foreground/20 md:flex"
            >
              <IconSearch />
              <span className="min-w-0 flex-1 text-left text-muted-foreground">
                Search tools and tasks
              </span>
              <kbd className="shrink-0 font-sans text-[11px] font-semibold text-muted-foreground">
                &#8984;K
              </kbd>
            </button>
            <button
              type="button"
              aria-label="Search"
              onClick={onSearch}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-foreground/70 transition-colors hover:border-foreground/20 md:hidden"
            >
              <IconSearch />
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}

/** §2.4/§1.3 — sidebar tokens: #fbfbfa surface, #3f3f3c text, brand for the one
 * active row. Item geometry follows the nav item in §3.1 (36px, r12). */
function SidebarItem({
  to,
  params,
  label,
  active,
}: {
  to: string
  params?: Record<string, string>
  label: string
  active: boolean
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className={`flex h-9 items-center rounded-lg px-3 text-[13.5px] transition-colors ${
        active
          ? 'bg-brand font-semibold text-brand-foreground'
          : 'text-sidebar-foreground hover:bg-muted'
      }`}
    >
      {label}
    </Link>
  )
}

export function AppShell({
  categories,
  searchEntries,
  activeSlug,
  isHome,
  updated,
  onSearch,
  children,
}: {
  categories: Category[]
  searchEntries: CatalogSearchEntry[]
  activeSlug: string | null
  isHome: boolean
  updated: string | null
  onSearch: () => void
  children: React.ReactNode
}) {
  const desktopOpen = useLayoutStore((s) => s.sidebarOpen)
  const mobileOpen = useLayoutStore((s) => s.mobileOpen)
  const setMobile = useLayoutStore((s) => s.setMobile)

  // Below lg the sidebar is an overlay panel over the content; at lg and up it
  // is a layout column that can be collapsed out.
  const asideClass = [
    'w-[240px] shrink-0 overflow-y-auto border-r border-border bg-sidebar py-4',
    mobileOpen
      ? 'fixed inset-y-0 left-0 z-50 block shadow-[0_1px_3px_0_rgba(0,0,0,.10),0_8px_10px_-1px_rgba(0,0,0,.10)]'
      : 'hidden',
    desktopOpen ? 'lg:block lg:static lg:z-auto lg:shadow-none' : 'lg:hidden',
  ].join(' ')

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-foreground">
      <Banner updated={updated} />
      <Header onSearch={onSearch} />

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setMobile(false)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside id={SIDEBAR_ID} className={asideClass}>
          <nav className="flex flex-col gap-0.5 px-3">
            <SidebarItem to="/" label="Home" active={isHome} />
          </nav>
          <div className="px-4 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
            Tasks
          </div>
          <nav className="flex flex-col gap-0.5 px-3 pb-4">
            {categories.map((c) => (
              <SidebarItem
                key={c.slug}
                to="/c/$slug"
                params={{ slug: c.slug }}
                label={c.name}
                active={c.slug === activeSlug}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-background">{children}</main>
      </div>

      {/* Search entries stay available to whatever surface the search opens. */}
      <span hidden data-search-entries={searchEntries.length} />
    </div>
  )
}
