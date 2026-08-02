import * as stylex from '@stylexjs/stylex'
import {
  AudioLines,
  BriefcaseBusiness,
  Calculator,
  ChartColumn,
  Code,
  FileText,
  Globe,
  Headset,
  House,
  Image,
  Languages,
  LayoutTemplate,
  Library,
  MousePointerClick,
  Network,
  NotebookPen,
  PenLine,
  Presentation,
  Scale,
  Send,
  Share2,
  Telescope,
  TrendingUp,
  UserPlus,
  Video,
  Workflow,
} from 'lucide-react'
// Relative, not the `~` alias every other import in this directory uses:
// StyleX's babel plugin resolves a defineVars import itself, at compile time,
// and does not read Vite's aliases. With `~/theme/…` the build fails outright
// with "Could not resolve the path to the imported file".
import { areaHues, familyHues } from '../theme/areaHues.stylex'

// One icon per area, for the rail. Two things are being decided here — which
// glyph, and which colour — and only the first is obvious.
//
// ── the colour, and the rule it bends ──────────────────────────────────────
// This product's palette rule is that exactly three surfaces are tinted and
// each means one thing: indigo for a judgement we made, coral for limits, grey
// for demoted. The rail is grey — demoted — so twenty-five coloured glyphs in
// it are a real departure, added because a reader scanning twenty-five rows of
// same-weight text has nothing to aim at and every competitor solves it this
// way.
//
// Two palettes are kept here and `PALETTE` picks between them. They are a live
// comparison, not a feature: once the choice is settled, delete the loser and
// the switch with it. Leaving a toggle in place turns one decision into a
// permanent second thing to maintain.
//
//   'family' — five hues over twenty-five areas, grouped by the kind of work.
//     Repetition is the point: the colour says which neighbourhood a row is in,
//     which is information a reader can use. Five families also do not need the
//     whole wheel, which is what lets the set stand clear of both reserved
//     colours — see familyHues in theme/areaHues.stylex.ts for how far, and why
//     Astryx's categorical icon tokens could not be used for it.
//
//   'unique' — one generated hue per area, from theme/areaHues.stylex.ts.
//     Closest to what competitors do, and what the rail ships. Both reserved
//     colours are cut out of the wheel before the hues are spaced, so the cost
//     is not a collision but spacing: 26 hues over the arc that is left sit 10°
//     apart, and only the scattered order keeps neighbouring rows from reading
//     alike. What it cannot do is carry meaning — a hue belonging to one row
//     alone says "this row is not that row" and nothing more, which is why the
//     group captions above the rows have to do that work instead.
//
// Both sets are legible on the rail by measurement rather than by eye: the
// family hues at a constant 4.2:1 against #ECEDE4, the per-area ones between
// 4.00 and 4.52:1. The floor for a graphic that carries meaning is 3:1, which
// is why Astryx's `orange` (2.74), `cyan` (2.32) and `yellow` (1.40) appear in
// neither.
const PALETTE: 'family' | 'unique' = 'unique'

// ── the glyph ─────────────────────────────────────────────────────────────
// Lucide, matching the rest of the app's icon set. Each names the *work*
// rather than the output where the two differ: Research & Search is a
// telescope, not a magnifying glass, because the magnifier is already the
// search control in the top bar and one glyph cannot mean two things.

const base = stylex.create({
  icon: {
    display: 'block',
    flexShrink: 0,
  },
})

const family = stylex.create({
  // Language and text: what the reader writes, reads or converts.
  language: { color: familyHues.language },
  // Media: what gets generated as picture, motion or sound.
  media: { color: familyHues.media },
  // Go-to-market: reaching people and answering them.
  growth: { color: familyHues.growth },
  // Engineering: code, and the machines that run it unattended.
  engineering: { color: familyHues.engineering },
  // Business: money, law, evidence, and the decisions on top of them.
  business: { color: familyHues.business },
})

const unique = stylex.create({
  home: { color: areaHues.home },
  contentWriting: { color: areaHues.contentWriting },
  videoGeneration: { color: areaHues.videoGeneration },
  imageGeneration: { color: areaHues.imageGeneration },
  voiceAudio: { color: areaHues.voiceAudio },
  leadGen: { color: areaHues.leadGen },
  emailOutreach: { color: areaHues.emailOutreach },
  seoGeo: { color: areaHues.seoGeo },
  socialMedia: { color: areaHues.socialMedia },
  uiDesign: { color: areaHues.uiDesign },
  presentation: { color: areaHues.presentation },
  dataAnalysis: { color: areaHues.dataAnalysis },
  researchSearch: { color: areaHues.researchSearch },
  customerSupport: { color: areaHues.customerSupport },
  meetingNotes: { color: areaHues.meetingNotes },
  pdfDocuments: { color: areaHues.pdfDocuments },
  knowledgeBase: { color: areaHues.knowledgeBase },
  translation: { color: areaHues.translation },
  resumeJobs: { color: areaHues.resumeJobs },
  bookkeeping: { color: areaHues.bookkeeping },
  legalContract: { color: areaHues.legalContract },
  coding: { color: areaHues.coding },
  browserAutomation: { color: areaHues.browserAutomation },
  webScraping: { color: areaHues.webScraping },
  workflowAutomation: { color: areaHues.workflowAutomation },
  architectureDiagram: { color: areaHues.architectureDiagram },
})

