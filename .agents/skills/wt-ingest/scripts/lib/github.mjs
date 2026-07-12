// GitHub investigation for wt-ingest: discover repos by keyword, read stars,
// approximate last-30d star growth from stargazer timestamps.
// Auth: uses the local `gh` CLI token (gh auth token) — no hardcoded secret.
import { execSync } from 'node:child_process'

let _token = null
function token() {
  if (_token) return _token
  _token = execSync('gh auth token', { encoding: 'utf8' }).trim()
  return _token
}

async function gh(path, accept = 'application/vnd.github+json') {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: accept,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'whichtouse-ingest',
    },
  })
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status}`)
  return res
}

// Search top repos for a set of keywords (OR'd), sorted by stars.
// GitHub caps boolean operators, so keep to <=5 OR terms and quote phrases;
// filter by minStars client-side rather than with a qualifier.
export async function searchRepos(keywords, { limit = 40, minStars = 30 } = {}) {
  const terms = keywords.slice(0, 5).map((k) => (/\s/.test(k) ? `"${k}"` : k))
  const q = encodeURIComponent(terms.join(' OR '))
  const res = await gh(`/search/repositories?q=${q}&sort=stars&order=desc&per_page=${Math.min(limit, 50)}`)
  const body = await res.json()
  return (body.items || [])
    .filter((r) => (r.stargazers_count || 0) >= minStars)
    .map((r) => ({
    fullName: r.full_name,
    name: r.name,
    url: r.html_url,
    homepage: r.homepage || null,
    stars: r.stargazers_count,
    description: r.description || '',
    topics: r.topics || [],
    license: r.license?.spdx_id || null,
    created: r.created_at || null,
    // heuristic form factor: MCP server / agent-skill vs general repo
    looksSkill: /\b(mcp|claude[- ]?skill|agent[- ]?skill|skillset)\b/i.test(
      `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`,
    ),
  }))
}

// Dedicated skill/MCP discovery: per-term `<term> mcp` AND-searches, merged by stars.
export async function searchSkills(terms, { perTerm = 12, minStars = 8 } = {}) {
  const seen = new Map()
  for (const t of terms.slice(0, 3)) {
    try {
      const q = encodeURIComponent(`${t} mcp`)
      const res = await gh(`/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perTerm}`)
      const body = await res.json()
      for (const r of body.items || []) {
        if ((r.stargazers_count || 0) < minStars || seen.has(r.full_name)) continue
        // precision: real MCP servers/skills almost always carry "mcp" in the repo
        // name (mcp-*, *-mcp-server). Keeps generic big repos out of the skill track.
        if (!/mcp/i.test(r.name)) continue
        seen.set(r.full_name, {
          fullName: r.full_name,
          name: r.name,
          url: r.html_url,
          homepage: r.homepage || null,
          stars: r.stargazers_count,
          description: r.description || '',
          topics: r.topics || [],
          license: r.license?.spdx_id || null,
          created: r.created_at || null,
          looksSkill: true,
        })
      }
    } catch {
      // skip a failed term
    }
  }
  return [...seen.values()].sort((a, b) => b.stars - a.stars)
}

// Approximate stars gained in the last 30 days by sampling the most recent
// stargazer page (ordered oldest-first, so the last page is the newest).
export async function growthLast30d(fullName, stars) {
  try {
    const perPage = 100
    const lastPage = Math.max(1, Math.ceil((stars || 0) / perPage))
    const res = await gh(
      `/repos/${fullName}/stargazers?per_page=${perPage}&page=${lastPage}`,
      'application/vnd.github.star+json',
    )
    const arr = await res.json()
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000
    const recent = (Array.isArray(arr) ? arr : []).filter(
      (s) => s.starred_at && new Date(s.starred_at).getTime() >= cutoff,
    ).length
    return recent
  } catch {
    return null
  }
}
