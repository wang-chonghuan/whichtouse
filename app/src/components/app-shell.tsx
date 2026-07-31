// App chrome — announcement banner, sticky header, task sidebar.
//
// Implements demo/shared.js in StyleX. Numbers come from DESIGN.md §2.4/§2.5
// (64px header, 46px banner, 240px sidebar, 1px #e6e6e2 rules) rather than
// from reading the demo's class names, so the two are checkable against a
// table instead of against each other.

import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'

import type { Category, CatalogSearchEntry } from '~/lib/catalog'
import { useLayoutStore } from '~/lib/layout-store'
import { Mockup, Pill } from '~/components/ui/primitives'

export const SIDEBAR_ID = 'use-case-sidebar'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: stylex.firstThatWorks('100dvh', '100vh'),
    overflow: 'hidden',
    backgroundColor: 'var(--wt-canvas)',
    color: 'var(--wt-ink)',
  },

  // §2.5 — above the sticky header, so it scrolls away.
  banner: {
    flexShrink: 0,
    backgroundColor: 'var(--wt-accent)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(54, 32, 115, 0.10)',
  },
  bannerInner: {
    height: 'var(--wt-banner-h)',
    maxWidth: 'var(--wt-container)',
    marginInline: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingInline: { default: 16, '@media (min-width: 640px)': 24 },
  },
  bannerText: {
    fontSize: 13.5,
    color: 'var(--wt-on-accent)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // §2.4 — 64px inner bar, white on the off-white canvas, one bottom border.
  headerWrap: { position: 'sticky', top: 0, zIndex: 40, width: '100%', flexShrink: 0 },
  header: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'var(--wt-surface)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line)',
  },
  headerInner: {
    height: 'var(--wt-header-h)',
    width: '100%',
    maxWidth: 'var(--wt-container)',
    marginInline: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    paddingInline: { default: 16, '@media (min-width: 640px)': 24, '@media (min-width: 1024px)': 32 },
  },
  left: { display: 'flex', alignItems: 'center', minWidth: 0, gap: { default: 12, '@media (min-width: 1024px)': 24 } },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 'var(--wt-r-md)',
    backgroundColor: 'var(--wt-brand)',
    color: 'var(--wt-on-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    fontWeight: 700,
    flexShrink: 0,
  },
  wordmark: {
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: 'var(--wt-ink)',
    display: { default: 'none', '@media (min-width: 640px)': 'block' },
  },
  logoLink: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' },

  // §3.1 — ghost nav item: 36px, radius 12, foreground/60, hover fill.
  ghost: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingInline: 8,
    borderRadius: 'var(--wt-r-lg)',
    borderWidth: 0,
    fontSize: 15,
    fontWeight: 500,
    color: 'rgba(26, 26, 26, 0.6)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--wt-fill)' },
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  },
  ghostDesktop: { display: { default: 'none', '@media (min-width: 1024px)': 'flex' } },
  burger: {
    display: { default: 'flex', '@media (min-width: 1024px)': 'none' },
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    marginInlineStart: -4,
    borderWidth: 0,
    borderRadius: 'var(--wt-r-md)',
    color: 'rgba(26, 26, 26, 0.6)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--wt-fill)' },
    cursor: 'pointer',
    flexShrink: 0,
  },

  right: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  // §3.7 — canvas-coloured input on a white bar reads as recessed.
  searchPill: {
    display: { default: 'none', '@media (min-width: 768px)': 'flex' },
    alignItems: 'center',
    gap: 6,
    height: 36,
    width: 260,
    paddingInline: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'var(--wt-line-soft)', ':hover': 'rgba(26,26,26,0.2)' },
    backgroundColor: 'var(--wt-surface)',
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'text',
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
  },
  searchIconBtn: {
    display: { default: 'flex', '@media (min-width: 768px)': 'none' },
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--wt-line-soft)',
    backgroundColor: 'var(--wt-surface)',
    color: 'rgba(26, 26, 26, 0.7)',
    cursor: 'pointer',
  },
  searchLabel: { flex: 1, minWidth: 0, textAlign: 'start', color: 'var(--wt-ink-muted)' },
  kbd: { flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--wt-ink-muted)' },

  body: { display: 'flex', flex: 1, minHeight: 0 },

  aside: {
    width: 'var(--wt-sidebar-w)',
    flexShrink: 0,
    overflowY: 'auto',
    paddingBlock: 16,
    backgroundColor: 'var(--wt-sidebar, #fbfbfa)',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: 'var(--wt-line)',
  },
  asideDesktop: { display: { default: 'none', '@media (min-width: 1024px)': 'block' } },
  asideHiddenDesktop: { display: { default: 'none', '@media (min-width: 1024px)': 'none' } },
  asideMobileOpen: {
    display: 'block',
    position: { default: 'fixed', '@media (min-width: 1024px)': 'static' },
    insetBlock: 0,
    insetInlineStart: 0,
    zIndex: 50,
    width: { default: 280, '@media (min-width: 1024px)': 'var(--wt-sidebar-w)' },
    boxShadow: {
      default: '0 1px 3px 0 rgba(0,0,0,.10), 0 8px 10px -1px rgba(0,0,0,.10)',
      '@media (min-width: 1024px)': 'none',
    },
  },
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 40,
    backgroundColor: 'rgba(26, 26, 26, 0.2)',
    display: { default: 'block', '@media (min-width: 1024px)': 'none' },
  },
  navList: { display: 'flex', flexDirection: 'column', gap: 2, paddingInline: 12 },
  navLabel: {
    paddingInline: 16,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--wt-ink-muted)',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    height: 36,
    paddingInline: 12,
    borderRadius: 'var(--wt-r-lg)',
    fontSize: 13.5,
    textDecoration: 'none',
    color: 'var(--wt-ink-secondary)',
    backgroundColor: { default: 'transparent', ':hover': 'var(--wt-fill)' },
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  },
  navItemActive: {
    backgroundColor: 'var(--wt-brand)',
    color: 'var(--wt-on-brand)',
    fontWeight: 600,
  },

  main: { minWidth: 0, flex: 1, overflowY: 'auto', backgroundColor: 'var(--wt-canvas)' },
})

