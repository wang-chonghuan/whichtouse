import { createFileRoute, Outlet } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'

import { getCategories } from '~/lib/catalog'
import { NavBar } from '~/components/nav-bar'
import { Sidebar } from '~/components/sidebar'

// App shell: top nav + left use-case sidebar + main ranking area (Outlet).
export const Route = createFileRoute('/_app')({
  component: AppShell,
  loader: () => ({ categories: getCategories() }),
})

const s = stylex.create({
  root: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  content: { flex: 1, minWidth: 0, height: '100%' },
})

function AppShell() {
  const { categories } = Route.useLoaderData()
  return (
    <div {...stylex.props(s.root)}>
      <NavBar />
      <div {...stylex.props(s.body)}>
        <Sidebar categories={categories} />
        <main {...stylex.props(s.content)}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
