import { createServerFn } from '@tanstack/react-start'

import {
  parseTrendingRepositories,
  type TrendingRepository,
} from './github-trending-parser'

export type { TrendingRepository } from './github-trending-parser'

export type TrendingRepositoriesResult = {
  repositories: TrendingRepository[]
  error: string | null
  fetchedAt: string
}

let cachedResult: TrendingRepositoriesResult | null = null
let cachedAt = 0

const TRENDING_CACHE_MS = 15 * 60 * 1000




function validateTrendingRepository(input: unknown): TrendingRepository {
  if (!input || typeof input !== 'object') throw new Error('Invalid repository')
  const value = input as Partial<TrendingRepository>
  if (
    typeof value.name !== 'string' ||
    !/^[\w.-]+\/[\w.-]+$/.test(value.name) ||
    typeof value.rank !== 'number' ||
    value.rank < 1 ||
    typeof value.description !== 'string' ||
    typeof value.stars !== 'string' ||
    typeof value.starsToday !== 'string'
  ) {
    throw new Error('Invalid repository')
  }

  const language = typeof value.language === 'string' ? value.language.slice(0, 80) : null
  return {
    rank: Math.floor(value.rank),
    name: value.name,
    url: `https://github.com/${value.name}`,
    description: value.description.slice(0, 1000),
    language,
    stars: value.stars.slice(0, 32),
    starsToday: value.starsToday.slice(0, 32),
    category: typeof value.category === 'string' ? value.category.slice(0, 80) : 'Coding',
  }
}


export const getTrendingRepositories = createServerFn().handler(
  async (): Promise<TrendingRepositoriesResult> => {
    if (cachedResult && Date.now() - cachedAt < TRENDING_CACHE_MS) return cachedResult

    try {
      const response = await fetch('https://github.com/trending', {
        headers: {
          Accept: 'text/html',
          'User-Agent': 'WhichToUse/1.0',
        },
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`)

      const repositories = parseTrendingRepositories(await response.text())
      if (!repositories.length) throw new Error('No repositories found')

      cachedResult = {
        repositories,
        error: null,
        fetchedAt: new Date().toISOString(),
      }
      cachedAt = Date.now()
      return cachedResult
    } catch {
      return {
        repositories: [],
        error: 'GitHub Trending is temporarily unavailable.',
        fetchedAt: new Date().toISOString(),
      }
    }
  },
)

