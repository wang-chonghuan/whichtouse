import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Theme } from '@astryxdesign/core'
import { butterTheme } from '@astryxdesign/theme-butter'

import '~/styles/app.css'
import {
  CF_BEACON_TOKEN,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_NAME,
} from '~/lib/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      // Fallback title/description — leaf routes override these by key.
      { title: DEFAULT_TITLE },
      { name: 'description', content: DEFAULT_DESCRIPTION },
      // Constant, site-wide social tags (variable ones live in each leaf route).
      { name: 'theme-color', content: '#2563eb' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Theme theme={butterTheme}>{children}</Theme>
        {/* Cloudflare Web Analytics — manual beacon. The apex stays grey-cloud
         * (DNS only) so the Azure managed certificate keeps renewing, which
         * means Cloudflare's proxy never sees a request and cannot auto-inject
         * this. Deferred, cookie-free, and carries no personal data, so it adds
         * no consent obligation. The token is a public site identifier. */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
        />
        <Scripts />
      </body>
    </html>
  )
}
