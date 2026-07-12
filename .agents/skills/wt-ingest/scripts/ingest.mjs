// wt-ingest orchestrator (D3). Two-stage per category:
//   discover candidates (directory-as-seed for app; GitHub keyword search for repo/skill)
//   → investigate signals (stars + last-30d growth; upvotes) → dedup → write items.
// Tracks never overlap (DB unique (category_id, dedup_key) enforces one form factor per tool).
// Usage:  node scripts/ingest.mjs [category-slug]   (default: all categories)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { searchRepos, searchSkills } from './lib/github.mjs'
import { topForCategory as adTopForCategory } from './lib/aiagentsdirectory.mjs'
import { getCategory, upsertItem, close } from './lib/db.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../../..') // .agents/skills/wt-ingest/scripts -> repo root
const sources = JSON.parse(
  readFileSync(resolve(repoRoot, 'resources/content/wt-sources.json'), 'utf8'),
)

const PER_TRACK = 12 // ingest a few more than the D4 top-10 so ranking has headroom

// core terms for dedicated MCP/skill discovery per category (host-agent tuned)
const SKILL_TERMS = {
  'lead-gen': ['sales', 'lead', 'outreach'],
  'seo-geo': ['seo', 'search'],
  'content-writing': ['writing', 'content', 'copywriting'],
  'video-generation': ['video', 'avatar'],
  'ui-design': ['design', 'figma', 'ui'],
}

// growth proxy: signal per month since creation ("new & high" = rising).
// Provisional stand-in for 30-day delta (reliable, no extra API calls).
function velocity(signal, createdISO) {
  if (!signal || !createdISO) return null
  const months = (Date.now() - Date.parse(createdISO)) / (30 * 24 * 3600 * 1000)
  if (!(months > 0)) return null
  return Math.round(signal / Math.max(months, 1))
}

function domainOf(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
// aiagentsdirectory text-match terms, derived from keywords + name (no extra config)
function matchTerms(cat) {
  const words = new Set()
  for (const kw of cat.github_keywords || []) for (const w of kw.split(/\s+/)) if (w.length > 3) words.add(w.toLowerCase())
  for (const w of cat.name.split(/[\s/]+/)) if (w.length > 1) words.add(w.toLowerCase())
  return [...words]
}

async function ingestCategory(cat) {
  const dbCat = await getCategory(cat.slug)
  if (!dbCat) {
    console.warn(`  ! category ${cat.slug} not in DB (run D2), skipping`)
    return
  }
  const counts = { repo: 0, skill: 0, app: 0 }

  // repo + skill tracks: GitHub keyword search, split by skill heuristic.
  const repos = await searchRepos(cat.github_keywords || [], { limit: 50, minStars: 30 })
  // skill track: name-filtered MCP search only (precision over recall — no slop).
  const skillTrack = (await searchSkills(SKILL_TERMS[cat.slug] || [cat.slug])).slice(0, PER_TRACK)
  const skillUrls = new Set(skillTrack.map((r) => r.url))
  const repoTrack = repos.filter((r) => !skillUrls.has(r.url)).slice(0, PER_TRACK)
  for (const [track, list] of [['repo', repoTrack], ['skill', skillTrack]]) {
    for (const r of list) {
      const growth = velocity(r.stars, r.created)
      await upsertItem({
        category_id: dbCat.id,
        form_factor: track,
        name: r.name,
        url: r.url,
        homepage: r.homepage,
        pricing: 'open-source',
        overall_signal: r.stars,
        growth_signal: growth,
        dedup_key: r.url,
        source: 'github',
      })
      counts[track]++
    }
  }

  // app track: aiagentsdirectory directory-as-seed, top by upvotes.
  const apps = await adTopForCategory(matchTerms(cat), { limit: PER_TRACK })
  for (const a of apps) {
    const key = domainOf(a.homepage || a.url) || `ad:${a.name.toLowerCase()}`
    await upsertItem({
      category_id: dbCat.id,
      form_factor: 'app',
      name: a.name,
      url: a.url,
      homepage: a.homepage,
      pricing: a.pricing,
      overall_signal: a.upvotes,
      growth_signal: a.growth,
      dedup_key: key,
      source: 'aiagentsdirectory',
    })
    counts.app++
  }

  console.log(`  ${cat.slug}: repo=${counts.repo} skill=${counts.skill} app=${counts.app}`)
}

async function main() {
  const only = process.argv[2]
  const cats = sources.categories.filter((c) => !only || c.slug === only)
  console.log(`wt-ingest: ${cats.length} categor${cats.length === 1 ? 'y' : 'ies'}`)
  for (const cat of cats) {
    console.log(`- ${cat.name} (${cat.slug})`)
    try {
      await ingestCategory(cat)
    } catch (e) {
      console.error(`  ! ${cat.slug} failed: ${e.message}`)
    }
  }
  await close()
  console.log('done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
