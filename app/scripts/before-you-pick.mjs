#!/usr/bin/env node
// The deterministic half of "Before you pick".
//
//   node scripts/before-you-pick.mjs due [--days 90]
//   node scripts/before-you-pick.mjs prompt <slug>          — pass 1, the lines
//   node scripts/before-you-pick.mjs apply <slug> < result.json
//   node scripts/before-you-pick.mjs detail-prompt <slug>   — pass 2, the prose
//
// The research itself is a judgement task and belongs to an agent — see
// .agents/skills/wt-tooltrend. What lives here is everything that must be
// repeatable and checkable: deciding which categories are stale, filling the
// prompt's placeholders from the corpus so no one hand-edits them, and
// validating what comes back before it is allowed near the content.
//
// The split matters. The failure this guards against is a plausible-looking
// answer written straight into the corpus: three sentences nobody can trace,
// sitting on the page that sells "we actually opened this".

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(appDir, 'src/content')
const PROMPT_DOC = resolve(
  process.env.HOME ?? '',
  '.claude/skills/n-tooltrend/references/research-prompt.md',
)

const read = (p) => readFileSync(p, 'utf8')
const categoryFile = (slug) => join(CONTENT, 'c', `${slug}.json`)
const loadCategory = (slug) => JSON.parse(read(categoryFile(slug)))
const loadIndex = () => JSON.parse(read(join(CONTENT, 'categories.json')))

/** Roughly how many products the reader is choosing between. Written into the
 * prompt so the researcher knows whether it is a crowded field or a settled
 * one — the answer reads differently at five candidates and at twenty. */
function productCount(content) {
  const n = ['app', 'oss', 'skill'].reduce(
    (sum, track) => sum + (content.tracks?.[track]?.length ?? 0),
    0,
  )
  if (n === 0) return 'a handful of products'
  return `roughly ${n} products`
}

// ---------------------------------------------------------------------------
// due — which categories need a look
//
// Missing first, then oldest. These are researched judgements about a moving
// market; the date on them is a review clock, not a timestamp.
function due(days) {
  const cutoff = Date.now() - days * 86_400_000
  const rows = []
  for (const { slug, name } of loadIndex()) {
    let content
    try {
      content = loadCategory(slug)
    } catch {
      rows.push({ slug, name, state: 'no corpus file', age: Infinity })
      continue
    }
    const tips = content.beforeYouPick
    if (!tips?.weigh && !tips?.avoid && !tips?.moving) {
      rows.push({ slug, name, state: 'never researched', age: Infinity })
      continue
    }
    const at = tips.updated ? Date.parse(`${tips.updated}T00:00:00Z`) : NaN
    if (!Number.isFinite(at)) {
      rows.push({ slug, name, state: 'undated', age: Infinity })
    } else if (at < cutoff) {
      const age = Math.floor((Date.now() - at) / 86_400_000)
      rows.push({ slug, name, state: `${age}d old`, age })
    }
  }
  rows.sort((a, b) => b.age - a.age)
  if (rows.length === 0) {
    console.log(`nothing due — every category researched within ${days} days`)
    return
  }
  for (const r of rows) console.log(`${r.slug.padEnd(24)} ${r.state.padEnd(18)} ${r.name}`)
  console.log(`\n${rows.length} due of ${loadIndex().length}`)
}

