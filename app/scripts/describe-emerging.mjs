#!/usr/bin/env node
// Give machine-placed rows the one line that sits under their name.
//
//   node --env-file=.env scripts/describe-emerging.mjs due
//   node --env-file=.env scripts/describe-emerging.mjs prompt <slug>
//   node --env-file=.env scripts/describe-emerging.mjs apply <slug> < result.json
//
// Leading rows get `best_for` from a human writing the corpus. Emerging rows
// are placed by the refresh job and arrive with a name and a link, so the
// column reads as ten unfamiliar words stacked on top of each other.
//
// The prompt lives in .agents/skills/wt-enrich/references/best-for-prompt.md
// with the reasoning behind each rule. What lives here is the deterministic
// half: which rows need a line, filling the prompt from the database, and
// refusing what comes back if it is the wrong shape.

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PROMPT_DOC = join(
  appDir,
  '../.agents/skills/wt-enrich/references/best-for-prompt.md',
)

const url = process.env.EASYAPP_DATABASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('Missing EASYAPP_DATABASE_URL / DATABASE_URL')
const sql = postgres(url, { max: 1 })

const needsLine = (slug) => sql`
  select l.category_slug, l.tool_slug, l.name, l.owner, l.track,
         l.homepage, l.repo_full_name, l.source_description
  from listings l
  where l.standing = 'emerging'
    and l.rank is not null
    and (l.best_for is null or btrim(l.best_for) = '')
    ${slug ? sql`and l.category_slug = ${slug}` : sql``}
  order by l.category_slug, l.track, l.rank`

// ---------------------------------------------------------------------------
async function due() {
  const rows = await needsLine(null)
  const byCategory = new Map()
  for (const row of rows) {
    byCategory.set(row.category_slug, (byCategory.get(row.category_slug) ?? 0) + 1)
  }
  if (byCategory.size === 0) {
    console.log('every ranked emerging row has a line')
    return
  }
  for (const [slug, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
    console.log(`${slug.padEnd(24)} ${String(n).padStart(3)} rows`)
  }
  console.log(`\n${rows.length} rows across ${byCategory.size} areas`)
}

// ---------------------------------------------------------------------------
async function prompt(slug) {
  const rows = await needsLine(slug)
  if (rows.length === 0) throw new Error(`${slug}: nothing to describe`)

  const doc = readFileSync(PROMPT_DOC, 'utf8')
  const body = doc.split('```text')[1]?.split('```')[0]?.trim()
  if (!body) throw new Error('no ```text block in the prompt doc')

  const [meta] = await sql`select name, note from categories where slug = ${slug}`
  if (!meta) throw new Error(`${slug} is not a category`)

  const index = JSON.parse(readFileSync(join(appDir, 'src/content/categories.json'), 'utf8'))
  const blurb = index.find((c) => c.slug === slug)?.blurb ?? meta.name

  // The row block is the whole input. `id` is the tool_slug and is what the
  // answer is keyed by, so it has to survive the round trip verbatim.
  const block = rows
    .map((row) => {
      const lines = [
        `- id: ${row.tool_slug}`,
        `  name: ${row.name}`,
        `  link: ${row.homepage ?? (row.repo_full_name ? `https://github.com/${row.repo_full_name}` : '(none)')}`,
      ]
      if (row.repo_full_name) lines.push(`  repo: ${row.repo_full_name}`)
      lines.push(
        row.source_description
          ? `  says of itself: ${row.source_description.replace(/\s+/g, ' ').trim()}`
          : '  says of itself: (nothing captured — open the link)',
      )
      return lines.join('\n')
    })
    .join('\n')

  const filled = body
    .replaceAll('{{CATEGORY}}', meta.name)
    .replaceAll('{{CATEGORY_BLURB}}', blurb)
    .replaceAll('{{ROWS}}', `ROWS (${rows.length}):\n\n${block}`)

  const left = filled.match(/\{\{(\w+)\}\}/g)
  if (left) throw new Error(`unfilled placeholders: ${[...new Set(left)].join(', ')}`)
  process.stdout.write(filled + '\n')
}

// ---------------------------------------------------------------------------
// Structural checks only. Whether a line is true is the researcher's problem
// and the reviewer's; whether it is the right shape is checkable, and these
// are the failures the prompt is written against.
const MIN_WORDS = 8
const MAX_WORDS = 30
const MARKETING =
  /\b(powerful|seamless|blazing|comprehensive|cutting[- ]edge|revolutionary|best[- ]in[- ]class|state[- ]of[- ]the[- ]art|game[- ]chang\w+)\b/i
const EMOJI = /\p{Extended_Pictographic}/u

async function apply(slug) {
  const raw = readFileSync(0, 'utf8')
  const json = raw.includes('```') ? raw.split('```')[1].replace(/^json\n/, '') : raw
  const parsed = JSON.parse(json)
  const entries = Object.entries(parsed.rows ?? parsed)

  const issues = []
  const writable = []
  for (const [id, line] of entries) {
    if (typeof line !== 'string') {
      issues.push(`${id}: not a string`)
      continue
    }
    const text = line.trim()
    if (text === '') continue // an honest blank; leave the row without a line
    const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
    if (words < MIN_WORDS) issues.push(`${id}: ${words} words, too short to separate it from its neighbours`)
    if (words > MAX_WORDS) issues.push(`${id}: ${words} words, limit is ${MAX_WORDS}`)
    if (MARKETING.test(text)) issues.push(`${id}: marketing adjective — "${text.match(MARKETING)[0]}"`)
    if (EMOJI.test(text)) issues.push(`${id}: contains emoji`)
    writable.push([id, text])
  }
  if (issues.length) {
    console.error('refusing to write:')
    for (const i of issues) console.error('  ' + i)
    process.exit(1)
  }

  let written = 0
  for (const [id, text] of writable) {
    // A tool_slug is unique only *within* a category — the same repo is ranked
    // in several. Without category_slug here one answer writes its line into
    // every category holding that tool: applying UI Design's batch put
    // open-design's UI blurb onto its rows in coding, pdf-documents,
    // presentation, video-generation and image-generation, and marked them
    // described so their own pass would skip them.
    //
    // `best_for is null` also matters: this pass must never overwrite a line a
    // human wrote.
    const rows = await sql`
      update listings set best_for = ${text}, updated_at = now()
      where category_slug = ${slug}
        and tool_slug = ${id}
        and standing = 'emerging'
        and (best_for is null or btrim(best_for) = '')
      returning category_slug`
    if (rows.length === 0) {
      console.error(`  ${id}: no matching row without a line — skipped`)
      continue
    }
    written += rows.length
  }
  const blank = entries.length - writable.length
  console.log(`wrote ${written} lines${blank ? `, ${blank} returned blank` : ''}`)
}

// ---------------------------------------------------------------------------
const [cmd, arg] = process.argv.slice(2)
try {
  if (cmd === 'due') await due()
  else if (cmd === 'prompt') {
    if (!arg) throw new Error('usage: prompt <slug>')
    await prompt(arg)
  } else if (cmd === 'apply') {
    if (!arg) throw new Error('usage: apply <slug> < result.json')
    await apply(arg)
  }
  else {
    console.error(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 6).join('\n'))
    process.exit(2)
  }
} catch (error) {
  console.error(String(error.message ?? error))
  process.exit(1)
} finally {
  await sql.end()
}
