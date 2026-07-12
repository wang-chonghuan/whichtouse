// D6: generate AI-friendly static output from the DB into app/public/:
//   /llms.txt              site descriptor + category index
//   /api/categories.json   [{slug,name,moneyTier}]
//   /api/c/<slug>.json     { category, overall{app,skill,repo}, growth{...}, best3 }
// Phase 1 data is one-shot, so static files (served by Nitro) are the right shape.
// Usage:  EASYAPP_DATABASE_URL=... node scripts/gen-ai-static.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { sql, close } from './lib/db.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const pub = resolve(here, '../../../../app/public')
const apiDir = resolve(pub, 'api')
const cDir = resolve(apiDir, 'c')

const emptyTracks = () => ({ app: [], skill: [], repo: [] })

async function main() {
  const cats = await sql()`select slug, name, money_tier from categories order by sort`
  mkdirSync(cDir, { recursive: true })

  const index = cats.map((c) => ({ slug: c.slug, name: c.name, moneyTier: c.money_tier }))
  writeFileSync(resolve(apiDir, 'categories.json'), JSON.stringify(index, null, 2))

  const lines = [
    '# WhichToUse',
    '',
    "> The honest ranking of AI agents, by what you're doing.",
    '> Use-case categories x three form-factor tracks (app/SaaS, skill, open-source),',
    '> ranked by public signals (GitHub stars / directory upvotes). All provisional',
    '> (signal-ranked, not yet hands-on tested).',
    '',
    '## Machine-readable',
    '- Category index: /api/categories.json',
    '- Per category: /api/c/<slug>.json  (overall top-10/track, growth top-5/track, cross-form Best 3)',
    '',
    '## Categories',
  ]

  for (const c of cats) {
    const rows = await sql()`
      select r.form_factor as rank_track, r.dimension, r.rank,
             i.form_factor as item_track, i.name, i.url, i.homepage, i.pricing,
             i.overall_signal, i.growth_signal, i.badge
      from rankings r join items i on i.id = r.item_id join categories c on c.id = r.category_id
      where c.slug = ${c.slug} order by r.dimension, r.form_factor, r.rank`
    const toItem = (r) => ({
      rank: r.rank, formFactor: r.item_track, name: r.name, url: r.url, homepage: r.homepage,
      pricing: r.pricing, overall: r.overall_signal != null ? Number(r.overall_signal) : null,
      growth: r.growth_signal != null ? Number(r.growth_signal) : null, badge: r.badge,
    })
    const overall = emptyTracks(); const growth = emptyTracks(); const best3 = []
    for (const r of rows) {
      if (r.rank_track === 'best3') best3.push(toItem(r))
      else if (r.dimension === 'overall') overall[r.rank_track].push(toItem(r))
      else if (r.dimension === 'growth') growth[r.rank_track].push(toItem(r))
    }
    writeFileSync(
      resolve(cDir, `${c.slug}.json`),
      JSON.stringify({ category: { slug: c.slug, name: c.name }, overall, growth, best3 }, null, 2),
    )
    lines.push(`- ${c.name}: /api/c/${c.slug}.json`)
  }

  writeFileSync(resolve(pub, 'llms.txt'), lines.join('\n') + '\n')
  console.log(`wrote llms.txt + categories.json + ${cats.length} category files`)
  await close()
}
main().catch((e) => { console.error(e); process.exit(1) })
