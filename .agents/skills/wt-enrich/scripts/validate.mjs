#!/usr/bin/env node
// wt-enrich validator: checks that every item in a WhichToUse category JSON has
// the six enrichment fields with correct types, non-empty arrays, and that the
// original fields + rank order are intact. Structural only — it cannot judge
// whether the content is honest/correct (that is the agent's job).
//
// Usage: node validate.mjs <path-to-category>.json   (exit 1 on any issue)

import { readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('usage: node validate.mjs app/src/content/c/<category>.json')
  process.exit(2)
}

const ORIG = ['rank', 'name', 'homepage', 'pricing', 'bestFor', 'confidence', 'badge', 'sources']
const issues = []

const data = JSON.parse(readFileSync(file, 'utf8'))
const tracks = data.tracks ?? {}

for (const track of ['app', 'skill']) {
  const items = tracks[track] ?? []
  // rank order preserved (1..N contiguous)
  items.forEach((it, i) => {
    const where = `${track}#${it.rank ?? i + 1} ${it.name ?? '?'}`

    for (const k of ORIG) if (!(k in it)) issues.push(`${where}: missing original field '${k}'`)
    if (track === 'skill' && !['skill', 'repo'].includes(it.kind)) issues.push(`${where}: kind must be skill|repo`)

    // rankBasis: non-empty string
    if (typeof it.rankBasis !== 'string' || it.rankBasis.trim().length < 20)
      issues.push(`${where}: rankBasis missing or too short (needs a concrete sentence)`)

    // pricingFree / pricingPaid: string or null, and the key must be present
    for (const k of ['pricingFree', 'pricingPaid']) {
      if (!(k in it)) issues.push(`${where}: missing '${k}'`)
      else if (it[k] !== null && typeof it[k] !== 'string') issues.push(`${where}: '${k}' must be string or null`)
    }
    // at least one of the two pricing fields should say something
    if (it.pricingFree == null && it.pricingPaid == null)
      issues.push(`${where}: both pricingFree and pricingPaid are null — set at least one`)

    // arrays: features 2-4, pros/cons 2-3, all non-empty strings
    const arr = (k, min, max) => {
      const v = it[k]
      if (!Array.isArray(v) || v.length < min) issues.push(`${where}: '${k}' needs >= ${min} entries`)
      else if (v.length > max) issues.push(`${where}: '${k}' has > ${max} entries (keep it tight)`)
      else if (v.some((x) => typeof x !== 'string' || !x.trim())) issues.push(`${where}: '${k}' has empty entries`)
    }
    arr('features', 2, 4)
    arr('pros', 2, 3)
    arr('cons', 2, 3)
  })
}

// ── the category note ──────────────────────────────────────────────────────
// Length and vocabulary only. Whether the note is *true* is the agent's job;
// whether it is a changelog written in our own schema is checkable, and that is
// how every version of this field has gone wrong so far.
const note = data.notes
if (typeof note !== 'string' || !note.trim()) {
  issues.push(`notes: missing — every category needs its "How we ranked these" line`)
} else {
  const words = note.trim().split(/\s+/).length
  if (words > 45) issues.push(`notes: ${words} words, ceiling is 45 — cut, do not compress`)

  // Talking to ourselves about repair work the reader never saw.
  const diff = /\b(previously|prior|this fixes|no longer|used to|was excluded|earlier version|the old )/i
  if (diff.test(note)) issues.push(`notes: reads as a changelog — the reader never saw the old version`)

  // Our schema, not the reader's vocabulary.
  const jargon = /\b(rank determinant|track|rankBasis|kind \(|SKILL\.md|corpus|field)\b/i
  if (jargon.test(note)) issues.push(`notes: uses our schema vocabulary, not the reader's`)

  // Numbers order the list; they never supply the reason. Site-wide rule.
  const metric = /(\d+\s*[k★]|\bstars?\b|★)/i
  if (metric.test(note)) issues.push(`notes: quotes a metric as a reason — numbers order, they never explain`)
}

if (issues.length) {
  console.error(`✗ ${file}: ${issues.length} issue(s)`)
  for (const x of issues) console.error('  -', x)
  process.exit(1)
}
console.log(`✓ ${file}: all items enriched and structurally valid`)
