import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '~/components/home-page'
import { getCategories, getHomeFeatured } from '~/lib/catalog'
import { getTrendingRepositories } from '~/lib/github-trending'
import { buildPageMeta, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '~/lib/seo'

export const Route = createFileRoute('/_app/')({
  component: Home,
  loader: async () => {
    const [trending, categories, featured] = await Promise.all([
      getTrendingRepositories(),
      getCategories(),
      getHomeFeatured(),
    ])
    return { trending, categories, featured }
  },
  head: () =>
    buildPageMeta({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: '/',
    }),
})

function Home() {
  const { trending, categories, featured } = Route.useLoaderData()
  return <HomePage trending={trending} categories={categories} featured={featured} />
}
