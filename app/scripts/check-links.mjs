#!/usr/bin/env node
// Open every ranked row's link and report the ones a reader could not follow.
//
//   node --env-file=.env scripts/check-links.mjs            # all ranked rows
//   node --env-file=.env scripts/check-links.mjs <category> # one area
//
// The per-row research pass turned up dead domains, domains sold on to
// unrelated businesses, and links pointing at a Medium paywall or the author's
// LinkedIn rather than the project. That pass cost a day of agent time. This
// is the cheap continuous version of it: it cannot tell whether a link points
// at the right product, but it can tell whether it points at anything.
//
// It reports and never edits. Two reasons. A site can be down for an hour, and
// a lot of perfectly live sites answer 403 to anything without a browser —
// notelyvoice.com and whisperweb.online both do. Retiring on a single failed
// request would delete good rows; that call belongs to a person reading the
// report, via scripts/retire-listings.mjs.

import postgres from 'postgres'

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const CONCURRENCY = 8
const TIMEOUT = 15000

// Severity, not just status. A name that does not resolve is a different
// problem from a server that turns away robots, and lumping them together is
// what makes a link report get ignored.
const GONE = 'gone' //   nothing is there: DNS failure, refused, 404, 410
const BLOCKED = 'blocked' // something is there but will not talk to a script
const SLOW = 'slow' //   no answer inside the timeout

async function check(link) {
  try {
    const r = await fetch(link, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (r.status === 404 || r.status === 410) return { kind: GONE, detail: `HTTP ${r.status}` }
    // 999 is LinkedIn's private code for "you are a robot".
    if ([401, 403, 429, 999].includes(r.status)) return { kind: BLOCKED, detail: `HTTP ${r.status}` }
    // One 5xx is a bad minute, not a dead product — microsoft.com/excel served
    // a 500 on the first sweep. Report it, but never as gone.
    if (r.status >= 500) return { kind: SLOW, detail: `HTTP ${r.status}` }
    // A redirect that lands on a different registrable domain is the shape of
    // a domain that has been sold on — featureflux.com now serves an
    // Indonesian betting site. Worth naming even though it answers 200.
    const from = new URL(link).hostname.replace(/^www\./, '')
    const to = new URL(r.url).hostname.replace(/^www\./, '')
    if (from !== to && !to.endsWith(from) && !from.endsWith(to))
      return { kind: 'moved', detail: `now ${to}` }
    return null
  } catch (error) {
    const msg = String(error?.cause?.code || error?.message || error)
    if (/TimeoutError|timed out|aborted|CONNECT_TIMEOUT/i.test(msg))
      return { kind: SLOW, detail: 'no answer' }
    // gemini.google.com sends more header bytes than undici will accept. The
    // site is fine; our client is what gave up.
    if (/HEADERS_OVERFLOW/i.test(msg)) return { kind: BLOCKED, detail: 'response too large to parse' }
    return { kind: GONE, detail: msg.replace(/^.*(ENOTFOUND|ECONNREFUSED|EAI_AGAIN).*$/, '$1') }
  }
}

try {
  const only = process.argv[2]
  const rows = await sql`
    select category_slug, tool_slug, name, homepage from listings
    where rank is not null and homepage is not null and retired_at is null
      ${only ? sql`and category_slug = ${only}` : sql``}
    order by category_slug, tool_slug`

  const findings = []
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY)
    const out = await Promise.all(batch.map((r) => check(r.homepage)))
    batch.forEach((r, j) => out[j] && findings.push({ ...r, ...out[j] }))
    process.stderr.write(`\rchecked ${Math.min(i + CONCURRENCY, rows.length)}/${rows.length}`)
  }
  process.stderr.write('\n')

  for (const kind of [GONE, 'moved', BLOCKED, SLOW]) {
    const group = findings.filter((f) => f.kind === kind)
    if (!group.length) continue
    console.log(`\n## ${kind} (${group.length})`)
    for (const f of group) {
      console.log(`  ${f.category_slug}/${f.tool_slug}  ${f.detail}\n    ${f.homepage}`)
    }
  }
  const gone = findings.filter((f) => f.kind === GONE || f.kind === 'moved').length
  console.log(
    `\n${rows.length} links checked, ${findings.length} worth a look, ` +
      `${gone} of them likely dead or moved.`,
  )
  if (gone) console.log('Retire with: node --env-file=.env scripts/retire-listings.mjs retire')
} finally {
  await sql.end({ timeout: 5 })
}
