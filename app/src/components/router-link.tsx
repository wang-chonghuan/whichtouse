import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react'
import { Link } from '@tanstack/react-router'
import { LinkProvider } from '@astryxdesign/core/Link'

// Astryx components navigate through whatever LinkProvider hands them, so this
// is the one place the design system meets the router. Without it every
// SideNavItem/ListItem/Breadcrumb href would be a plain <a> and each click
// would be a full document load — the shell, the theme and the catalog
// snapshot all re-fetched to move between two pages of the same site.

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLAnchorElement>
}

/** Anything the router cannot own: other origins, mail/tel, bare fragments. */
function isExternal(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)
}

function RouterLink({ href, ref, ...rest }: AnchorProps) {
  if (!href || isExternal(href)) return <a ref={ref} href={href} {...rest} />
  // `to` is typed against the generated route tree; these hrefs are built from
  // database slugs, which the type system cannot know about.
  return <Link ref={ref} to={href as never} {...rest} />
}

export function RouterLinkProvider({ children }: { children: ReactNode }) {
  return <LinkProvider component={RouterLink}>{children}</LinkProvider>
}
