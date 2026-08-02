import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { getShellData } from '~/lib/catalog'
import { AppFrame } from '~/components/app-frame'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  loader: async () => await getShellData(),
})

function AppLayout() {
  const { categories, searchEntries } = Route.useLoaderData()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const activeSlug = pathname.startsWith('/c/') ? pathname.slice(3).split('/')[0] : null

  return (
    <AppFrame
      categories={categories}
      searchEntries={searchEntries}
      activeSlug={activeSlug}
      isHome={pathname === '/'}>
      <Outlet />
    </AppFrame>
  )
}
