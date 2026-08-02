#!/usr/bin/env node
// Appends one row per category to before_you_pick_runs.
//
//   node --env-file=.env scripts/record-byp-run.mjs --batch 1 [<slug> ...]
//
// The table is the record of every investigation; categories.pick_* is the
// published answer the site renders. This script writes the record, never the
// published copy — publishing is scripts/publish-before-you-pick.mjs, and
// keeping them apart is the point: a run can be recorded without being shipped.
//
// Rows are only ever inserted. Re-running with the same batch would duplicate,
// so the batch is checked first.

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(p, 'utf8')
const json = (p) => JSON.parse(read(p))

const args = process.argv.slice(2)
const bi = args.indexOf('--batch')
if (bi === -1) {
  console.error('usage: record-byp-run.mjs --batch <n> [<slug> ...]')
  process.exit(2)
}
const batchId = Number(args[bi + 1])
if (!Number.isInteger(batchId)) throw new Error('--batch must be an integer')
const only = args.filter((a, i) => i !== bi && i !== bi + 1 && !a.startsWith('--'))

// Editorial changes made after research and before publication. Recorded
// because the published line is then not purely what the researcher returned,
// and a record that hides its own edits is not a record.
const EDITS = json(join(appDir, 'src/content/byp-edits.json'))

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

try {
  const [{ n: existing }] = await sql`
    select count(*)::int as n from before_you_pick_runs where batch_id = ${batchId}`
  if (existing > 0) {
    console.error(`batch ${batchId} already has ${existing} rows — refusing to duplicate`)
    process.exit(1)
  }

  const cats = json(join(appDir, 'src/content/categories.json'))
  const targets = only.length ? cats.filter((c) => only.includes(c.slug)) : cats
  let written = 0

  for (const cat of targets) {
    const content = json(join(appDir, 'src/content/c', `${cat.slug}.json`))
    const tips = content.beforeYouPick
    if (!tips?.weigh && !tips?.avoid && !tips?.moving) continue

    // The brief the researcher was actually given. Kept verbatim: it is the
    // only reproducible part of the investigation now that the subagent
    // transcripts are gone.
    const promptPath = `/tmp/byp/${cat.slug}.txt`
    const prompt = existsSync(promptPath) ? read(promptPath) : null

    const details = {
      sources: tips.sources ?? [],
      prompt,
      promptSource: prompt ? `n-tooltrend research-prompt, filled for ${cat.slug}` : null,
      researchedAt: tips.updated ?? null,
      edits: EDITS[cat.slug] ?? null,
      note:
        'Subagent reasoning was not retained — the task transcripts were empty ' +
        'by the time this row was written. Future batches should capture the ' +
        "agent's own evidence trail here.",
    }

    await sql`
      insert into before_you_pick_runs
        (category_slug, category_name, byp_summary, byp_details, batch_id)
      values (
        ${cat.slug}, ${cat.name},
        ${sql.json({ weigh: tips.weigh ?? null, avoid: tips.avoid ?? null, moving: tips.moving ?? null })},
        ${sql.json(details)}, ${batchId}
      )`
    written++
  }

  const [{ n }] = await sql`select count(*)::int as n from before_you_pick_runs`
  console.log(`batch ${batchId}: inserted ${written} rows; table now holds ${n}`)
} finally {
  await sql.end({ timeout: 5 })
}
