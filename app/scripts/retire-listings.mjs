#!/usr/bin/env node
// Take a placement off the board and keep it off.
//
//   node --env-file=.env scripts/retire-listings.mjs pending
//   node --env-file=.env scripts/retire-listings.mjs retire < reasons.json
//   node --env-file=.env scripts/retire-listings.mjs restore <category> <tool>
//   node --env-file=.env scripts/retire-listings.mjs list
//
// A row gets retired when someone opened its link and found that the tool does
// not belong in this category, or does not exist any more. Discovery cannot see
// either of those: the source still lists it and the score is still fine. So
// deleting the row would only mean re-discovering it tomorrow and opening the
// same dead link again. The row stays, unranked, carrying the verdict.
//
// `pending` reads the verdicts the description pass already recorded. That pass
// writes `best_for = ''` for a row it judged misfiled — an empty string means
// "looked at, deliberately no line", as against null for "never looked at".
// Those rows are still ranked and still rendering, just blank; this is the
// command that finishes the job.
//
// reasons.json is { "<category_slug>": { "<tool_slug>": "<reason>" } }. A row
// listed with an empty reason falls back to the generic verdict, which says
// only what is actually known.

import postgres from 'postgres'

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

const GENERIC =
  'A researcher opened the link and found no tool that belongs in this area — ' +
  'either it is a different kind of product, or it is no longer reachable.'

const [cmd, ...rest] = process.argv.slice(2)

const readStdin = async () => {
  const chunks = []
  for await (const c of process.stdin) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) throw new Error('nothing on stdin')
  return JSON.parse(raw)
}

try {
  if (cmd === 'pending') {
    const rows = await sql`
      select category_slug, tool_slug, name from listings
      where rank is not null and standing = 'emerging'
        and best_for = '' and retired_at is null
      order by category_slug, tool_slug`
    if (!rows.length) {
      console.log('no rows carry a misfiled verdict without being retired')
    } else {
      for (const r of rows) console.log(`${r.category_slug}\t${r.tool_slug}\t${r.name}`)
      console.log(`\n${rows.length} rows`)
    }
  } else if (cmd === 'retire') {
    const input = await readStdin()
    let n = 0
    let missed = 0
    for (const [category, tools] of Object.entries(input)) {
      for (const [tool, reason] of Object.entries(tools)) {
        // Only ever retires a row that exists. A typo in a slug should read as
        // "nothing matched", not as a silent no-op inside a count of successes.
        const done = await sql`
          update listings
          set retired_at = now(), retired_reason = ${reason?.trim() || GENERIC},
              rank = null, updated_at = now()
          where category_slug = ${category} and tool_slug = ${tool}
            and retired_at is null
          returning tool_slug`
        if (done.length) n++
        else {
          missed++
          console.log(`  ${category}/${tool}: no such row, or already retired`)
        }
      }
    }
    console.log(`retired ${n} rows${missed ? `, ${missed} skipped` : ''}`)
  } else if (cmd === 'restore') {
    const [category, tool] = rest
    if (!category || !tool) throw new Error('usage: restore <category> <tool>')
    const done = await sql`
      update listings set retired_at = null, retired_reason = null, updated_at = now()
      where category_slug = ${category} and tool_slug = ${tool}
      returning tool_slug`
    console.log(done.length ? 'restored — the next refresh may rank it again' : 'no such row')
  } else if (cmd === 'list') {
    const rows = await sql`
      select category_slug, tool_slug, retired_reason from listings
      where retired_at is not null order by category_slug, tool_slug`
    for (const r of rows) console.log(`${r.category_slug}/${r.tool_slug}: ${r.retired_reason}`)
    console.log(`\n${rows.length} retired`)
  } else {
    console.log('usage: retire-listings.mjs pending | retire | restore <cat> <tool> | list')
    process.exitCode = 1
  }
} finally {
  await sql.end({ timeout: 5 })
}
