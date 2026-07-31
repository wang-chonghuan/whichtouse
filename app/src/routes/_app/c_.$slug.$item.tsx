import { createFileRoute, notFound } from '@tanstack/react-router'

import { getCategoryView } from '~/lib/catalog'
import { ProductView } from '~/components/product-view'
import { buildPageMeta } from '~/lib/seo'
import type { Track } from '~/lib/catalog'

const TRACKS: Track[] = ['app', 'oss', 'skill']

export const Route = createFileRoute('/_app/c_/$slug/$item')({
  component: ProductPage,
  loader: async ({ params }) => {
    const view = await getCategoryView({ data: params.slug })
    if (!view) throw notFound()

    // A listing is identified by tool_slug within its category; the track is
    // whichever column holds it.
    for (const track of TRACKS) {
      const item = view.tracks[track].find((x) => x.id === params.item)
      if (item) return { view, item, track, siblings: view.tracks[track] }
    }
    throw notFound()
  },
  head: ({ loaderData }) => {
    const name = loaderData?.item.name ?? 'Tool'
    const cat = loaderData?.view.category.name ?? ''
    return buildPageMeta({
      title: `${name} — ${cat} — WhichToUse`,
      description:
        loaderData?.item.bestFor ||
        `Where ${name} sits in our ${cat.toLowerCase()} ranking, and why.`,
      path: `/c/${loaderData?.view.category.slug ?? ''}/${loaderData?.item.id ?? ''}`,
    })
  },
})

function ProductPage() {
  const { view, item, track, siblings } = Route.useLoaderData()
  return (
    <ProductView item={item} category={view.category} siblings={siblings} track={track} />
  )
}
