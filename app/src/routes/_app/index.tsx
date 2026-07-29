import { createFileRoute } from '@tanstack/react-router'

import { HomeView } from '~/components/home-view'
import { getCategories } from '~/lib/catalog'
import { getTrendingRepositories } from '~/lib/github-trending'
import { buildPageMeta, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '~/lib/seo'

export const Route = createFileRoute('/_app/')({
  component: Home,
  loader: async () => {
    const [trending, categories] = await Promise.all([
      getTrendingRepositories(),
      getCategories(),
    ])
    return { trending, categoryCount: categories.length }
  },
  head: () =>
    buildPageMeta({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: '/',
    }),
})

function Home() {
  const { trending, categoryCount } = Route.useLoaderData()
  return <HomeView trending={trending} categoryCount={categoryCount} />
}
