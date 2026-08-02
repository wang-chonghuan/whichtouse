/**
 * WhichToUse theme — the whole look, in one file.
 *
 * Chosen from public/prototype/index.html: frame "A · deep teal on cool paper"
 * with an indigo primary. Written fresh rather than derived from a shipped
 * Astryx theme, because a 600-line palette inherited wholesale is not a file
 * anyone re-reads — and re-reading this one is the point.
 *
 * ── the three jobs colour does here ────────────────────────────────────────
 *
 *   indigo   the interface. Buttons, links, and the one callout a page is
 *            allowed, which always carries the same meaning: this is a
 *            judgement we made.
 *   coral    limits, and nothing else. It is the only other hue with a job.
 *   ink      everything a tool does well. Strengths are deliberately NOT
 *            green: green as "good" collides with green as brand, and a
 *            green/red pair is the one combination colour-blind readers
 *            cannot separate. Coral alone carries the signal, which also
 *            matches the product's promise — limits first.
 *
 * Every stop below was contrast-checked before it was written down. The
 * tightest pair is white text on the indigo button at 6.29:1; the rest clear
 * AA with room. Do not nudge a value here without re-checking the pair it
 * belongs to.
 *
 * Dark mode is provided because the token shape demands both halves, but
 * nothing in the product has been read in dark mode. The root document ships
 * mode="light" for that reason.
 */

import {defineTheme} from '@astryxdesign/core/theme';
import {iconRegistry} from './icons';

// ── the primary ramp ────────────────────────────────────────────────────────
// Derived from #4F46E5 by the same lightness-proportional rule the prototype's
// picker uses, so swapping the primary is six values and not a redesign. The
// dark stops are a proportion of the base lightness rather than fixed numbers:
// absolute stops invert for any base darker than a mid blue.
const INDIGO = {
  50: '#F1F0FC', // the one callout per page
  100: '#DAD8F8', // that callout's border
  200: '#BAB7F0',
  500: '#4F46E5', // primary button, selected nav
  600: '#2C21E0', // links on white, button hover
  700: '#231AB8', // headings inside the callout
} as const;

// ── limits ──────────────────────────────────────────────────────────────────
const CORAL = {
  tint: '#FBE8E2',
  line: '#F3CFC4',
  base: '#D4553C',
  ink: '#9C3A26',
} as const;

// ── frame ───────────────────────────────────────────────────────────────────
// One white for the page and for cards. The earlier near-white canvas gave the
// shell a faint tone the content floated on; on plain white the hairline border
// does that job instead, and the only tinted surfaces left are the ones that
// mean something — the task rail, and the demoted blocks.
const SURFACE = '#FFFFFF' // the page, and cards on it
const RECESSED = '#EBF0EF' // the task rail, Signals, Quick facts, Emerging
const LINE = '#DDE5E3'
const INK = '#12201E'
const INK_2 = '#5A6764'

