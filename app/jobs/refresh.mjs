#!/usr/bin/env node
// Daily refresh job — Azure Container Apps Job `caj-whichtouse-refresh`.
// Bundled by scripts/build-jobs.mjs into .output/jobs/refresh.mjs, so the
// runtime image needs nothing but node and the bundle.
//
//   node .output/jobs/refresh.mjs [--dry] [--category <slug>]
//
// Design: specs/content-in-db.md §5. In one sentence: fetch each allowlisted
// source's current ranking, fuse the ranks, rewrite standing/rank/evidence.
//
// What it must never do:
//   - touch editorial prose or reviewed_at (§3.1)
//   - reorder saas/leading, which stays human-ordered in phase 1 (§3.4)
//   - move watchlist rows, which are a deliberate human pull
//
// It *may* create rows: a tool that appears on a source and is not in the
// corpus gets a listing with reviewed_at null (§3.1a).

import postgres from 'postgres'

import config from '../src/content/sources.json' with { type: 'json' }
import { assignCategory, clearsSoloBar } from '../src/lib/category-rule.ts'

const DRY = process.argv.includes('--dry')
const ONLY = (() => {
  const i = process.argv.indexOf('--category')
  return i > -1 ? process.argv[i + 1] : null
})()

const UA = 'WhichToUse/1.0 (+https://whichtouse.com)'
const TIMEOUT = 12000

const log = (...a) => console.log(new Date().toISOString(), ...a)

// ---------------------------------------------------------------------------
// identity matching
// ---------------------------------------------------------------------------

/** Phase 1 matches on normalised domain and repo full name only. Anything
 * ambiguous is dropped rather than guessed: a duplicate row inside a standing
 * is far more visible to a reader than a missing one. */
/** Code hosts and package registries are never a product's identity: a dozen
 * listings in one category can all sit on github.com. Indexing those as domains
 * collapses every unmatched search result onto whichever listing was stored
 * last — an early run summed ~22 reciprocal ranks into one row and scored it 10x
 * the field. Repos are identified by repo_full_name; nothing else. */
const NOT_IDENTITY = new Set([
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'sourceforge.net',
  'npmjs.com',
  'pypi.org',
  'huggingface.co',
  'marketplace.visualstudio.com',
])

function domainOf(url) {
  if (!url) return null
  try {
    const h = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    return NOT_IDENTITY.has(h) ? null : h
  } catch {
    return null
  }
}

