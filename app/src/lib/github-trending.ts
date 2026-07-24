import { createServerFn } from '@tanstack/react-start'

import {
  buildTrendingDetailItem,
  type GitHubIssueSignal,
  type GitHubRepositoryMetadata,
} from './github-trending-enrichment'
import {
  parseTrendingRepositories,
  type TrendingRepository,
} from './github-trending-parser'
import type { DetailPanelItem } from '~/components/product-detail-panel'

export type { TrendingRepository } from './github-trending-parser'

export type TrendingRepositoriesResult = {
  repositories: TrendingRepository[]
  error: string | null
  fetchedAt: string
}

let cachedResult: TrendingRepositoriesResult | null = null
let cachedAt = 0
const detailCache = new Map<string, { item: DetailPanelItem; cachedAt: number }>()
const pendingDetails = new Map<string, Promise<DetailPanelItem>>()

const TRENDING_CACHE_MS = 15 * 60 * 1000
const DETAIL_CACHE_MS = 12 * 60 * 60 * 1000

function githubHeaders(accept = 'application/vnd.github+json'): HeadersInit {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  return {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'WhichToUse/1.0',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function githubJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: githubHeaders(),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function githubReadme(fullName: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
      headers: githubHeaders('application/vnd.github.raw+json'),
      signal: AbortSignal.timeout(8000),
    })
    return response.ok ? await response.text() : ''
  } catch {
    return ''
  }
}

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

async function researchTrendingRepository(repository: TrendingRepository): Promise<DetailPanelItem> {
  const cached = detailCache.get(repository.name)
  if (cached && Date.now() - cached.cachedAt < DETAIL_CACHE_MS) return cached.item

  const pending = pendingDetails.get(repository.name)
  if (pending) return pending

  const request = (async () => {
    const encodedName = repository.name
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')
    const [metadata, readme, issueResponse] = await Promise.all([
      githubJson<GitHubRepositoryMetadata>(`/repos/${encodedName}`),
      githubReadme(encodedName),
      githubJson<GitHubIssueSignal[]>(
        `/repos/${encodedName}/issues?state=open&sort=comments&direction=desc&per_page=6`,
      ),
    ])
    const item = buildTrendingDetailItem({
      repository,
      metadata,
      readme,
      issues: Array.isArray(issueResponse) ? issueResponse : [],
    })
    detailCache.set(repository.name, { item, cachedAt: Date.now() })
    return item
  })()

  pendingDetails.set(repository.name, request)
  try {
    return await request
  } finally {
    pendingDetails.delete(repository.name)
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

export const getTrendingRepositoryDetail = createServerFn({ method: 'GET' })
  .validator(validateTrendingRepository)
  .handler(async ({ data }): Promise<DetailPanelItem> => researchTrendingRepository(data))