export const wtuTheme = defineTheme({
  name: 'wtu',

  // Inter across body and headings. Chosen against Outfit, Roboto and
  // Bricolage Grotesque in the prototype, on the three things this product
  // actually does: 11–12px row descriptions, where Inter's taller x-height and
  // open apertures hold up and a geometric face blurs; a page full of star
  // counts, ranks, prices and dates, where Inter's tabular figures and
  // distinguishable 1/7 and 0/O matter; and a palette carrying meaning, which
  // wants a face that gets out of the way.
  //
  // base 15 rather than 14: this is a reading product, and the ranking rows are
  // the smallest thing on the page.
  typography: {
    scale: {base: 15, ratio: 1.22},
    body: {
      family: 'Inter',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Inter',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      weights: {3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'ui-monospace',
      fallbacks:
        '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },

  motion: {fast: 120, medium: 260, slow: 620, ratio: 0.75},

  tokens: {
    // ── surfaces ────────────────────────────────────────────────────────────
    '--color-background-body': [SURFACE, '#141817'],
    '--color-background-surface': [SURFACE, '#1C2120'],
    '--color-background-card': [SURFACE, '#1C2120'],
    '--color-background-popover': [SURFACE, '#222827'],
    '--color-background-muted': [RECESSED, '#232A28'],
    '--color-background-inverted': [INK, '#F4F7F6'],

    // ── text ────────────────────────────────────────────────────────────────
    '--color-text-primary': [INK, '#E7ECEA'],
    '--color-text-secondary': [INK_2, '#A3ADAA'],
    '--color-text-disabled': ['#94A09D', '#6C7674'],
    // 600, not 500: a link sits on white as small text, where the button's
    // stop only just clears AA. The button gets 500 via --color-accent.
    '--color-text-accent': [INDIGO[600], '#B7B2F5'],

    '--color-icon-primary': [INK, '#E7ECEA'],
    '--color-icon-secondary': [INK_2, '#A3ADAA'],
    '--color-icon-disabled': ['#94A09D', '#6C7674'],
    '--color-icon-accent': [INDIGO[600], '#B7B2F5'],

    // ── the primary ─────────────────────────────────────────────────────────
    '--color-accent': [INDIGO[500], '#6F67EA'],
    '--color-on-accent': ['#FFFFFF', '#FFFFFF'],
    '--color-accent-muted': [INDIGO[100], '#2A2570'],

    // ── lines ───────────────────────────────────────────────────────────────
    '--color-border': [LINE, '#2C3432'],
    '--color-border-emphasized': ['#C6D2CF', '#3D4644'],
    '--color-skeleton': [RECESSED, '#2C3432'],
    '--color-track': ['#D6DFDD', '#333B39'],

    // ── status ──────────────────────────────────────────────────────────────
    // `error` is coral, because the only error-shaped thing this product shows
    // is a limitation. `success` is kept for form feedback but is never used to
    // mean "this tool is good" — see the note at the top of the file.
    '--color-error': [CORAL.base, '#E8785F'],
    '--color-on-error': ['#FFFFFF', '#FFFFFF'],
    '--color-success': ['#1B7A4B', '#4FB07E'],
    '--color-on-success': ['#FFFFFF', '#FFFFFF'],
    '--color-warning': ['#A8730B', '#E0A93A'],
    '--color-on-warning': ['#FFFFFF', INK],

    // ── named families ──────────────────────────────────────────────────────
    // Astryx's `blue` and `red` families are what Card/Badge/Token reach for
    // via variant="blue" / variant="red". Repointing them at the indigo and
    // coral ramps means a callout is `<Card variant="blue">` — a component
    // prop, no colour in component code — and the two families keep their
    // border and text stops in step with the background.
    '--color-background-blue': [INDIGO[50], '#252063'],
    '--color-border-blue': [INDIGO[100], '#3A32A0'],
    '--color-icon-blue': [INDIGO[600], '#B7B2F5'],
    '--color-text-blue': [INDIGO[700], '#CFCCF9'],

    '--color-background-red': [CORAL.tint, '#4A1F14'],
    '--color-border-red': [CORAL.line, '#7A3624'],
    '--color-icon-red': [CORAL.base, '#E8785F'],
    '--color-text-red': [CORAL.ink, '#F3B8A6'],

    '--color-background-gray': [RECESSED, '#232A28'],
    '--color-border-gray': [LINE, '#3D4644'],
    '--color-icon-gray': [INK_2, '#A3ADAA'],
    '--color-text-gray': [INK, '#E7ECEA'],

    // ── shadow ──────────────────────────────────────────────────────────────
    // Cards lift on a hairline, not a drop shadow: the page is a document, and
    // twelve floating panels read as a dashboard.
    '--color-shadow': ['rgba(18, 32, 30, 0.06)', 'rgba(0, 0, 0, 0.4)'],
  },

  components: {
    // The page is white throughout, so this is belt and braces on the bar's own
    // tone — kept explicit so the header cannot drift if AppShell's `wash`
    // variant ever resolves to something other than the body colour.
    // The padding puts the bar's *contents* on the same left edge as the page,
    // while the white keeps running to both edges of the window. Without it the
    // logo sat hard against the viewport while the content began 84px in, so
    // the page had two different left margins. max() keeps the rule from going
    // negative on windows narrower than the container.
    'app-shell-header': {
      base: {
        backgroundColor: 'var(--color-background-surface)',
        // 16, not the page's 24: TopNav adds 8px of its own inline padding
        // that a consumer stylesheet cannot remove (it owns the property, and
        // Astryx's CSS outranks ours), so the two together land the logo on the
        // container's edge. Measured, not guessed — logo x and rail x both read
        // 84 at 1440. If TopNav's padding ever changes, this drifts by that
        // much and the fix is here.
        paddingInline: 'max(16px, calc((100% - 1320px) / 2 + 16px))',
      },
    },
  },

  icons: iconRegistry,
});
