// Review page for a GitHub Trending repository.
//
// Trending rows are scraped live and are not catalog listings, so they have no
// /c/<task>/<tool> address. They still get a real review page: the same layout
// as a catalog entry, built on demand from the repository's README, metadata
// and most-discussed issues.

import { createFileRoute, notFound } from '@tanstack/react-router'

import { ProductView } from '~/components/product-view'
import { getTrendingRepositories, getTrendingRepositoryDetail } from '~/lib/github-trending'
import { buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/_app/t/$owner/$repo')({
  component: TrendingDetailPage,
  loader: async ({ params }) => {
    const full = `${params.owner}/${params.repo}`
    const trending = await getTrendingRepositories()
    const repository = trending.repositories.find((r) => r.name === full)
    // Only repos currently on the board can be reviewed this way; anything else
    // would be researching an arbitrary URL on request.
    if (!repository) throw notFound()

    const item = await getTrendingRepositoryDetail({ data: repository })
    return { item, repository }
  },
  head: ({ loaderData }) => {
    const name = loaderData?.item.name ?? 'Repository'
    return buildPageMeta({
      title: `${name} — trending on GitHub — WhichToUse`,
      description:
        loaderData?.item.bestFor || `What ${name} does, and what it costs you to adopt it.`,
      path: `/t/${name}`,
    })
  },
})

function TrendingDetailPage() {
  const { item, repository } = Route.useLoaderData()
  return (
    <ProductView
      item={item}
      category={{
        slug: '',
        name: `Trending · ${repository.category}`,
        moneyTier: 'green',
        sort: 0,
        ready: true,
      }}
      siblings={[]}
      track="oss"
      backTo="/"
    />
  )
}