function repoOf(url) {
  if (!url) return null
  const m = /github\.com\/([^/]+)\/([^/?#]+)/i.exec(url)
  if (!m) return null
  return `${m[1]}/${m[2].replace(/\.git$/, '')}`.toLowerCase()
}

function toolSlug(owner, name) {
  return `${owner ? `${owner}--${name}` : name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ---------------------------------------------------------------------------
// sources
// ---------------------------------------------------------------------------

async function getJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': UA, ...headers },
    signal: AbortSignal.timeout(TIMEOUT),
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

const GH_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN

function githubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
  }
}

/** GitHub's *search* endpoint is rate-limited far below the rest of the API:
 * 10 requests/minute unauthenticated, 30 authenticated. A full run needs two
 * searches per category, so an unthrottled pass 403s from roughly the tenth
 * category on — which is exactly what the first full run did. Serialise the
 * searches behind a minimum interval and honour the reset header once. */
const GH_MIN_INTERVAL_MS = GH_TOKEN ? 2100 : 6500
let ghChain = Promise.resolve()
let ghLast = 0

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function githubThrottled(fn) {
  const run = ghChain.then(async () => {
    const wait = ghLast + GH_MIN_INTERVAL_MS - Date.now()
    if (wait > 0) await sleep(wait)
    try {
      return await fn()
    } catch (error) {
      const retryable = /\b(403|429)\b/.test(error.message)
      if (!retryable) throw error
      await sleep(GH_MIN_INTERVAL_MS * 4)
      return fn()
    } finally {
      ghLast = Date.now()
    }
  })
  // Keep the chain alive even when a link rejects, or one failure stalls the run.
  ghChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

/** Deliberately `in:name,description` and not `readme`. Searching readmes makes
 * every curated mega-list match every query — an early run had
 * `sindresorhus/awesome` ranked first for "ai coding agent assistant", ahead of
 * every actual coding agent. Restricting the fields and excluding list repos
 * took that query from 259k results to 2.5k relevant ones. */
const LIST_REPO = /^(awesome|best|top|curated)[-_]/i
const LIST_DESC = /\b(curated|awesome)\s+(list|collection)\b/i

async function githubSearch(query, { newOnly }) {
  const parts = [query, 'in:name,description', '-topic:awesome', '-topic:awesome-list']
  if (newOnly) {
    const since = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10)
    parts.push(`created:>${since}`)
  }
  const q = encodeURIComponent(parts.join(' '))
  const data = await githubThrottled(() =>
    getJson(
      `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`,
      githubHeaders(),
    ),
  )
  return (data.items ?? [])
    .filter(
      (repo) =>
        !LIST_REPO.test(repo.name ?? '') && !LIST_DESC.test(repo.description ?? ''),
    )
    .slice(0, 20)
    .map((repo, i) => ({
      rank: i + 1,
      name: repo.name,
      owner: repo.owner?.login ?? null,
      homepage: repo.homepage || repo.html_url,
      repoFullName: repo.full_name,
      url: repo.html_url,
      description: repo.description ?? null,
      topics: repo.topics ?? [],
      track: 'oss',
      metrics: { stars: repo.stargazers_count ?? 0 },
    }))
}

/** Agent skills, found by classification rather than by keyword.
 *
 * The generic repo search finds almost no skills — it was returning 2-3 per
 * category and two categories with none, which looked like the skill ecosystem
 * being thin. It is not: `topic:agent-skills` alone carries 12,313 repos and
 * `topic:claude-skills` 6,084. The search was wrong, not the world. A topic is
 * an explicit self-classification by the author, so precision here is far
 * higher than a name/description match — which is why this source is allowed
 * to place a listing on its own (see `selfPlacing` in sources.json).
 *
 * Two queries because GitHub topic filters AND together; OR needs both runs. */
const SKILL_TOPICS = ['agent-skills', 'claude-skills']

/** Category-agnostic queries. `mattpocock/skills` — 194k stars, one of the
 * largest skill repos there is — carries no topics at all and its description
 * is "Skills for Real Engineers", so no topic filter and no query containing
 * "coding" can reach it. Both of my earlier methods were single-signal and
 * both had the same shape of blind spot. Worse, keying discovery on topics
 * selects for maintainers who tag their repos, which is repo SEO, not quality:
 * the biggest repo in the category was invisible precisely because its author
 * did not bother. */
const SKILL_QUERIES = [
  ...SKILL_TOPICS.map((t) => `topic:${t}`),
  'skills in:name agent',
  '"skills for" in:name,description',
]

/** Topic-scoped search inside one category. Higher recall than the global
 * sweep for skills whose metadata does name their domain. */
async function githubSkillSearch(query) {
  const merged = new Map()
  for (const topic of SKILL_TOPICS) {
    let data
    try {
      data = await githubThrottled(() =>
        getJson(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(`topic:${topic} ${query}`)}&sort=stars&order=desc&per_page=20`,
          githubHeaders(),
        ),
      )
    } catch {
      continue
    }
    for (const [i, repo] of (data.items ?? []).entries()) {
      if (LIST_REPO.test(repo.name ?? '') || LIST_DESC.test(repo.description ?? '')) continue
      const key = repo.full_name.toLowerCase()
      const prev = merged.get(key)
      if (!prev || i < prev.i) merged.set(key, { i, repo })
    }
  }
  return [...merged.values()]
    .sort((a, b) => a.i - b.i)
    .slice(0, 20)
    .map(({ repo }, i) => ({
      rank: i + 1,
      name: repo.name,
      owner: repo.owner?.login ?? null,
      homepage: repo.homepage || repo.html_url,
      repoFullName: repo.full_name,
      url: repo.html_url,
      description: repo.description ?? null,
      topics: repo.topics ?? [],
      track: 'skill',
      metrics: { stars: repo.stargazers_count ?? 0 },
    }))
}

