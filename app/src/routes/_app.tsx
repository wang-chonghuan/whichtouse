import { useEffect, useState } from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { getShellData } from '~/lib/catalog'
import { useLayoutStore } from '~/lib/layout-store'
import { AppShell as Shell } from '~/components/app-shell'
import { SearchOverlay } from '~/components/search-overlay'

// App shell: announcement banner + sticky header + task sidebar + main area.
// Chrome lives in components/app-shell.tsx, ported class-for-class from
// proto/shared.js — see the note at the top of that file.
export const Route = createFileRoute('/_app')({
  component: AppShell,
  loader: async () => await getShellData(),
})

function AppShell() {
  const { categories, searchEntries } = Route.useLoaderData()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const setMobile = useLayoutStore((state) => state.setMobile)
  const [searchOpen, setSearchOpen] = useState(false)

  // Dismiss the mobile panel once a destination is picked; the desktop column
  // keeps whatever the reader chose.
  useEffect(() => setMobile(false), [pathname, setMobile])

  // ⌘K / Ctrl-K, matching the hint rendered in the header pill.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const slug = pathname.startsWith('/c/') ? pathname.slice(3).split('/')[0] : null

  return (
    <Shell
      categories={categories}
      searchEntries={searchEntries}
      activeSlug={slug}
      isHome={pathname === '/'}
      onSearch={() => setSearchOpen(true)}
    >
      <Outlet />
      {searchOpen ? (
        <SearchOverlay entries={searchEntries} onClose={() => setSearchOpen(false)} />
      ) : null}
    </Shell>
  )
}
