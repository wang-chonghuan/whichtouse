import { createFileRoute, notFound } from '@tanstack/react-router'

import { DEFAULT_SLUG, getCategoryView } from '~/lib/catalog'
import { RankingView } from '~/components/ranking-view'

export const Route = createFileRoute('/_app/')({
  component: Home,
  loader: () => {
    const view = getCategoryView(DEFAULT_SLUG)
    if (!view) throw notFound()
    return { view }
  },
})

function Home() {
  const { view } = Route.useLoaderData()
  return <RankingView view={view} />
}
