import { createRouter } from '@tanstack/react-router'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Link } from '@astryxdesign/core/Link'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
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