/** Sweep, then classify. Twenty-five category-scoped searches structurally
 * cannot place a generalist repo: nothing in "Skills for Real Engineers" says
 * which of our categories it belongs to. So collect the top skill repos once,
 * globally, and let the classifier read description/topics/README to decide
 * where each one goes — the same way trending rows are categorised. */
async function sweepSkills() {
  const merged = new Map()
  for (const q of SKILL_QUERIES) {
    let data
    try {
      data = await githubThrottled(() =>
        getJson(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=50`,
          githubHeaders(),
        ),
      )
    } catch {
      continue
    }
    for (const [i, repo] of (data.items ?? []).entries()) {
      if (LIST_REPO.test(repo.name ?? '') || LIST_DESC.test(repo.description ?? '')) continue
      const key = repo.full_name.toLowerCase()
      const prev = merged.get(key)
      if (!prev || i < prev.i) merged.set(key, { i, repo })
    }
  }
  return [...merged.values()]
    .sort((a, b) => (b.repo.stargazers_count ?? 0) - (a.repo.stargazers_count ?? 0))
    .map(({ repo }) => repo)
}

/** First matching rule wins, so `skillClassify` is ordered specific-first. */
function classifySkill(repo) {
  const hay = `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase()
  for (const [slug, words] of config.skillClassify ?? []) {
    if (words.some((w) => hay.includes(w))) return slug
  }
  return null
}

/** Returns the swept repos that belong to `slug`, ranked by stars. */
function skillsForCategory(sweep, slug) {
  const hits = sweep.filter((repo) => classifySkill(repo) === slug)
  return hits.slice(0, 20).map((repo, i) => ({
    rank: i + 1,
    name: repo.name,
    owner: repo.owner?.login ?? null,
    homepage: repo.homepage || repo.html_url,
    repoFullName: repo.full_name,
    url: repo.html_url,
    description: repo.description ?? null,
    topics: repo.topics ?? [],
    track: 'skill',
    metrics: { stars: repo.stargazers_count ?? 0 },
  }))
}

/** Corroboration only — HN never introduces a hosted product.
 *
 * A bare domain on HN means "someone posted a link", not "this is a product".
 * Ranking raw domains put arstechnica.com at the top for "ai coding agent",
 * above every real tool, and no threshold fixed it: requiring repeat stories
 * kept the news sites (they publish constantly) and dropped the products
 * (a launch is one thread). So a domain only scores when it already matches a
 * listing we hold; discovery from HN is limited to GitHub links, where the
 * URL itself proves what the thing is.
 *
 * @param knownDomains domains of the listings already in this category */
async function hnSearch(query, knownDomains) {
  const since = Math.floor((Date.now() - 365 * 864e5) / 1000)
  const q = encodeURIComponent(query)
  const data = await getJson(
    `https://hn.algolia.com/api/v1/search?query=${q}&tags=story&numericFilters=created_at_i>${since},points>10&hitsPerPage=100`,
  )

  const scored = new Map()
  for (const hit of data.hits ?? []) {
    const repo = repoOf(hit.url)
    const key = repo ? `repo:${repo}` : domainOf(hit.url)
    if (!key) continue
    if (!repo && !knownDomains.has(key)) continue // no discovery from bare domains
    scored.set(key, (scored.get(key) ?? 0) + (hit.points ?? 0))
  }

  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, points], i) => {
      const isRepo = key.startsWith('repo:')
      const full = isRepo ? key.slice(5) : null
      return {
        rank: i + 1,
        name: isRepo ? full.split('/')[1] : key,
        owner: isRepo ? full.split('/')[0] : null,
        homepage: isRepo ? `https://github.com/${full}` : `https://${key}`,
        repoFullName: full,
        url: isRepo ? `https://github.com/${full}` : `https://${key}`,
        // HN gives a link and a score, never a blurb.
        description: null,
        track: isRepo ? 'oss' : 'saas',
        metrics: { hn_points: points },
      }
    })
}

/** Product Hunt rate-limits too, and 25 back-to-back category queries trip it:
 * a full run came back with 429 on the last third. Same serialised-interval
 * treatment as GitHub. */
let phChain = Promise.resolve()
let phLast = 0
const PH_MIN_INTERVAL_MS = 2500

function phThrottled(fn) {
  const run = phChain.then(async () => {
    const wait = phLast + PH_MIN_INTERVAL_MS - Date.now()
    if (wait > 0) await sleep(wait)
    try {
      return await fn()
    } catch (error) {
      if (!/\b429\b/.test(error.message)) throw error
      await sleep(PH_MIN_INTERVAL_MS * 6)
      return fn()
    } finally {
      phLast = Date.now()
    }
  })
  phChain = run.then(() => undefined, () => undefined)
  return run
}

async function productHuntSearch(topicSlug) {
  const token = process.env.PRODUCTHUNT_TOKEN
  if (!token) return null
  const body = {
    query: `query($q:String!){ posts(order:VOTES, postedAfter:"${new Date(
      Date.now() - 365 * 864e5,
    ).toISOString()}", first:20, topic:$q){ edges{ node{ name website tagline description votesCount } } } }`,
    variables: { q: topicSlug },
  }
  const response = await phThrottled(() => fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT),
  }).then((r) => {
    if (!r.ok) throw new Error(`producthunt ${r.status}`)
    return r
  }))
  const data = await response.json()
  const edges = data?.data?.posts?.edges ?? []
  return edges.map(({ node }, i) => ({
    rank: i + 1,
    name: node.name,
    owner: null,
    homepage: node.website,
    repoFullName: repoOf(node.website),
    url: node.website,
    // The tagline is one marketing line and is usually too thin for the
    // assignment gate to place anything on; the longer description is what
    // actually says what the product does. Both are stored, so a row stays
    // judgeable later from what the database keeps.
    description: [node.description, node.tagline].filter(Boolean).join(' — ') || null,
    track: repoOf(node.website) ? 'oss' : 'saas',
    metrics: { ph_votes: node.votesCount ?? 0 },
  }))
}

