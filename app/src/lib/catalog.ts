import { createServerFn } from '@tanstack/react-start'

import { sql } from '~/lib/db'

// Server-side data delivery for the ranking site. All reads hit the Azure
// easy-app Postgres (whichtouse-schema): categories / items / rankings.
// Kept in server functions so the DB connection never reaches the client bundle.

export type Category = { slug: string; name: string; moneyTier: string }

export type RankItem = {
  rank: number
  formFactor: 'app' | 'skill' | 'repo'
  name: string
  url: string | null
  homepage: string | null
  pricing: string | null
  overall: number | null
  growth: number | null
  badge: string
}

export type CategoryView = {
  category: Category
  overall: Record<'app' | 'skill' | 'repo', RankItem[]>
  growth: Record<'app' | 'skill' | 'repo', RankItem[]>
  best3: RankItem[]
}

export const getCategories = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Category[]> => {
    const rows = await sql()`
      select slug, name, money_tier from categories order by sort
    `
    return rows.map((r) => ({ slug: r.slug, name: r.name, moneyTier: r.money_tier }))
  },
)

const emptyTracks = (): Record<'app' | 'skill' | 'repo', RankItem[]> => ({
  app: [],
  skill: [],
  repo: [],
})

export const getCategoryView = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<CategoryView | null> => {
    const cat = await sql()`select slug, name, money_tier from categories where slug = ${slug}`
    if (!cat.length) return null

    const rows = await sql()`
      select r.form_factor as rank_track, r.dimension, r.rank,
             i.form_factor as item_track, i.name, i.url, i.homepage, i.pricing,
             i.overall_signal, i.growth_signal, i.badge
      from rankings r
      join items i on i.id = r.item_id
      join categories c on c.id = r.category_id
      where c.slug = ${slug}
      order by r.dimension, r.form_factor, r.rank
    `

    const toItem = (r: any): RankItem => ({
      rank: r.rank,
      formFactor: r.item_track,
      name: r.name,
      url: r.url,
      homepage: r.homepage,
      pricing: r.pricing,
      overall: r.overall_signal != null ? Number(r.overall_signal) : null,
      growth: r.growth_signal != null ? Number(r.growth_signal) : null,
      badge: r.badge,
    })

    const overall = emptyTracks()
    const growth = emptyTracks()
    const best3: RankItem[] = []
    for (const r of rows) {
      if (r.rank_track === 'best3') best3.push(toItem(r))
      else if (r.dimension === 'overall') overall[r.rank_track as 'app' | 'skill' | 'repo'].push(toItem(r))
      else if (r.dimension === 'growth') growth[r.rank_track as 'app' | 'skill' | 'repo'].push(toItem(r))
    }

    return {
      category: { slug: cat[0].slug, name: cat[0].name, moneyTier: cat[0].money_tier },
      overall,
      growth,
      best3,
    }
  })
