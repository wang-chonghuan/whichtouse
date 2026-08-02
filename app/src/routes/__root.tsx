import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Theme } from '@astryxdesign/core/theme'

import '~/styles/app.css'
import { neutralTheme } from '~/theme/neutralTheme'
import { RouterLinkProvider } from '~/components/router-link'
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
      { name: 'theme-color', content: '#fafafa' },
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
        {/* Dev only: StyleX's atomic CSS. The unplugin normally delivers it by
         * rewriting index.html (transformIndexHtml), but TanStack Start renders
         * the document from this component and never serves an index.html, so
         * that hook never fires and every StyleX class comes up unstyled in
         * `vite dev`. This is the runtime module the plugin would have injected:
         * it fetches /virtual:stylex.css into a <style> and re-fetches on
         * `stylex:css-update`, which matters because dev CSS grows lazily as
         * each route is compiled. Production is unaffected — there the plugin
         * appends the CSS to a real asset in generateBundle. */}
        {import.meta.env.DEV ? (
          <script type="module" src="/@id/virtual:stylex:runtime" />
        ) : null}
      </head>
      <body>
        {/* mode="light" rather than "system": every colour decision in
         * neutralTheme has a dark counterpart, but nothing in the product has
         * been read in dark mode yet, so following the OS would ship an
         * unreviewed skin. Flip this to "system" once dark has been looked at. */}
        <Theme theme={neutralTheme} mode="light">
          <RouterLinkProvider>{children}</RouterLinkProvider>
        </Theme>
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
