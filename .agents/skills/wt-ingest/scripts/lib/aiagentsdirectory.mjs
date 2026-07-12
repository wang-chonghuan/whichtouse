// app/SaaS track discovery + signal via aiagentsdirectory public API.
// Directory-as-seed: we filter its categorized entries to our category (a few
// matched pages worth), take top-N by upvotes — we do NOT mirror the whole DB.
// overall_signal = upvotes; growth_signal = upvotes for recently-added entries.

let _agents = null
async function fetchAgents() {
  if (_agents) return _agents
  const res = await fetch('https://aiagentsdirectory.com/api/agents', {
    headers: { 'User-Agent': 'whichtouse-ingest', Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`aiagentsdirectory /api/agents -> ${res.status}`)
  const body = await res.json()
  _agents = Array.isArray(body) ? body : body.agents || body.data || []
  return _agents
}

const txt = (a) =>
  `${a.name || ''} ${a.category || ''} ${a.industry || ''} ${a.description || ''} ${(a.keyFeatures || []).join(' ')} ${(a.useCases || []).join(' ')}`.toLowerCase()

// Top-N SaaS/app entries for a category (matched by any term), by upvotes.
export async function topForCategory(matchTerms, { limit = 10 } = {}) {
  const agents = await fetchAgents()
  const terms = matchTerms.map((t) => t.toLowerCase())
  const matched = agents
    .filter((a) => a.name && terms.some((t) => txt(a).includes(t)))
    // app/SaaS track: exclude clearly open-source entries (those belong to repo track)
    .filter((a) => !/open/i.test(a.access || ''))
    .map((a) => {
      const upvotes = Number(a.upvotes || 0)
      // growth proxy: upvotes per month since listed ("new & upvoted" = rising)
      let growth = null
      if (upvotes && a.createdAt) {
        const months = (Date.now() - Date.parse(a.createdAt)) / (30 * 24 * 3600 * 1000)
        if (months > 0) growth = Math.round(upvotes / Math.max(months, 1))
      }
      return {
        name: a.name,
        url: a.website || a.url || (a.slug ? `https://aiagentsdirectory.com/agent/${a.slug}` : null),
        homepage: a.website || a.url || null,
        pricing: a.pricingModel || a.access || null,
        upvotes,
        growth,
      }
    })
    .sort((x, y) => y.upvotes - x.upvotes)
  return matched.slice(0, limit)
}
