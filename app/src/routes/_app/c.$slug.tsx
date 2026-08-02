import { createFileRoute, notFound } from '@tanstack/react-router'

import { getCategoryView } from '~/lib/catalog'
import { CategoryPage } from '~/components/category-page'
import { buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/_app/c/$slug')({
  component: CategoryRoute,
  loader: async ({ params }) => {
    const view = await getCategoryView({ data: params.slug })
    if (!view) throw notFound()
    return { view }
  },
  head: ({ loaderData }) => {
    const name = loaderData?.view.category.name ?? 'AI tools'
    const slug = loaderData?.view.category.slug ?? ''
    return buildPageMeta({
      title: `Best ${name} AI Tools & Skills, Ranked — WhichToUse`,
      description: `SaaS, open source and agent skills for ${name.toLowerCase()} — side by side, with the limits of each written down and the sources behind every pick.`,
      path: `/c/${slug}`,
    })
  },
})

function CategoryRoute() {
  const { view } = Route.useLoaderData()
  return <CategoryPage view={view} />
}
