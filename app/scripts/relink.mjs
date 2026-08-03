#!/usr/bin/env node
// Point a row's link at where the thing actually lives.
//
//   node --env-file=.env scripts/relink.mjs to-repo [--apply]
//   node --env-file=.env scripts/relink.mjs set < links.json
//
// `to-repo` handles the commonest defect on its own: a row whose link is a
// dead demo deployment — a Vercel preview that 404s, a Railway app whose free
// tier expired — while the GitHub repo it was built from is alive and already
// recorded on the row. The repo is the durable address; the demo never was.
// Deterministic, so it does not need a human deciding one row at a time.
//
// `set` takes { "<category>": { "<tool>": "<url>" } } for everything else.
// Rebrands must go through here rather than being followed automatically: a
// redirect to a new domain looks identical whether the company renamed itself
// or sold the domain to someone else, and featureflux.com now points at a
// betting site. Following that automatically would publish it.

import postgres from 'postgres'

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

const dead = async (link) => {
  try {
    const r = await fetch(link, {
      redirect: 'follow',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(15000),
    })
    return r.status === 404 || r.status === 410
  } catch (error) {
    const msg = String(error?.cause?.code || error?.message || error)
    return /ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN/.test(msg)
  }
}

try {
  const [cmd] = process.argv.slice(2)

  if (cmd === 'to-repo') {
    const APPLY = process.argv.includes('--apply')
    const rows = await sql`
      select category_slug, tool_slug, homepage, repo_full_name from listings
      where rank is not null and retired_at is null
        and repo_full_name is not null
        and homepage is not null
        and homepage not like '%github.com%'
      order by category_slug, tool_slug`
    console.log(`${rows.length} candidates (ranked, has a repo, links elsewhere)`)

    let fixed = 0
    for (let i = 0; i < rows.length; i += 8) {
      const batch = rows.slice(i, i + 8)
      const verdicts = await Promise.all(batch.map((r) => dead(r.homepage)))
      for (const [j, row] of batch.entries()) {
        if (!verdicts[j]) continue
        const next = `https://github.com/${row.repo_full_name}`
        console.log(`  ${row.category_slug}/${row.tool_slug}\n    ${row.homepage}\n    -> ${next}`)
        if (APPLY) {
          await sql`update listings set homepage = ${next}, updated_at = now()
            where category_slug = ${row.category_slug} and tool_slug = ${row.tool_slug}`
        }
        fixed++
      }
      process.stderr.write(`\rchecked ${Math.min(i + 8, rows.length)}/${rows.length}`)
    }
    process.stderr.write('\n')
    console.log(`${APPLY ? 'repointed' : 'would repoint'} ${fixed} rows`)
  } else if (cmd === 'follow') {
    // Follow the redirect and keep where it lands — but only for rows named on
    // stdin as { "<category>": ["<tool>", ...] }. The naming is the safety
    // interlock: a rebrand and a domain sold to a stranger produce the same
    // 301, so a person has to have looked at each one first.
    const chunks = []
    for await (const c of process.stdin) chunks.push(c)
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    const APPLY = process.argv.includes('--apply')
    let n = 0
    for (const [category, tools] of Object.entries(input)) {
      for (const tool of tools) {
        const [row] = await sql`select homepage from listings
          where category_slug = ${category} and tool_slug = ${tool}`
        if (!row?.homepage) {
          console.log(`  ${category}/${tool}: no such row`)
          continue
        }
        let next = null
        try {
          const r = await fetch(row.homepage, {
            redirect: 'follow',
            headers: { 'User-Agent': UA },
            signal: AbortSignal.timeout(15000),
          })
          const u = new URL(r.url)
          u.hash = ''
          next = u.toString()
        } catch {
          /* leave it alone rather than guess */
        }
        if (!next || next === row.homepage) {
          console.log(`  ${category}/${tool}: unchanged`)
          continue
        }
        console.log(`  ${category}/${tool}\n    ${row.homepage}\n    -> ${next}`)
        if (APPLY) {
          await sql`update listings set homepage = ${next}, updated_at = now()
            where category_slug = ${category} and tool_slug = ${tool}`
        }
        n++
      }
    }
    console.log(`${APPLY ? 'repointed' : 'would repoint'} ${n} rows`)
  } else if (cmd === 'set') {
    const chunks = []
    for await (const c of process.stdin) chunks.push(c)
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    let n = 0
    for (const [category, tools] of Object.entries(input)) {
      for (const [tool, next] of Object.entries(tools)) {
        const done = await sql`
          update listings set homepage = ${next}, updated_at = now()
          where category_slug = ${category} and tool_slug = ${tool}
          returning tool_slug`
        if (done.length) n++
        else console.log(`  ${category}/${tool}: no such row`)
      }
    }
    console.log(`repointed ${n} rows`)
  } else {
    console.log(
      'usage: relink.mjs to-repo [--apply] | follow [--apply] < rows.json | set < links.json',
    )
    process.exitCode = 1
  }
} finally {
  await sql.end({ timeout: 5 })
}
