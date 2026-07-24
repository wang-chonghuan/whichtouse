import { describe, expect, it } from 'vitest'

import { parseTrendingRepositories } from './github-trending-parser'

describe('parseTrendingRepositories', () => {
  it('extracts every repository from GitHub Trending markup', () => {
    const article = (index: number) => `
      <article class="Box-row">
        <h2 class="h3">
          <a href="/openai/example-${index}" class="Link">
            <span>openai /</span> example-${index}
          </a>
        </h2>
        <p class="col-9 color-fg-muted">Browser automation toolkit ${index}.</p>
        <span itemprop="programmingLanguage">TypeScript</span>
        <a href="/openai/example-${index}/stargazers"><svg></svg> 12,34${index}</a>
        <span>67${index} stars today</span>
      </article>
    `
    const html = Array.from({ length: 6 }, (_, index) => article(index + 1)).join('')

    const repositories = parseTrendingRepositories(html)
    expect(repositories).toHaveLength(6)
    expect(repositories[0]).toEqual({
      rank: 1,
      name: 'openai/example-1',
      url: 'https://github.com/openai/example-1',
      description: 'Browser automation toolkit 1.',
      language: 'TypeScript',
      stars: '12,341',
      starsToday: '671',
      category: 'Browser Automation',
    })
    expect(repositories[5].rank).toBe(6)
  })
})
