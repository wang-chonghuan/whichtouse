// Per-page SEO/meta builder. Constant, site-wide tags (og:image, og:type,
// twitter:card, site_name) live once in the root route; each leaf route calls
// buildPageMeta() for the page-specific title/description/canonical + the
// variable OpenGraph/Twitter fields. Keeping the variable tags out of the root
// avoids duplicate <meta> entries after TanStack's head merge.

/** Cloudflare Web Analytics site identifier. Public by design — it only names
 * which site a page view belongs to and grants no account access. */
export const CF_BEACON_TOKEN = '7b865c217db54a438ad2f5d118483264'

export const SITE_NAME = 'WhichToUse'
export const SITE_URL = 'https://whichtouse.com'
export const OG_IMAGE = `${SITE_URL}/og.png`
export const DEFAULT_TITLE =
  'WhichToUse — find the best AI tool for the job, limits first'
// The search-result snippet, so it has to say what the home page says, in the
// same words. See the vocabulary block at the top of components/home-page.tsx —
// "the job" is the reader's side, "area" is one of the 25.
export const DEFAULT_DESCRIPTION =
  'SaaS, open source and agent skills across 25 areas of work, side by side. Leading and emerging picks in each, with what every tool is bad at written down and checked by hand.'

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
