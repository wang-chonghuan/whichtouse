import { classifyTrendingRepository } from './github-trending-enrichment'

export type TrendingRepository = {
  rank: number
  name: string
  url: string
  description: string
  language: string | null
  stars: string
  starsToday: string
  category: string
}

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseTrendingRepositories(html: string): TrendingRepository[] {
  const articles = html.split('<article class="Box-row">').slice(1)
  const repositories: TrendingRepository[] = []

  for (const article of articles) {
    const path = article.match(
      /<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"]+\/[^"]+)"[^>]*class="Link"[\s\S]*?<\/a>[\s\S]*?<\/h2>/,
    )?.[1]
    if (!path) continue

    const description = article.match(/<p class="col-9[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? ''
    const language = article.match(/itemprop="programmingLanguage">([^<]+)</)?.[1] ?? null
    const stars = article.match(/href="\/[^"]+\/stargazers"[\s\S]*?<\/svg>\s*([\d,]+)/)?.[1] ?? '—'
    const starsToday = article.match(/([\d,]+)\s+stars today/)?.[1] ?? '—'

    const repository = {
      rank: repositories.length + 1,
      name: decodeHtml(path),
      url: `https://github.com/${path}`,
      description: decodeHtml(description) || 'No description provided.',
      language: language ? decodeHtml(language) : null,
      stars,
      starsToday,
    }

    repositories.push({
      ...repository,
      category: classifyTrendingRepository(repository),
    })
  }

  return repositories
}
