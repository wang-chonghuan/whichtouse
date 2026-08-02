import { createRouter } from '@tanstack/react-router'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Link } from '@astryxdesign/core/Link'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    // Off deliberately. It manages window scroll, and AppShell height="fill"
    // puts the scrollbar on an inner container, so window.scrollY is always 0
    // and there is nothing for it to restore. Left on, it also wrote a stale
    // offset back onto the inner container after every navigation — opening a
    // listing from halfway down a task page landed halfway down the listing.
    // AppFrame resets that container on each navigation instead.
    scrollRestoration: false,
    defaultNotFoundComponent: () => (
      <EmptyState
        headingLevel={1}
        title="No such page"
        description="The task or tool you asked for is not in the catalog."
        actions={<Link href="/">Back to the task list</Link>}
      />
    ),
  })
}
