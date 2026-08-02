// Server-only catalog reads. Imported dynamically from catalog.ts inside server
// function handlers so the `postgres` driver never enters the client graph.
//
// One query builds the whole snapshot: 25 categories and ~400 listings is small
// enough that per-page queries would buy nothing but round trips.

import { sql } from './db'
import type {
  CatalogSnapshot,
  Category,
  CategoryView,
  Confidence,
  Evidence,
  MoneyTier,
  RankItem,
  Source,
  Track,
} from './catalog-types'

type CategoryRow = {
  slug: string
  name: string
  money_tier: MoneyTier
  sort: number
  note: string | null
  pick_weigh: string | null
  pick_avoid: string | null
  pick_moving: string | null
  pick_sources: Array<string>
  pick_updated_at: Date | null
  pick_details: Record<string, { detail?: string }> | null
  refreshed_at: Date | null
}

type ListingRow = {
  category_slug: string
  tool_slug: string
  name: string
  owner: string | null
  track: 'saas' | 'oss' | 'skill'
  homepage: string | null
  standing: 'leading' | 'emerging' | 'watchlist'
  rank: number | null
  reviewed_at: Date | null
  summary: string | null
  edge: string | null
  con: string | null
  best_for: string | null
  rank_basis: string | null
  features: unknown
  pros: unknown
  cons: unknown
  sources: unknown
  confidence: Confidence | null
  pricing_model: string | null
  pricing_free: string | null
  pricing_paid: string | null
  pricing_checked_at: Date | null
  evidence: unknown
  refreshed_at: Date | null
}

/** One column per form. Skills get their own: the earlier merge was argued from
 * a coverage gap that turned out to be an artefact of the search, not of the
 * ecosystem — see the github-skills source in sources.json. */
const UI_TRACK: Record<ListingRow['track'], Track> = { saas: 'app', oss: 'oss', skill: 'skill' }
const COLUMN_ORDER: Record<Track, number> = { app: 0, oss: 1, skill: 2 }
const STANDING_ORDER = { leading: 0, emerging: 1, watchlist: 2 } as const

/** The rendered score is banded by confidence so the number can never contradict
 * the label, which means a column has to arrive high→medium→low or the score
 * stops descending. That held while one corpus track filled one column; now
 * `oss` and `skill` share the right-hand column and each is ranked separately,
 * so without this key the column reads #2 = 7.3, #3 = 9.1. */
const CONFIDENCE_ORDER: Record<Confidence, number> = { high: 0, medium: 1, low: 2 }
const confidenceRank = (c: Confidence | null) => CONFIDENCE_ORDER[c ?? 'low']

function isoDate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : ''
}

/** jsonb columns are trusted by every consumer that calls .map() on them, and a
 * single bad row took the whole detail panel down with
 * "features.map is not a function". The write path is fixed, but the read path
 * must not be the thing that decides whether the site renders: coerce here, so
 * bad data costs one empty list instead of a white screen. */
function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
  return []
}

function evidenceOf(value: unknown): Evidence {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Evidence) : {}
}

function toRankItem(row: ListingRow, displayRank: number): RankItem {
  const label = row.owner ? `${row.owner}/${row.name}` : row.name
  return {
    id: row.tool_slug,
    rank: displayRank,
    standing: row.standing === 'emerging' ? 'emerging' : 'leading',
    name: label,
    homepage: row.homepage,
    pricing: row.pricing_model,
    // `best_for` is what the current corpus authored; `summary` is the v2 field.
    // Prefer the richer one so nothing regresses while both exist.
    bestFor: row.best_for ?? row.summary ?? '',
    confidence: row.confidence ?? 'low',
    badge: '',
    sources: toArray<Source>(row.sources),
    kind: row.track === 'oss' ? 'repo' : row.track === 'skill' ? 'skill' : undefined,
    reviewed: row.reviewed_at !== null,
    edge: row.edge,
    rankBasis: row.rank_basis ?? undefined,
    // WHICHTOUSE-16: a machine-placed row has no authored basis, and its
    // aggregation inputs must not be dressed up as one. They render as
    // signals — "GitHub (stars) #5", "Hacker News #6" — which is exactly what
    // they are: where the ordering came from, not why the tool is good.
    signals: row.rank_basis
      ? undefined
      : (evidenceOf(row.evidence).sources ?? []).map(
          (s) => `${s.site} #${s.rank}`,
        ),
    con: row.con,
    pricingFree: row.pricing_free,
    pricingPaid: row.pricing_paid,
    pricingCheckedAt: isoDate(row.pricing_checked_at) || null,
    features: toArray<string>(row.features),
    pros: toArray<string>(row.pros),
    cons: toArray<string>(row.cons),
    evidence: evidenceOf(row.evidence),
  }
}

