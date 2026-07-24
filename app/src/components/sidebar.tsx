import { Link, useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { Home } from 'lucide-react'

import type { Category } from '~/lib/catalog'
import { categoryIcon } from '~/lib/category-icons'
import { useLayoutStore } from '~/lib/layout-store'

const MOBILE = '@media (max-width: 900px)'

/** Referenced by the toggles' aria-controls. */
export const SIDEBAR_ID = 'use-case-sidebar'

const s = stylex.create({
  aside: {
    width: 232,
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    paddingBlock: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%',
  },
  desktopHidden: { '@media (min-width: 901px)': { display: 'none' } },
  // Below the breakpoint there is no room for a second column, so the same
  // sidebar is lifted out of the flow as a fixed panel instead.
  mobilePanel: {
    [MOBILE]: {
      position: 'fixed',
      top: 60,
      left: 0,
      bottom: 0,
      height: 'auto',
      width: 'min(320px, 86vw)',
      zIndex: 115,
      boxShadow: 'var(--shadow-high)',
      backgroundColor: 'var(--color-background-surface)',
    },
  },
  mobileClosed: { [MOBILE]: { display: 'none' } },
  scrim: {
    display: 'none',
    [MOBILE]: {
      display: 'block',
      position: 'fixed',
      top: 60,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(20,24,31,0.34)',
      zIndex: 110,
    },
  },
  list: { display: 'flex', flexDirection: 'column', gap: 1 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: { default: 'var(--spacing-2)', [MOBILE]: 'var(--spacing-3)' },
    marginInline: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element)',
    fontSize: 13.5,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    backgroundColor: { default: 'transparent', ':hover': 'var(--color-overlay-hover)' },
  },
  active: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-text-accent)',
    fontWeight: 600,
  },
  icon: { display: 'flex', flexShrink: 0, opacity: 0.85 },
  divider: {
    height: 1,
    marginBlock: 'var(--spacing-2)',
    marginInline: 'var(--spacing-4)',
    backgroundColor: 'var(--color-border)',
  },
})

function usePathname(): string {
  return useRouterState({ select: (st) => st.location.pathname })
}

export function Sidebar({
  categories,
  desktopOpen,
  mobileOpen,
}: {
  categories: Category[]
  /** desktop: is the layout column showing */
  desktopOpen: boolean
  /** mobile: is the fixed panel showing */
  mobileOpen: boolean
}) {
  const pathname = usePathname()
  const active = pathname.match(/^\/c\/([^/]+)/)?.[1] ?? null
  const setMobile = useLayoutStore((state) => state.setMobile)

  return (
    <>
      {mobileOpen && <div {...stylex.props(s.scrim)} onClick={() => setMobile(false)} />}
      <aside
        id={SIDEBAR_ID}
        {...stylex.props(
          s.aside,
          s.mobilePanel,
          !desktopOpen && s.desktopHidden,
          !mobileOpen && s.mobileClosed,
        )}
        aria-label="Use cases"
      >
        <nav {...stylex.props(s.list)}>
          <Link to="/" {...stylex.props(s.item, pathname === '/' && s.active)}>
            <span {...stylex.props(s.icon)}>
              <Home size={16} />
            </span>
            Home
          </Link>
          <div {...stylex.props(s.divider)} />
          {categories.map((c) => {
            const Icon = categoryIcon(c.slug)
            const isActive = c.slug === active
            return (
              <Link
                key={c.slug}
                to="/c/$slug"
                params={{ slug: c.slug }}
                {...stylex.props(s.item, isActive && s.active)}
              >
                <span {...stylex.props(s.icon)}>
                  <Icon size={16} />
                </span>
                {c.name}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
