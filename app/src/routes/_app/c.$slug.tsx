import { createFileRoute, notFound } from '@tanstack/react-router'

import { getCategoryView } from '~/lib/catalog'
import { RankingView } from '~/components/ranking-view'

export const Route = createFileRoute('/_app/c/$slug')({
  component: CategoryPage,
  loader: ({ params }) => {
    const view = getCategoryView(params.slug)
    if (!view) throw notFound()
    return { view }
  },
})

function CategoryPage() {
  const { view } = Route.useLoaderData()
  return <RankingView view={view} />
}
