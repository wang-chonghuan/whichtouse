#!/usr/bin/env node
// Publishes only the pick_* columns for the given slugs.
//
//   node --env-file=.env scripts/publish-before-you-pick.mjs <slug> [<slug> ...]
//   node --env-file=.env scripts/publish-before-you-pick.mjs --all
//
// Deliberately not scripts/import-content.mjs. That upserts every listing and
// overwrites `standing` and `rank` from the corpus, which would discard
// whatever the daily refresh job has computed since — a silent, total revert of
// the ranking, triggered by wanting to publish three sentences.

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(p, 'utf8'))

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) {
  console.error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
  process.exit(1)
}

const args = process.argv.slice(2)
const slugs = args.includes('--all')
  ? read(join(appDir, 'src/content/categories.json')).map((c) => c.slug)
  : args
if (slugs.length === 0) {
  console.error('usage: publish-before-you-pick.mjs <slug> [<slug> ...] | --all')
  process.exit(2)
}

const sql = postgres(url, { max: 1 })
let written = 0
let skipped = 0
try {
  for (const slug of slugs) {
    let tips
    try {
      tips = read(join(appDir, 'src/content/c', `${slug}.json`)).beforeYouPick
    } catch {
      console.warn(`${slug}: no corpus file`)
      continue
    }
    // Nothing researched yet is a normal state, not an error: the card simply
    // does not render. Writing nulls over an existing row would be worse.
    if (!tips || (!tips.weigh && !tips.avoid && !tips.moving)) {
      skipped++
      continue
    }
    const [row] = await sql`
      update categories set
        pick_weigh = ${tips.weigh ?? null},
        pick_avoid = ${tips.avoid ?? null},
        pick_moving = ${tips.moving ?? null},
        pick_sources = ${sql.json(tips.sources ?? [])},
        pick_updated_at = ${tips.updated ? new Date(`${tips.updated}T00:00:00Z`) : null},
        updated_at = now()
      where slug = ${slug}
      returning slug`
    if (!row) {
      console.warn(`${slug}: no such category in the database`)
      continue
    }
    written++
    console.log(`${slug}: published`)
  }
  const [{ n }] = await sql`select count(*)::int as n from categories where pick_weigh is not null`
  const [{ total }] = await sql`select count(*)::int as total from categories`
  console.log(`\nwritten ${written}, skipped ${skipped} (nothing researched)`)
  console.log(`categories with a card: ${n} of ${total}`)
} finally {
  await sql.end({ timeout: 5 })
}
