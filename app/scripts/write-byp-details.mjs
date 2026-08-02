#!/usr/bin/env node
// Fill in the reader-facing half of a recorded "Before you pick" run.
//
//   node --env-file=.env scripts/write-byp-details.mjs --batch <n> < details.json
//
// `record-byp-run.mjs` writes the row: the three published lines, and in `meta`
// the brief the researcher was given. This writes `byp_details` — the expansion
// behind each line, which the card reveals under "View all".
//
// Two columns, two audiences, and the split is the point. `meta` is provenance:
// the prompt, the edit log, what the run cost. Nobody reads it but us.
// `byp_details` is prose a buyer opens because the one-liner interested them
// and they want the evidence under it. Anything that reads like an audit trail
// belongs in the other column.
//
// Input is {"<slug>": {"details": {"weigh": "...", "avoid": "...",
// "moving": "..."}, "sources": [...]}} — the shape the expansion subagents
// return, so their output can be piped here without hand-editing.

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LINES = ['weigh', 'avoid', 'moving']

const args = process.argv.slice(2)
const bi = args.indexOf('--batch')
if (bi === -1) {
  console.error('usage: write-byp-details.mjs --batch <n> < details.json')
  process.exit(2)
}
const batchId = Number(args[bi + 1])
if (!Number.isInteger(batchId)) throw new Error('--batch must be an integer')
const raw = readFileSync(0, 'utf8')
const input = JSON.parse(raw.includes('```') ? raw.split('```')[1].replace(/^json\n/, '') : raw)

// A detail that is one sentence longer than the line it expands is not an
// expansion — it is the same claim restated, which is the failure mode worth
// catching automatically. The published lines cap at 25 words; anything under
// 60 here is not carrying evidence.
const MIN_WORDS = 60
const issues = []
for (const [slug, entry] of Object.entries(input)) {
  const details = entry?.details
  if (!details) {
    issues.push(`${slug}: no \`details\` object`)
    continue
  }
  for (const key of LINES) {
    const d = details[key]
    if (d === undefined || d === '') continue // an unexpanded line stays unexpanded
    if (typeof d !== 'string') {
      issues.push(`${slug}.${key}: not a string`)
      continue
    }
    const words = d.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
    if (words < MIN_WORDS) issues.push(`${slug}.${key}: ${words} words — too short to be an expansion`)
  }
}
if (issues.length) {
  console.error('refusing to write:')
  for (const i of issues) console.error('  ' + i)
  process.exit(1)
}

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

try {
  let written = 0
  for (const [slug, entry] of Object.entries(input)) {
    // Stored per point as `{detail: "..."}` rather than a bare string. The
    // extra nesting is what lets a later pass hang per-point sources or a
    // freshness date off one line without migrating the column.
    const details = {}
    for (const key of LINES) if (entry.details[key]) details[key] = { detail: entry.details[key] }

    // Merged, not replaced. Rewriting one point is the common case — a line
    // gets corrected, or its detail reads badly — and a full replace would
    // silently drop the two points you did not resupply.
    const rows = await sql`
      update before_you_pick_runs
         set byp_details = byp_details || ${sql.json(details)}
       where category_slug = ${slug} and batch_id = ${batchId}
      returning category_code`
    if (rows.length === 0) {
      console.error(`  ${slug}: no batch ${batchId} row — skipped`)
      continue
    }

    // The expansion frequently reaches sources the original run never saw; the
    // legal expansion added a whole benchmark paper. Keeping them here rather
    // than merging into the run's own source list preserves which pass found
    // what, so a claim can be traced to the search that produced it.
    if (entry.sources?.length) {
      await sql`
        update before_you_pick_runs
           set meta = meta || ${sql.json({ detailSources: entry.sources })}
         where category_slug = ${slug} and batch_id = ${batchId}`
    }
    console.log(`  ${rows[0].category_code.padEnd(22)} ${Object.keys(details).length}/3 expanded`)
    written++
  }

  console.log(`\n${written} categories given detail in batch ${batchId}`)
} finally {
  await sql.end()
}