const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export function AppShell({
  categories,
  activeSlug,
  isHome,
  onSearch,
  children,
}: {
  categories: Category[]
  searchEntries: CatalogSearchEntry[]
  activeSlug: string | null
  isHome: boolean
  onSearch: () => void
  children: React.ReactNode
}) {
  const desktopOpen = useLayoutStore((v) => v.sidebarOpen)
  const mobileOpen = useLayoutStore((v) => v.mobileOpen)
  const setMobile = useLayoutStore((v) => v.setMobile)
  const toggleSidebar = useLayoutStore((v) => v.toggleSidebar)
  const toggleMobile = useLayoutStore((v) => v.toggleMobile)

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.banner)}>
        <div {...stylex.props(s.bannerInner)}>
          <Pill tone="brand">Updated</Pill>
          <span {...stylex.props(s.bannerText)}>
            {/* The demo says "3 entries dropped, 2 added". No diff exists to
                render — we keep no history, because order is re-derived from
                the current sources every run. Marked as a placeholder rather
                than quietly replaced with a claim we cannot back. */}
            <Mockup>Rankings re-derived from source today</Mockup>
          </span>
        </div>
      </div>

      <div {...stylex.props(s.headerWrap)}>
        <header {...stylex.props(s.header)}>
          <div {...stylex.props(s.headerInner)}>
            <div {...stylex.props(s.left)}>
              <button type="button" aria-label="Open tasks" onClick={toggleMobile} {...stylex.props(s.burger)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/" {...stylex.props(s.logoLink)}>
                <span {...stylex.props(s.brandMark)}>W</span>
                <span {...stylex.props(s.wordmark)}>WhichToUse</span>
              </Link>

              <button
                type="button"
                aria-controls={SIDEBAR_ID}
                onClick={toggleSidebar}
                {...stylex.props(s.ghost, s.ghostDesktop)}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                </svg>
                Tasks
              </button>
            </div>

            <div {...stylex.props(s.right)}>
              <button type="button" onClick={onSearch} {...stylex.props(s.searchPill)}>
                <IconSearch />
                <span {...stylex.props(s.searchLabel)}>Search tools and tasks</span>
                <kbd {...stylex.props(s.kbd)}>&#8984;K</kbd>
              </button>
              <button type="button" aria-label="Search" onClick={onSearch} {...stylex.props(s.searchIconBtn)}>
                <IconSearch />
              </button>
            </div>
          </div>
        </header>
      </div>

      {mobileOpen ? <div {...stylex.props(s.scrim)} onClick={() => setMobile(false)} /> : null}

      <div {...stylex.props(s.body)}>
        <aside
          id={SIDEBAR_ID}
          {...stylex.props(
            s.aside,
            mobileOpen ? s.asideMobileOpen : desktopOpen ? s.asideDesktop : s.asideHiddenDesktop,
          )}
        >
          <nav {...stylex.props(s.navList)}>
            <Link to="/" {...stylex.props(s.navItem, isHome && s.navItemActive)}>
              Home
            </Link>
          </nav>
          <div {...stylex.props(s.navLabel)}>Tasks</div>
          <nav {...stylex.props(s.navList)}>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/c/$slug"
                params={{ slug: c.slug }}
                {...stylex.props(s.navItem, c.slug === activeSlug && s.navItemActive)}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main {...stylex.props(s.main)}>{children}</main>
      </div>
    </div>
  )
}
