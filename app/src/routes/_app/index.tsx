import { createFileRoute, Link } from '@tanstack/react-router'

import { getCategories } from '~/lib/catalog'

export const Route = createFileRoute('/_app/')({
  component: Home,
  loader: async () => ({ categories: await getCategories() }),
})

// Home = the category list itself (no landing page). One click into a category.
function Home() {
  const { categories } = Route.useLoaderData()
  return (
    <main className="wt-wrap">
      <header className="wt-head">
        <h1 className="wt-logo">WhichToUse</h1>
        <p className="wt-tag">The honest ranking of AI agents, by what you&rsquo;re doing.</p>
      </header>
      <nav className="wt-cats">
        {categories.map((c) => (
          <Link key={c.slug} to="/c/$slug" params={{ slug: c.slug }} className="wt-cat">
            <span className="wt-cat-name">{c.name}</span>
            <span className="wt-cat-arrow">&rarr;</span>
          </Link>
        ))}
      </nav>
      <p className="wt-note">
        📋 provisional — ranked by public signals (GitHub stars / directory upvotes), not yet hands-on tested.
      </p>
    </main>
  )
}
