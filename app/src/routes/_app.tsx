import { useEffect } from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'

import { getCatalogSearchEntries, getCategories } from '~/lib/catalog'
import { useLayoutStore } from '~/lib/layout-store'
import { NavBar } from '~/components/nav-bar'
import { Sidebar } from '~/components/sidebar'

// App shell: top nav + use-case sidebar column + main area (Outlet).
//
// The sidebar is a layout column, open by default on desktop; the hero button
// on Home collapses/expands it. Below 900px the same sidebar becomes a fixed
// panel, closed by default and toggled from the nav bar or the hero button.
export const Route = createFileRoute('/_app')({
  component: AppShell,
  loader: () => ({
    categories: getCategories(),
    searchEntries: getCatalogSearchEntries(),
  }),
})

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    // 100dvh tracks the *visible* viewport, so the mobile URL bar collapsing
    // can't push the document taller than the screen and scroll the nav bar
    // out of view. 100vh stays as the fallback for older browsers.
    height: stylex.firstThatWorks('100dvh', '100vh'),
    overflow: 'hidden',
  },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  content: { flex: 1, minWidth: 0, height: '100%' },
})

function AppShell() {
  const { categories, searchEntries } = Route.useLoaderData()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen)
  const mobileOpen = useLayoutStore((state) => state.mobileOpen)
  const setMobile = useLayoutStore((state) => state.setMobile)

  // Dismiss the mobile panel once a destination is picked; the desktop column
  // keeps whatever the reader chose.
  useEffect(() => setMobile(false), [pathname, setMobile])

  return (
    <div {...stylex.props(s.root)}>
      <NavBar entries={searchEntries} />
      <div {...stylex.props(s.body)}>
        <Sidebar categories={categories} desktopOpen={sidebarOpen} mobileOpen={mobileOpen} />
        <main {...stylex.props(s.content)}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
