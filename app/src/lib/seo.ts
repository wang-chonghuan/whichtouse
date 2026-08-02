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
// The search-result snippet. It makes the home page's promise, in the home
// page's words — see the vocabulary block at the top of components/home-page.tsx.
//
// The title above is deliberately not the headline. A headline speaks to
// someone already here; a title has to be findable, and nobody searches "pick
// the wrong AI tool". "Find the best AI tool for the job" is what they type.
export const DEFAULT_DESCRIPTION =
  'How to choose in each of 25 areas — what actually decides the pick, what to avoid, what is changing. Then SaaS, open source and agent skills side by side, limits checked by hand.'

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