async function npmDownloads(packageName) {
  const data = await getJson(
    `https://api.npmjs.org/downloads/point/last-year/${encodeURIComponent(packageName)}`,
  )
  return data?.downloads ?? 0
}

// ---------------------------------------------------------------------------
// fusion
// ---------------------------------------------------------------------------

const K = config.rrfK ?? 60

/** Weighted Reciprocal Rank Fusion. Operates on rank positions, not raw scores,
 * so 70,000 stars and 400 upvotes need no normalisation and neither drowns the
 * other. `k` damps the top so first place is not worth ten times second. */
function fuse(perSource) {
  const scores = new Map()
  for (const { source, origin, weight, selfPlacing, entries } of perSource) {
    // One contribution per source: a document appears once in a ranked list, so
    // if two entries resolve to the same listing, only its best rank counts.
    // Summing every occurrence is how a single row can outscore the field by an
    // order of magnitude without anything looking obviously wrong.
    const best = new Map()
    for (const entry of entries) {
      const prev = best.get(entry.key)
      if (!prev || entry.rank < prev.rank) best.set(entry.key, entry)
    }
    for (const entry of best.values()) {
      const current = scores.get(entry.key) ?? {
        score: 0,
        sources: [],
        origins: new Set(),
        selfPlacing: false,
        metrics: {},
        entry,
      }
      current.score += weight / (K + entry.rank)
      current.sources.push({ site: source, rank: entry.rank, url: entry.url })
      current.origins.add(origin)
      if (selfPlacing) current.selfPlacing = true
      Object.assign(current.metrics, entry.metrics ?? {})
      // First source to carry a blurb wins. `current.entry` is whichever source
      // saw this key first, and that is often HN, which only ever hands over a
      // link and a score — without this the GitHub description behind the same
      // row is discarded because a scoring-only source got there first.
      if (!current.entry.description && entry.description) {
        current.entry = { ...current.entry, description: entry.description }
      }
      scores.set(entry.key, current)
    }
  }
  return scores
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const url = process.env.DATABASE_URL || process.env.EASYAPP_DATABASE_URL
  if (!url) throw new Error('Missing DATABASE_URL / EASYAPP_DATABASE_URL')

  const sql = postgres(url, {
    ssl: url.includes('sslmode=disable') ? false : 'require',
    max: 4,
    connect_timeout: 15,
    connection: { search_path: '"whichtouse-schema"' },
  })

  let skillSweep = null
  const summary = { categories: 0, ranked: 0, created: 0, sourceErrors: [] }

  try {
    const categories = await sql`
      select slug, name from categories ${ONLY ? sql`where slug = ${ONLY}` : sql``} order by sort
    `

    for (const category of categories) {
      const query = config.queries?.[category.slug] ?? category.name
      const listings = await sql`
        select category_slug, tool_slug, name, owner, track, homepage,
               repo_full_name, package_name, standing, rank, reviewed_at
        from listings where category_slug = ${category.slug}
      `

      // index existing rows by the two identities we trust
      const byRepo = new Map()
      const byDomain = new Map()
      for (const row of listings) {
        if (row.repo_full_name) byRepo.set(row.repo_full_name.toLowerCase(), row)
        const d = domainOf(row.homepage)
        if (d) byDomain.set(d, row)
      }

      const perSource = []
      for (const source of config.sources) {
        if (!source.enabled) continue
        if (source.requiresEnv && !process.env[source.requiresEnv]) {
          summary.sourceErrors.push(`${source.id}: ${source.requiresEnv} not set — skipped`)
          continue
        }
        try {
          let entries = null
          if (source.id === 'github-stars') entries = await githubSearch(query, { newOnly: false })
          else if (source.id === 'github-new') entries = await githubSearch(query, { newOnly: true })
          else if (source.id === 'github-skills') {
            // Union, not replacement. The global sweep is the only thing that
            // can see a generalist repo like mattpocock/skills, whose metadata
            // names no category; the per-category topic search has far better
            // recall inside a category. Swapping one for the other cut skills
            // from 304 to 141 — the same mistake as before, made a third time.
            skillSweep ??= await sweepSkills()
            const swept = skillsForCategory(skillSweep, category.slug)
            const scoped = await githubSkillSearch(
              config.skillQueries?.[category.slug] ?? category.name,
            )
            const seen = new Set()
            entries = [...swept, ...scoped]
              .filter((e) => {
                const k = (e.repoFullName ?? e.name).toLowerCase()
                if (seen.has(k)) return false
                seen.add(k)
                return true
              })
              .map((e, i) => ({ ...e, rank: i + 1 }))
          }
          else if (source.id === 'hn') entries = await hnSearch(query, new Set(byDomain.keys()))
          else if (source.id === 'producthunt')
            entries = await productHuntSearch(config.phTopics?.[category.slug] ?? 'artificial-intelligence')
          else if (source.id === 'npm') {
            const named = listings.filter((r) => r.package_name)
            const scored = []
            for (const row of named) {
              try {
                scored.push({ row, downloads: await npmDownloads(row.package_name) })
              } catch {
                /* a missing package is not a job failure */
              }
            }
            entries = scored
              .sort((a, b) => b.downloads - a.downloads)
              .map((s, i) => ({
                rank: i + 1,
                name: s.row.name,
                owner: s.row.owner,
                homepage: s.row.homepage,
                repoFullName: s.row.repo_full_name,
                url: s.row.homepage,
                track: s.row.track,
                metrics: { npm_year: s.downloads },
              }))
          }
          if (!entries?.length) continue

          for (const entry of entries) {
            const repo = entry.repoFullName?.toLowerCase() ?? null
            const domain = domainOf(entry.homepage)
            const existing =
              (repo && byRepo.get(repo)) || (domain && byDomain.get(domain)) || null
            entry.key = existing
              ? existing.tool_slug
              : toolSlug(entry.owner, entry.name)
            entry.existing = existing ?? null
          }
          perSource.push({
            source: source.label,
            selfPlacing: source.selfPlacing === true,
            // Corroboration counts distinct origins, not queries: github-stars
            // and github-new are two views of one source and agreeing with each
            // other proves nothing.
            origin: source.origin ?? source.id,
            weight: source.weight ?? 1,
            entries,
          })
        } catch (error) {
          summary.sourceErrors.push(`${category.slug}/${source.id}: ${error.message}`)
        }
      }

      if (!perSource.length) {
        log(`${category.slug}: no sources returned, leaving as-is`)
        continue
      }

      const fused = fuse(perSource)
      const ordered = [...fused.entries()]
        .map(([key, v]) => ({ key, ...v }))
        .sort((a, b) => b.score - a.score)

      // saas/leading is human-ordered in phase 1 (§3.4): keep those rows exactly
      // where they are and let the algorithm own everything else.
      const frozen = new Set(
        listings
          .filter((r) => r.track === 'saas' && r.standing === 'leading')
          .map((r) => r.tool_slug),
      )
      const watchlisted = new Set(
        listings.filter((r) => r.standing === 'watchlist').map((r) => r.tool_slug),
      )

      const topN = config.topN ?? 10
      const minCorroboration = config.minCorroborationForNew ?? 2
      const scored = new Map(ordered.map((o) => [o.key, o]))
      const placements = []
      const nextRank = {}

      const evidenceOf = (item) =>
        item
          ? {
              score: Number(item.score.toFixed(6)),
              sources: item.sources,
              metrics: item.metrics,
            }
          : {}

      const place = (key, existing, entry, track, standing, item) => {
        const bucket = `${track}:${standing}`
        nextRank[bucket] = (nextRank[bucket] ?? 0) + 1
        if (nextRank[bucket] > topN) return
        placements.push({
          key,
          existing,
          entry,
          track,
          standing,
          rank: nextRank[bucket],
          evidence: evidenceOf(item),
        })
      }

      // 1. Reviewed listings keep `leading`. The score reorders them; a listing
      //    no source happened to mention this run keeps its place at the back
      //    rather than losing its rank — the sources decide order, never
      //    whether something a human vouched for still exists.
      const reviewedRows = listings
        .filter(
          (r) =>
            r.reviewed_at != null &&
            !frozen.has(r.tool_slug) &&
            !watchlisted.has(r.tool_slug),
        )
        .sort((a, b) => {
          const sa = scored.get(a.tool_slug)?.score ?? -1
          const sb = scored.get(b.tool_slug)?.score ?? -1
          if (sa !== sb) return sb - sa
          return (a.rank ?? 1e9) - (b.rank ?? 1e9)
        })
      for (const row of reviewedRows) {
        place(row.tool_slug, row, null, row.track, 'leading', scored.get(row.tool_slug))
      }

      // 2. Everything else is `emerging`, and only with corroboration from two
      //    distinct origins. Phase-1 sources are too thin to hand anything
      //    `leading` on their own: with GitHub the only true ranking source for
      //    repos, an unguarded run put three unknown keyword matches above
      //    aider, cline and continue. A tool nobody has opened that one source
      //    has heard of is the definition of emerging-and-unproven.
      const placed = new Set(placements.map((p) => p.key))
      for (const item of ordered) {
        if (placed.has(item.key) || frozen.has(item.key) || watchlisted.has(item.key)) continue
        // Two origins guard against keyword-match noise. A topic match is not a
        // keyword match — the author classified the repo themselves — so a
        // high-precision source stands on its own. Without this the skill track
        // can never fill: every skill source is GitHub, so it could never reach
        // two origins no matter how good the match.
        const track = item.existing?.track ?? item.entry.track ?? 'oss'

        // The assignment gate. Until this existed, the category of a row was
        // whichever category's search happened to find it — the query string
        // was the classifier, and a query of "support" collected every repo
        // that supports something. The rule scores the candidate against all
        // 25 areas and confirms or discards; it never re-files into a better
        // category, because a search that did not run for that category has
        // not seen its competition (ticket D1).
        const assignment = assignCategory({
          name: item.entry.name,
          description: item.entry.description ?? '',
          topics: item.entry.topics ?? [],
          track,
        })
        if (assignment?.slug !== category.slug) continue

        // Two distinct origins, OR an assignment confident enough to stand on
        // its own.
        //
        // The corroboration rule existed to catch keyword-match noise, and it
        // was the only guard there was. The gate above now catches that
        // directly and far better — it reads the candidate rather than
        // counting who mentioned it. Left as an absolute rule it does not
        // protect the corpus, it starves it: `github-stars` and `github-new`
        // share the `github` origin so they cannot corroborate each other, and
        // Hacker News is the only other source that ever names a repo. An oss
        // row therefore needed HN to have discussed it, which is why 47 of 75
        // emerging bands were empty while the skill track — whose source is
        // selfPlacing, so the gate was its only filter — filled normally.
        //
        // `clearsSoloBar` is deliberately stricter than the ordinary bar: a
        // row nobody else mentioned has to be unambiguous on its own text.
        const soloOk = clearsSoloBar(assignment)
        if (!soloOk && item.origins.size < minCorroboration) continue

        place(item.key, item.existing, item.entry, track, 'emerging', item)
      }

      summary.categories++
      summary.ranked += placements.length

      if (DRY) {
        const buckets = {}
        for (const p of placements) {
          const k = `${p.track}/${p.standing}`
          buckets[k] = (buckets[k] ?? 0) + 1
        }
        log(`${category.slug}: ${placements.length} placements (dry) ${JSON.stringify(buckets)}`)
        for (const p of placements.slice(0, 8)) {
          const s = p.evidence.score
          log(
            `   ${p.track}/${p.standing} #${p.rank} ${p.key} ` +
              (s == null ? 'score=— (no source mentioned it this run)' : `score=${s}`),
          )
        }
        continue
      }

      await sql.begin(async (tx) => {
        // Clear machine-owned placement for this category, then rewrite. The
        // uq_rank constraint is deferred, so intermediate states are fine.
        await tx`
          update listings set rank = null
          where category_slug = ${category.slug}
            and standing <> 'watchlist'
            and not (track = 'saas' and standing = 'leading')
        `
        for (const p of placements) {
          if (p.existing) {
            await tx`
              update listings set
                standing = ${p.standing}, rank = ${p.rank},
                evidence = ${tx.json(p.evidence)}, refreshed_at = now(),
                source_description = coalesce(source_description, ${p.entry?.description ?? null}),
                updated_at = now()
              where category_slug = ${category.slug} and tool_slug = ${p.key}
            `
          } else {
            summary.created++
            await tx`
              insert into listings (
                category_slug, tool_slug, name, owner, track, homepage,
                repo_full_name, standing, rank, evidence, source_description,
                refreshed_at
              ) values (
                ${category.slug}, ${p.key}, ${p.entry.name}, ${p.entry.owner},
                ${p.track}, ${p.entry.homepage}, ${p.entry.repoFullName},
                ${p.standing}, ${p.rank}, ${tx.json(p.evidence)},
                ${p.entry?.description ?? null}, now()
              )
              on conflict (category_slug, tool_slug) do update set
                standing = excluded.standing, rank = excluded.rank,
                evidence = excluded.evidence, refreshed_at = now(),
                source_description = coalesce(
                  listings.source_description, excluded.source_description),
                updated_at = now()
            `
          }
        }
        await tx`
          update categories set refreshed_at = now(), updated_at = now()
          where slug = ${category.slug}
        `
      })
      log(`${category.slug}: ${placements.length} placements written`)
    }
  } finally {
    await sql.end({ timeout: 5 })
  }

  log('done', JSON.stringify({ ...summary, sourceErrors: summary.sourceErrors.length }))
  // Source failures are reported, never silent — a job that quietly ranks on
  // half its inputs is worse than one that fails.
  for (const e of summary.sourceErrors) console.warn('  source:', e)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
