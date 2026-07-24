import { createFileRoute } from '@tanstack/react-router'

import { HomeView } from '~/components/home-view'
import { getTrendingRepositories } from '~/lib/github-trending'

export const Route = createFileRoute('/_app/')({
  component: Home,
  loader: async () => ({ trending: await getTrendingRepositories() }),
})

function Home() {
  const { trending } = Route.useLoaderData()
  return <HomeView trending={trending} />
}
