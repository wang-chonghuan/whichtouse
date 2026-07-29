// Shared catalog types. Type-only, so importing this from a client component
// pulls in nothing at runtime — the DB access lives in catalog-db.ts.

export type FormFactor = 'app' | 'skill'
export type MoneyTier = 'green' | 'yellow' | 'red'
export type Confidence = 'high' | 'medium' | 'low'
export type Track = 'app' | 'oss' | 'skill'

export type Source = { name: string; url: string }

/** What the aggregation actually used, so "why it ranks here" renders real
 * inputs instead of prose someone wrote once. Concretely typed rather than a
 * loose bag: server-function return values have to be provably serialisable. */
export type EvidenceSource = { site: string; rank: number; url?: string }
export type Evidence = {
  score?: number
  sources?: EvidenceSource[]
  metrics?: Record<string, number>
}

/** Non-app track item kind. Agent Skills (SKILL.md packages) are preferred; a
 * notable open-source repo fills in where no established skill exists yet. */
export type ItemKind = 'skill' | 'repo'

export type RankItem = {
  /** stable identity — the DB `tool_slug`. Survives re-ranking, unlike position. */
  id: string
  /** display position within the rendered column, 1-based */
  rank: number
  name: string
  homepage: string | null
  pricing: string | null
  bestFor: string
  confidence: Confidence
  badge: string
  sources: Source[]
  kind?: ItemKind

  /** false when the row was created by the refresh job and no human has opened
   * the tool yet. The difference between "ranked by aggregation" and "we sat
   * down with this one" is the site's whole pitch, so it must be renderable. */
  reviewed: boolean

  /** the one comparative advantage (v2) */
  edge?: string | null
  /** the single biggest reason not to pick it (v2) */
  con?: string | null
  /** narrative ranking reason — a causal account of why this belongs here.
   * Authored only. Never synthesised from metrics: `.agents/skills/wt-enrich`
   * forbids leading with star growth or claiming something ranks because it is
   * trending, and an absent reason is better than a fabricated one. */
  rankBasis?: string

  /** Verifiable facts about the item — star counts, trending position, last
   * push. Rendered as what they are. They are evidence that something resonated,
   * never the explanation for it, and they must never appear as `pros`. */
  signals?: string[]

  pricingFree?: string | null
  pricingPaid?: string | null
  /** dated separately from everything else because pricing rots fastest */
  pricingCheckedAt?: string | null
  features?: string[]
  pros?: string[]
  cons?: string[]

  evidence?: Evidence
}

export type Category = {
  slug: string
  name: string
  moneyTier: MoneyTier
  sort: number
  /** whether any ranked listing exists yet */
  ready: boolean
}

export type WatchlistEntry = { name: string; url: string | null }

export type CategoryView = {
  category: Category
  updated: string
  tracks: { app: RankItem[]; oss: RankItem[]; skill: RankItem[] }
  notes: string | null
  watchlist: WatchlistEntry[]
}

export type CatalogSearchEntry = {
  kind: 'category' | 'product'
  label: string
  categoryName: string
  categorySlug: string
  itemId?: string
}

export type CatalogSnapshot = {
  categories: Category[]
  views: Record<string, CategoryView>
  searchEntries: CatalogSearchEntry[]
  loadedAt: number
}
