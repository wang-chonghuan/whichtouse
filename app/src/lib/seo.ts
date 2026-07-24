// Per-page SEO/meta builder. Constant, site-wide tags (og:image, og:type,
// twitter:card, site_name) live once in the root route; each leaf route calls
// buildPageMeta() for the page-specific title/description/canonical + the
// variable OpenGraph/Twitter fields. Keeping the variable tags out of the root
// avoids duplicate <meta> entries after TanStack's head merge.

export const SITE_NAME = 'WhichToUse'
export const SITE_URL = 'https://whichtouse.com'
export const OG_IMAGE = `${SITE_URL}/og.png`
export const DEFAULT_TITLE = 'WhichToUse — Hands-on AI tool reviews and rankings'
export const DEFAULT_DESCRIPTION =
  'We open each AI tool, read its documentation, and try it wherever we can — then rank apps and open-source skills across 25 real use cases, with the reasoning and sources behind every pick.'

type MetaTag = Record<string, string>

export function buildPageMeta({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): { meta: MetaTag[]; links: MetaTag[] } {
  const url = `${SITE_URL}${path}`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
