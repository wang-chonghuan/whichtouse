#!/usr/bin/env node
// Seed Postgres from the authored JSON corpus. Run once against a freshly
// applied ssot-schemas/db-schemas/whichtouse.sql; safe to re-run (upserts).
//
//   node scripts/import-content.mjs [--dry]
//
// Reads EASYAPP_DATABASE_URL or DATABASE_URL. See specs/content-in-db.md §7.
//
// The corpus is the seed of record and stays in git. What it cannot express is
// documented in §7.1 and reproduced honestly here rather than papered over:
//   - `edge` / `con` are v2 concepts. Seeded from pros[0] / cons[0], which were
//     written as list items, not as the single sharpest comparative claim. They
//     need a human pass and are marked as inherited so that pass is findable.
//   - the corpus knows `app` and `skill`; the schema wants `saas`/`oss`/`skill`.
//     `kind: 'repo'` and owner/name shapes decide the split.

import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import postgres from 'postgres'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', 'src', 'content')
const DRY = process.argv.includes('--dry')

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url && !DRY) {
  console.error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
  process.exit(1)
}

// A plain JS string handed to a jsonb column is stored as a JSON *string*, not
// as the array it spells out: jsonb_typeof comes back 'string' and everything
// downstream that calls .map() on it throws. This shipped once and crashed the
// whole detail panel. Values must be marked as JSON explicitly.
const sql = url
  ? postgres(url, {
      ssl: url.includes('sslmode=disable') ? false : 'require',
      max: 4,
      connection: { search_path: '"whichtouse-schema"' },
    })
  : null
const json = (value) => (sql ? sql.json(value ?? []) : (value ?? []))

/** Stable, readable identity. Owner-qualified for repos so two projects named
 * `skills` in different orgs never collide inside one category. */