type Family = keyof typeof family
type Own = keyof typeof unique
type LucideIcon = typeof PenLine

/** Slug → glyph, work family, and the area's own hue. Both palettes are
 * addressed from one table so they cannot drift apart: an area added to one
 * and forgotten in the other would not compile. */
const AREAS: Record<string, [LucideIcon, Family, Own]> = {
  'content-writing': [PenLine, 'language', 'contentWriting'],
  translation: [Languages, 'language', 'translation'],
  'pdf-documents': [FileText, 'language', 'pdfDocuments'],
  'meeting-notes': [NotebookPen, 'language', 'meetingNotes'],
  'knowledge-base': [Library, 'language', 'knowledgeBase'],

  'image-generation': [Image, 'media', 'imageGeneration'],
  'video-generation': [Video, 'media', 'videoGeneration'],
  'voice-audio': [AudioLines, 'media', 'voiceAudio'],
  presentation: [Presentation, 'media', 'presentation'],
  'ui-design': [LayoutTemplate, 'media', 'uiDesign'],

  'lead-gen': [UserPlus, 'growth', 'leadGen'],
  'email-outreach': [Send, 'growth', 'emailOutreach'],
  'seo-geo': [TrendingUp, 'growth', 'seoGeo'],
  'social-media': [Share2, 'growth', 'socialMedia'],
  'customer-support': [Headset, 'growth', 'customerSupport'],

  coding: [Code, 'engineering', 'coding'],
  'browser-automation': [MousePointerClick, 'engineering', 'browserAutomation'],
  'web-scraping': [Globe, 'engineering', 'webScraping'],
  'workflow-automation': [Workflow, 'engineering', 'workflowAutomation'],
  'architecture-diagram': [Network, 'engineering', 'architectureDiagram'],

  'data-analysis': [ChartColumn, 'business', 'dataAnalysis'],
  'research-search': [Telescope, 'business', 'researchSearch'],
  bookkeeping: [Calculator, 'business', 'bookkeeping'],
  'legal-contract': [Scale, 'business', 'legalContract'],
  'resume-jobs': [BriefcaseBusiness, 'business', 'resumeJobs'],
}

const tone = (f: Family, own: Own) => (PALETTE === 'family' ? family[f] : unique[own])

/** The five families, in the order the rail lists them, with the label a
 * reader sees.
 *
 * The labels are broad subject nouns and are not verbed, which is the same
 * rule the area names themselves follow — half of these groups span several
 * verbs, so naming one would make the label lie about its own list.
 *
 * They are also the only new vocabulary this adds. "Area" still means one of
 * the twenty-five; a group is just a heading over some of them, and nothing in
 * the product refers to it by a name of its own. */
export const FAMILIES: ReadonlyArray<{ key: Family; label: string }> = [
  { key: 'language', label: 'Writing & documents' },
  { key: 'media', label: 'Media & design' },
  { key: 'growth', label: 'Marketing & customers' },
  { key: 'engineering', label: 'Engineering & automation' },
  { key: 'business', label: 'Research & business' },
]

/** Null for an area this file has no entry for. Callers must still render it —
 * the rail is the site's map of itself, and an area that exists in the
 * database but not in the table above has to stay visible. */
export function familyOf(slug: string): Family | null {
  return AREAS[slug]?.[1] ?? null
}

/** The rail's own first row, which is not an area. It takes the language hue
 * under the family palette because Home is where the writing lands, and its
 * own generated hue under the other. */
export function HomeIcon() {
  return (
    <House
      size={16}
      strokeWidth={2}
      aria-hidden
      {...stylex.props(base.icon, tone('language', 'home'))}
    />
  )
}

/** Keyed by slug rather than by index, and silent when the slug is unknown:
 * areas live in the database, so a new one can appear here before anyone has
 * chosen a glyph for it. A row with no icon still reads; a wrong icon, or a
 * crash, does not. */
export function AreaIcon({ slug }: { slug: string }) {
  const entry = AREAS[slug]
  if (!entry) return null
  const [Glyph, f, own] = entry
  return (
    <Glyph size={16} strokeWidth={2} aria-hidden {...stylex.props(base.icon, tone(f, own))} />
  )
}