// ---------------------------------------------------------------------------
// prompt — fill the placeholders
//
// The prompt body is read from the installed n-tooltrend skill rather than
// copied here. Two copies of a prompt drift, and the version that ships is
// always the one nobody remembered to update.
function prompt(slug) {
  const content = loadCategory(slug)
  const meta = loadIndex().find((c) => c.slug === slug)
  if (!meta) throw new Error(`${slug} is not in categories.json`)

  let doc
  try {
    doc = read(PROMPT_DOC)
  } catch {
    throw new Error(
      `cannot read the research prompt at ${PROMPT_DOC}\n` +
        'Install the n-tooltrend skill, or pass its path in TOOLTREND_PROMPT.',
    )
  }
  const body = doc.split('```text')[1]?.split('```')[0]?.trim()
  if (!body) throw new Error('no ```text block in the research prompt')

  // A blurb that merely repeats the category name tells the researcher nothing
  // about scope. Say so rather than degrading quietly: the prompt still runs,
  // but whoever ran it knows the scope line was empty.
  if (!meta.blurb) {
    console.error(
      `warning: ${slug} has no \`blurb\` in categories.json, so the scope line ` +
        'will just repeat the name. Add blurb/practitioners/domainHint there.',
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const priorArt =
    `1. Read \`app/src/content/c/${slug}.json\` — every ranked entry with \`pros\`, ` +
    '`cons`, `pricing`, `rankBasis`, and a category-level `notes`. Read the `cons` across all ' +
    'entries especially: a complaint that recurs across many products is a property of the ' +
    'category, which is exactly what you are looking for. A complaint about one product is not.'

  const filled = body
    .replaceAll('{{SITE}}', 'whichtouse.com')
    .replaceAll('{{TODAY}}', today)
    .replaceAll('{{YEAR}}', today.slice(0, 4))
    .replaceAll('{{CATEGORY}}', meta.name)
    .replaceAll('{{CATEGORY_BLURB}}', meta.blurb ?? meta.name)
    .replaceAll('{{PRODUCT_COUNT}}', productCount(content))
    .replaceAll('{{PRIOR_ART_STEP}}', priorArt)
    .replaceAll('{{PRACTITIONERS}}', meta.practitioners ?? 'experienced practitioners')
    .replaceAll('{{DOMAIN_HINT}}', meta.domainHint ?? '')

  const left = filled.match(/\{\{(\w+)\}\}/g)
  if (left) throw new Error(`unfilled placeholders: ${[...new Set(left)].join(', ')}`)
  process.stdout.write(filled + '\n')
}

// ---------------------------------------------------------------------------
// detail-prompt — fill the second pass's placeholders
//
// The expansion behind each line, for the card's "View all". Separate from
// `prompt` because it is a separate job with a separate failure mode: the
// researcher writing both at once writes the short line to fit the long one.
function detailPrompt(slug) {
  const content = loadCategory(slug)
  const meta = loadIndex().find((c) => c.slug === slug)
  if (!meta) throw new Error(`${slug} is not in categories.json`)

  const tips = content.beforeYouPick
  if (!tips?.weigh && !tips?.avoid && !tips?.moving) {
    throw new Error(`${slug} has no published lines yet — run the research pass first`)
  }

  const doc = read(join(appDir, '../.agents/skills/wt-tooltrend/references/detail-prompt.md'))
  const body = doc.split('```text')[1]?.split('```')[0]?.trim()
  if (!body) throw new Error('no ```text block in the detail prompt')

  const lines = LINES.filter((k) => tips[k])
    .map((k) => `  ${k.padEnd(7)} "${tips[k]}"`)
    .join('\n')

  const filled = body
    .replaceAll('{{CATEGORY}}', meta.name)
    .replaceAll('{{CATEGORY_BLURB}}', meta.blurb ?? meta.name)
    .replaceAll('{{LINES}}', lines)
    .replaceAll('{{SOURCES}}', (tips.sources ?? []).map((s) => `    ${s}`).join('\n'))

  const left = filled.match(/\{\{(\w+)\}\}/g)
  if (left) throw new Error(`unfilled placeholders: ${[...new Set(left)].join(', ')}`)
  process.stdout.write(filled + '\n')
}

// ---------------------------------------------------------------------------
// apply — validate, then write
//
// Structural checks only. Whether a line is true is the researcher's problem
// and the reviewer's; whether it is the right *shape* is checkable, and the
// checks below are the failures actually observed in earlier runs.
const MAX_WORDS = 25
const LINES = ['weigh', 'avoid', 'moving']

function validate(tips) {
  const issues = []
  for (const key of LINES) {
    const line = tips[key]
    if (line === undefined) {
      issues.push(`${key}: missing (use "" if unsupported by evidence)`)
      continue
    }
    if (typeof line !== 'string') {
      issues.push(`${key}: not a string`)
      continue
    }
    if (line === '') continue // an empty slot is a legitimate, honest answer
    // Standalone punctuation is not a word. An em-dash written with spaces
    // around it — like this — was counting as one, so a 25-word line failed a
    // 25-word limit. The limit is about how long the line takes to read.
    const words = line
      .trim()
      .split(/\s+/)
      .filter((w) => /[\p{L}\p{N}]/u.test(w)).length
    if (words > MAX_WORDS) issues.push(`${key}: ${words} words, limit is ${MAX_WORDS}`)
    // Observed failure: a number the sources never stated, inferred from
    // vendors' own claims. Percentages and multipliers are the shapes that
    // showed up; both were unstable across runs of the same research.
    const figure = line.match(/\b\d+(\.\d+)?\s?(%|x|×)/i)
    if (figure) issues.push(`${key}: contains the figure "${figure[0]}" — cite it or cut it`)
  }
  if (LINES.every((k) => !tips[k])) issues.push('all three lines empty — nothing to write')
  if (!Array.isArray(tips.sources) || tips.sources.length === 0) {
    issues.push('sources: missing or empty')
  } else {
    for (const s of tips.sources) {
      if (typeof s !== 'string' || !/^https?:\/\//.test(s)) issues.push(`sources: not a URL — ${s}`)
    }
  }
  return issues
}

async function apply(slug) {
  const raw = await new Promise((res, rej) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (d) => (buf += d))
    process.stdin.on('end', () => res(buf))
    process.stdin.on('error', rej)
  })
  // Tolerate a fenced block, because that is how agents hand back JSON.
  const json = raw.includes('```') ? raw.split('```')[1].replace(/^json\n/, '') : raw
  const result = JSON.parse(json)

  const issues = validate(result)
  if (issues.length) {
    console.error(`refusing to write ${slug}:`)
    for (const i of issues) console.error('  ' + i)
    process.exit(1)
  }

  const file = categoryFile(slug)
  const content = JSON.parse(read(file))
  const out = {}
  // Keep it next to `notes`, the other category-level prose, rather than
  // appended wherever — the corpus files are read by people.
  for (const [k, v] of Object.entries(content)) {
    out[k] = v
    if (k === 'notes') out.beforeYouPick = null
  }
  out.beforeYouPick = {
    weigh: result.weigh || null,
    avoid: result.avoid || null,
    moving: result.moving || null,
    sources: result.sources,
    updated: new Date().toISOString().slice(0, 10),
  }
  writeFileSync(file, JSON.stringify(out, null, 2) + '\n')
  const kept = LINES.filter((k) => out.beforeYouPick[k]).length
  console.log(`${slug}: wrote ${kept}/3 lines, ${result.sources.length} sources -> ${file}`)
  if (kept < 3) console.log('  (empty slots are kept as null and render as nothing)')
  console.log('  now run: node scripts/import-content.mjs   — or the targeted writer, see the skill')
}

// ---------------------------------------------------------------------------
const [cmd, arg] = process.argv.slice(2)
try {
  if (cmd === 'due') {
    const i = process.argv.indexOf('--days')
    due(i > -1 ? Number(process.argv[i + 1]) : 90)
  } else if (cmd === 'prompt') {
    if (!arg) throw new Error('usage: prompt <slug>')
    prompt(arg)
  } else if (cmd === 'detail-prompt') {
    if (!arg) throw new Error('usage: detail-prompt <slug>')
    detailPrompt(arg)
  } else if (cmd === 'apply') {
    if (!arg) throw new Error('usage: apply <slug> < result.json')
    await apply(arg)
  } else {
    console.error(read(fileURLToPath(import.meta.url)).split('\n').slice(1, 8).join('\n'))
    process.exit(2)
  }
} catch (error) {
  console.error(String(error.message ?? error))
  process.exit(1)
}
