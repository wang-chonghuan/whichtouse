#!/usr/bin/env node
// Fill `source_description` on rows that predate the column.
//
//   node --env-file=.env scripts/backfill-source-description.mjs [--limit N]
//
// The refresh job captures the blurb at discovery now, but every row created
// before it did has none, and those rows are exactly the emerging half of the
// site — machine-placed, so nobody ever wrote a line about them.
//
// Reads through `gh api graphql` rather than the REST API: unauthenticated REST
// is 60 requests an hour and there are 250-odd repos to ask about, which is a
// four-hour job. GraphQL takes fifty aliased lookups per request and gh already
// holds a token, so the same work is six requests.
//
// Only repo-backed rows can be filled this way. A hosted product discovered by
// domain has no equivalent endpoint; those stay null and the generation pass
// has to work from the page itself.

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import postgres from 'postgres'

const run = promisify(execFile)
const CHUNK = 50

const args = process.argv.slice(2)
const li = args.indexOf('--limit')
const LIMIT = li > -1 ? Number(args[li + 1]) : null

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

/** GraphQL rejects an alias starting with a digit, and repo names are full of
 * characters an alias cannot carry, so the alias is positional and the mapping
 * is kept on our side. */
const aliasOf = (i) => `r${i}`

try {
  const rows = await sql`
    select category_slug, tool_slug, repo_full_name
    from listings
    where source_description is null
      and repo_full_name is not null
      and standing <> 'watchlist'
      and rank is not null
    order by category_slug, tool_slug
    ${LIMIT ? sql`limit ${LIMIT}` : sql``}`

  console.log(`${rows.length} repo-backed rows without a source description`)
  if (rows.length === 0) process.exit(0)

  let filled = 0
  let empty = 0
  let missing = 0

  for (let start = 0; start < rows.length; start += CHUNK) {
    const chunk = rows.slice(start, start + CHUNK)
    const fields = chunk
      .map((row, i) => {
        const [owner, name] = row.repo_full_name.split('/')
        // Escaped rather than interpolated raw: a repo name is attacker-chosen
        // text and this string becomes a query.
        const q = (s) => JSON.stringify(String(s ?? ''))
        return `${aliasOf(i)}: repository(owner:${q(owner)}, name:${q(name)}){ description }`
      })
      .join('\n')

    let data
    try {
      const { stdout } = await run(
        'gh',
        ['api', 'graphql', '-f', `query={ ${fields} }`],
        { maxBuffer: 8 << 20 },
      )
      data = JSON.parse(stdout)
    } catch (error) {
      // A deleted or renamed repo makes the whole document return errors
      // alongside partial data; gh exits non-zero but still prints the body.
      const body = error.stdout ? JSON.parse(error.stdout) : null
      if (!body?.data) throw error
      data = body
    }

    for (const [i, row] of chunk.entries()) {
      const node = data.data?.[aliasOf(i)]
      if (!node) {
        missing++
        continue
      }
      const description = node.description?.trim()
      if (!description) {
        empty++
        continue
      }
      await sql`
        update listings set source_description = ${description}, updated_at = now()
        where category_slug = ${row.category_slug} and tool_slug = ${row.tool_slug}`
      filled++
    }
    console.log(`  ${Math.min(start + CHUNK, rows.length)}/${rows.length}`)
  }

  console.log(`\nfilled ${filled}, blank on GitHub ${empty}, repo gone ${missing}`)
} finally {
  await sql.end()
}
