// Static content layer for the ranking site. Source of truth is version-controlled
// JSON under src/content (categories.json + c/<slug>.json), authored from consensus
// research. No database: the catalog is read-only, periodically-refreshed content, so
// git IS the store. (The Postgres client in lib/db.ts is kept but no longer used.)

import categoriesJson from '~/content/categories.json'

export type FormFactor = 'app' | 'skill'
export type MoneyTier = 'green' | 'yellow' | 'red'
export type Confidence = 'high' | 'medium' | 'low'

export type Source = { name: string; url: string }

/** Non-app track item kind. Agent Skills (SKILL.md packages) are preferred; a
 * notable open-source repo fills in where no established skill exists yet. MCP
 * servers are intentionally excluded. */
export type ItemKind = 'skill' | 'repo'

export type RankItem = {
  rank: number
  name: string
  homepage: string | null
  pricing: string | null
  bestFor: string
  confidence: Confidence
  /** testing depth: 📋 provisional (consensus only) · 🆓 free-tier tested · 🧪 sandbox tested */
  badge: string
  sources: Source[]
  /** only on the skill/repo track: whether this is a genuine Agent Skill or a repo */
  kind?: ItemKind

  // --- richer detail fields (optional; shown in the detail panel) ---
  /** concrete reason it ranks here (avg rank across roundups / stars / buzz) */
  rankBasis?: string
  /** free plan in concrete terms, or null if none */
  pricingFree?: string | null
  /** most basic/common paid plan + what it includes, or null if fully free */
  pricingPaid?: string | null
  /** 2–4 main features */
  features?: string[]
  /** competitive strengths, from aggregated reviews/community (not hands-on) */
  pros?: string[]
  /** real shortcomings, from aggregated reviews/community (not hands-on) */
  cons?: string[]
}

export type Category = {
  slug: string
  name: string
  moneyTier: MoneyTier
  sort: number
  /** whether authored ranking content exists yet */
  ready: boolean
}

type CategoryContent = {
  slug: string
  updated: string
  tracks: { app: RankItem[]; skill: RankItem[] }
  notes?: string
}

export type CategoryView = {
  category: Category
  updated: string
  tracks: { app: RankItem[]; skill: RankItem[] }
  notes: string | null
}

type RawCategory = Omit<Category, 'ready'>

// Eagerly bundle every authored category file at build time.
// NOTE: import.meta.glob does not resolve the `~` alias — the pattern must be
// a relative/absolute literal. This file is src/lib, content is src/content.
const contentModules = import.meta.glob<{ default: CategoryContent }>(
  '../content/c/*.json',
  { eager: true },
)

const contentBySlug = new Map<string, CategoryContent>()
for (const path in contentModules) {
  const data = contentModules[path].default
  contentBySlug.set(data.slug, data)
}

const rawCategories = (categoriesJson as RawCategory[])
  .slice()
  .sort((a, b) => a.sort - b.sort)

export function getCategories(): Category[] {
  return rawCategories.map((c) => ({ ...c, ready: contentBySlug.has(c.slug) }))
}

export function getCategoryView(slug: string): CategoryView | null {
  const raw = rawCategories.find((c) => c.slug === slug)
  if (!raw) return null
  const content = contentBySlug.get(slug)
  return {
    category: { ...raw, ready: !!content },
    updated: content?.updated ?? '',
    tracks: content?.tracks ?? { app: [], skill: [] },
    notes: content?.notes ?? null,
  }
}

/** The default category shown at the site root. */
export const DEFAULT_SLUG = 'coding'

export type Track = 'app' | 'skill'

export type RankedItem = RankItem & {
  track: Track
  /** display label for the Type column */
  typeLabel: 'App / SaaS' | 'Skill / Repo'
  /** merged rank across both tracks (1-based) */
  overallRank: number
  /** derived display score (0-10). NOTE: placeholder derived from confidence +
   * position — NOT an independent measurement. Real scores arrive with hands-on
   * testing; see the honesty note in the detail panel. */
  score: number
}

// App track ranks above the skill track (matching the reference layout), score
// descends by merged position. Deterministic — no randomness.
export function rankItems(view: CategoryView): RankedItem[] {
  const merged: Array<RankItem & { track: Track }> = [
    ...view.tracks.app.map((i) => ({ ...i, track: 'app' as const })),
    ...view.tracks.skill.map((i) => ({ ...i, track: 'skill' as const })),
  ]
  return merged.map((it, i) => ({
    ...it,
    typeLabel: it.track === 'app' ? 'App / SaaS' : 'Skill / Repo',
    overallRank: i + 1,
    score: Math.max(0, Math.round((9.4 - i * 0.42) * 10) / 10),
  }))
}