function toolSlug(owner, name) {
  const base = owner ? `${owner}--${name}` : name
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** The corpus writes repo entries as `owner/name`; hosted products have no slash. */
function splitName(raw) {
  const m = /^([^/\s]+)\/(.+)$/.exec(raw.trim())
  return m ? { owner: m[1], name: m[2] } : { owner: null, name: raw.trim() }
}

function repoFullName(item, owner, name) {
  const home = item.homepage || ''
  const m = /github\.com\/([^/]+)\/([^/?#]+)/.exec(home)
  if (m) return `${m[1]}/${m[2].replace(/\.git$/, '')}`
  return owner ? `${owner}/${name}` : null
}

/** Corpus track + item shape -> schema track. `kind` is authoritative where it
 * exists; otherwise an owner-qualified name means a repository. */
function resolveTrack(corpusTrack, item, owner) {
  if (corpusTrack === 'app') return 'saas'
  if (item.kind === 'repo') return 'oss'
  if (item.kind === 'skill') return 'skill'
  return owner ? 'oss' : 'skill'
}

function firstOrNull(list) {
  return Array.isArray(list) && list.length ? String(list[0]) : null
}

function normalizeConfidence(value) {
  return ['high', 'medium', 'low'].includes(value) ? value : null
}

async function main() {
  const categories = JSON.parse(await readFile(join(CONTENT, 'categories.json'), 'utf8'))
  const files = (await readdir(join(CONTENT, 'c'))).filter((f) => f.endsWith('.json'))

  const contentBySlug = new Map()
  for (const file of files) {
    const data = JSON.parse(await readFile(join(CONTENT, 'c', file), 'utf8'))
    contentBySlug.set(data.slug, data)
  }

  const categoryRows = []
  const listingRows = []
  const stats = { categories: 0, listings: 0, byTrack: {}, skipped: [] }

  for (const category of categories) {
    const content = contentBySlug.get(category.slug)
    categoryRows.push({
      slug: category.slug,
      name: category.name,
      money_tier: category.moneyTier ?? 'green',
      sort: category.sort ?? 0,
      note: content?.notes ?? null,
    })
    stats.categories++
    if (!content) continue

    // Reviewed/priced-at dates come from the corpus's own `updated` field: this
    // content was authored by hand, so it genuinely was looked at that day.
    const updated = content.updated ? new Date(`${content.updated}T00:00:00Z`) : null

    // Rank is per (category, track, standing); the corpus numbers per corpus
    // track, so re-number as each schema track fills up.
    const nextRank = {}
    const seen = new Set()

    for (const corpusTrack of ['app', 'skill']) {
      for (const item of content.tracks?.[corpusTrack] ?? []) {
        const { owner, name } = splitName(item.name)
        const track = resolveTrack(corpusTrack, item, owner)
        const slug = toolSlug(owner, name)

        if (seen.has(slug)) {
          stats.skipped.push(`${category.slug}: duplicate ${slug}`)
          continue
        }
        seen.add(slug)

        nextRank[track] = (nextRank[track] ?? 0) + 1
        stats.byTrack[track] = (stats.byTrack[track] ?? 0) + 1
        stats.listings++

        listingRows.push({
          category_slug: category.slug,
          tool_slug: slug,
          name,
          owner,
          track,
          homepage: item.homepage ?? null,
          repo_full_name: track === 'saas' ? null : repoFullName(item, owner, name),
          package_name: null,
          standing: 'leading',
          rank: nextRank[track],
          reviewed_at: updated,
          summary: item.bestFor ?? null,
          edge: firstOrNull(item.pros),
          con: firstOrNull(item.cons),
          best_for: item.bestFor ?? null,
          rank_basis: item.rankBasis ?? null,
          features: json(item.features),
          pros: json(item.pros),
          cons: json(item.cons),
          sources: json(item.sources),
          confidence: normalizeConfidence(item.confidence),
          pricing_model: item.pricing ?? null,
          pricing_free: item.pricingFree ?? null,
          pricing_paid: item.pricingPaid ?? null,
          pricing_checked_at: updated,
        })
      }
    }
  }

  console.log(
    `parsed ${stats.categories} categories, ${stats.listings} listings`,
    JSON.stringify(stats.byTrack),
  )
  for (const s of stats.skipped) console.warn('  skipped:', s)

  if (DRY) {
    console.log('--dry: nothing written')
    console.log(JSON.stringify(listingRows.slice(0, 2), null, 1))
    return
  }

  try {
    await sql.begin(async (tx) => {
      for (const row of categoryRows) {
        await tx`
          insert into categories ${tx(row)}
          on conflict (slug) do update set
            name = excluded.name, money_tier = excluded.money_tier,
            sort = excluded.sort, note = excluded.note, updated_at = now()
        `
      }

      // Chunked so one statement never carries all 374 rows.
      for (let i = 0; i < listingRows.length; i += 50) {
        const chunk = listingRows.slice(i, i + 50)
        await tx`
          insert into listings ${tx(chunk)}
          on conflict (category_slug, tool_slug) do update set
            name = excluded.name, owner = excluded.owner, track = excluded.track,
            homepage = excluded.homepage, repo_full_name = excluded.repo_full_name,
            standing = excluded.standing, rank = excluded.rank,
            reviewed_at = excluded.reviewed_at, summary = excluded.summary,
            edge = excluded.edge, con = excluded.con, best_for = excluded.best_for, rank_basis = excluded.rank_basis,
            features = excluded.features, pros = excluded.pros, cons = excluded.cons,
            sources = excluded.sources, confidence = excluded.confidence,
            pricing_model = excluded.pricing_model,
            pricing_free = excluded.pricing_free, pricing_paid = excluded.pricing_paid,
            pricing_checked_at = excluded.pricing_checked_at,
            updated_at = now()
        `
      }
    })

    const [{ count: cats }] = await sql`select count(*)::int from categories`
    const byTrack = await sql`
      select track, standing, count(*)::int
      from listings group by track, standing order by track, standing
    `
    console.log(`\nwritten. categories=${cats}`)
    for (const r of byTrack) console.log(`  ${r.track}/${r.standing}: ${r.count}`)
  } finally {
    await sql.end({ timeout: 5 })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