export async function loadSnapshot(): Promise<CatalogSnapshot> {
  const db = sql()

  const [categoryRows, listingRows] = await Promise.all([
    db<CategoryRow[]>`
      select c.slug, c.name, c.money_tier, c.sort, c.note, c.refreshed_at,
             c.pick_weigh, c.pick_avoid, c.pick_moving, c.pick_sources, c.pick_updated_at,
             -- The expanded prose lives with the run that produced it rather
             -- than on the category, so the card reads the newest run instead
             -- of a second copy that could drift from it.
             r.byp_details as pick_details
      from categories c
      left join lateral (
        select byp_details from before_you_pick_runs
        where category_slug = c.slug order by batch_id desc, id desc limit 1
      ) r on true
      order by c.sort
    `,
    db<ListingRow[]>`
      select category_slug, tool_slug, name, owner, track, homepage,
             standing, rank, reviewed_at, summary, edge, con, best_for, rank_basis,
             features, pros, cons, sources, confidence,
             pricing_model, pricing_free, pricing_paid, pricing_checked_at,
             evidence, refreshed_at
      from listings
      order by category_slug, standing, track, rank nulls last
    `,
  ])

  const byCategory = new Map<string, ListingRow[]>()
  for (const row of listingRows) {
    const bucket = byCategory.get(row.category_slug)
    if (bucket) bucket.push(row)
    else byCategory.set(row.category_slug, [row])
  }

  const categories: Category[] = []
  const views: Record<string, CategoryView> = {}
  const searchEntries: CatalogSnapshot['searchEntries'] = []

  for (const c of categoryRows) {
    const rows = byCategory.get(c.slug) ?? []
    // rank null means the refresh job considered this row and left it out of
    // the standing — usually pushed past the ten-per-bucket cap by something
    // better. Rendering it anyway would show exactly the rows the algorithm
    // rejected, and would grow the column past the "ten at most" promise.
    const ranked = rows.filter((r) => r.standing !== 'watchlist' && r.rank !== null)

    const category: Category = {
      slug: c.slug,
      name: c.name,
      moneyTier: c.money_tier,
      sort: c.sort,
      ready: ranked.length > 0,
    }
    categories.push(category)

    const sorted = ranked.slice().sort((a, b) => {
      const ta = UI_TRACK[a.track]
      const tb = UI_TRACK[b.track]
      if (ta !== tb) return COLUMN_ORDER[ta] - COLUMN_ORDER[tb]
      const sa = STANDING_ORDER[a.standing]
      const sb = STANDING_ORDER[b.standing]
      if (sa !== sb) return sa - sb
      const ca = confidenceRank(a.confidence)
      const cb = confidenceRank(b.confidence)
      if (ca !== cb) return ca - cb
      return (a.rank ?? 1e9) - (b.rank ?? 1e9)
    })

    const tracks: CategoryView['tracks'] = { app: [], oss: [], skill: [] }
    for (const row of sorted) {
      const track = UI_TRACK[row.track]
      tracks[track].push(toRankItem(row, tracks[track].length + 1))
    }

    // Freshness is the newest thing we can honestly claim: a human review if
    // there is one, otherwise the last machine refresh.
    const newest = rows.reduce<Date | null>((acc, r) => {
      for (const d of [r.reviewed_at, r.refreshed_at]) {
        if (d && (!acc || d > acc)) acc = d
      }
      return acc
    }, c.refreshed_at)

    views[c.slug] = {
      category,
      updated: isoDate(newest),
      tracks,
      notes: c.note,
      // Only rendered when at least one line exists — see BeforeYouPick.
      beforeYouPick: {
        weigh: c.pick_weigh,
        avoid: c.pick_avoid,
        moving: c.pick_moving,
        sources: c.pick_sources ?? [],
        updated: isoDate(c.pick_updated_at),
        details: {
          weigh: c.pick_details?.weigh?.detail ?? null,
          avoid: c.pick_details?.avoid?.detail ?? null,
          moving: c.pick_details?.moving?.detail ?? null,
        },
      },
      watchlist: rows
        .filter((r) => r.standing === 'watchlist')
        .map((r) => ({ name: r.owner ? `${r.owner}/${r.name}` : r.name, url: r.homepage })),
    }

    searchEntries.push({
      kind: 'category',
      label: c.name,
      categoryName: c.name,
      categorySlug: c.slug,
    })
    for (const track of ['app', 'oss', 'skill'] as const) {
      for (const item of tracks[track]) {
        searchEntries.push({
          kind: 'product',
          label: item.name,
          categoryName: c.name,
          categorySlug: c.slug,
          itemId: item.id,
        })
      }
    }
  }

  return { categories, views, searchEntries, loadedAt: Date.now() }
}
