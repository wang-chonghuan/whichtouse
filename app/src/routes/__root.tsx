import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Theme } from '@astryxdesign/core/theme'

import '~/styles/app.css'
import { wtuTheme } from '~/theme/wtuTheme'
import brand from '~/theme/brand.json'
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
      // Matches --color-background-body in the active theme, so the browser
      // chrome on mobile is continuous with the page rather than a seam.
      { name: 'theme-color', content: brand.backgroundBody },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
    // Every one of these is generated from resources/reference/wtu-logo.png by
    // scripts/gen-icons.mjs — never edit a file in public/ by hand, or the next
    // run of that script will silently undo it.
    links: [
      // .ico first and unsized: it is what a bare /favicon.ico request and old
      // Windows surfaces get, and it carries 16/32/48 in one file.
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      // iOS ignores sizes and takes this one; it must be opaque, which it is.
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      // The webfont the active theme asks for. It lives in brand.json rather
      // than in app.css because a stylesheet cannot read the theme, and a font
      // that silently disagrees with the theme's `family` is the first thing to
      // rot after a theme swap.
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: brand.fontStylesheet },
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
        {/* The one line that picks the product's entire look. Swapping themes
         * is this import plus src/theme/brand.json — every component reads
         * semantic tokens, so nothing else carries a colour.
         *
         * mode="light" rather than "system": the theme has a full dark
         * counterpart, but nothing in the product has been read in dark mode
         * yet, so following the OS would ship an unreviewed skin. */}
        <Theme theme={wtuTheme} mode="light">
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
