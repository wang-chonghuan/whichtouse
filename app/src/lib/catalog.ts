// Catalog content layer. Source of truth is Postgres (`whichtouse-schema`),
// seeded from scripts/import-content.mjs and re-ranked daily by the refresh job.
// See specs/content-in-db.md.
//
// Previously this file bundled src/content/c/*.json at build time via
// import.meta.glob, which meant content could not change without a redeploy.
// Those files remain in git as the seed of record.

import { createServerFn } from '@tanstack/react-start'

import type {
  CatalogSnapshot,
  Category,
  CategoryView,
  CatalogSearchEntry,
} from './catalog-types'

export type {
  CatalogSearchEntry,
  Category,
  CategoryView,
  Confidence,
  FormFactor,
  ItemKind,
  MoneyTier,
  RankItem,
  Source,
  Track,
  WatchlistEntry,
} from './catalog-types'

const SNAPSHOT_TTL_MS = 5 * 60 * 1000

let snapshot: CatalogSnapshot | null = null
let inflight: Promise<CatalogSnapshot> | null = null

const EMPTY: CatalogSnapshot = {
  categories: [],
  views: {},
  searchEntries: [],
  loadedAt: 0,
}

/** Read-through cache. On a database error we keep serving the last good
 * snapshot: the content changes once a day, so stale is strictly better than a
 * blank site. Only a cold process with an unreachable database renders empty. */
async function getSnapshot(): Promise<CatalogSnapshot> {
  if (snapshot && Date.now() - snapshot.loadedAt < SNAPSHOT_TTL_MS) return snapshot
  if (inflight) return inflight

  inflight = (async () => {
    try {
      const { loadSnapshot } = await import('./catalog-db')
      snapshot = await loadSnapshot()
      return snapshot
    } catch (error) {
      console.error('[catalog] snapshot load failed', error)
      return snapshot ?? EMPTY
    } finally {
      inflight = null
    }
  })()

  return inflight
}

export const getCategories = createServerFn().handler(
  async (): Promise<Category[]> => (await getSnapshot()).categories,
)

export const getCatalogSearchEntries = createServerFn().handler(
  async (): Promise<CatalogSearchEntry[]> => (await getSnapshot()).searchEntries,
)

export const getCategoryView = createServerFn({ method: 'GET' })
  .validator((slug: unknown): string => {
    if (typeof slug !== 'string' || !slug) throw new Error('slug required')
    return slug
  })
  .handler(async ({ data }): Promise<CategoryView | null> => {
    return (await getSnapshot()).views[data] ?? null
  })

/** Both shell-level reads in one round trip — the app shell needs them together
 * on every navigation, and they come from the same snapshot anyway. */
export const getShellData = createServerFn().handler(
  async (): Promise<{ categories: Category[]; searchEntries: CatalogSearchEntry[] }> => {
    const s = await getSnapshot()
    return { categories: s.categories, searchEntries: s.searchEntries }
  },
)

/** The default category shown at the site root. */
export const DEFAULT_SLUG = 'coding'
