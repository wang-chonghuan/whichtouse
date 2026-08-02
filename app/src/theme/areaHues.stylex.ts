import * as stylex from '@stylexjs/stylex'

/**
 * One colour per work family — the palette the rail actually uses.
 *
 * These replace Astryx's categorical icon tokens, which had to go for one
 * reason: `--color-icon-blue` is #2C21E0, which is the 600 stop of this
 * theme's own indigo ramp, and `--color-icon-purple` sits beside it. Ten of the
 * rail's twenty-six rows were therefore wearing the brand colour, so the icons
 * read as a wash of primary rather than as five distinguishable groups.
 *
 * The set is warm-led: the first group takes an amber, and three of the five
 * sit in the warm halves of the wheel. That is a requirement, not a leftover,
 * and it costs something — see below.
 *
 * Every hue is at least 57° from the primary (243°) and 34° from the limits
 * coral (10°), and no two are closer than 34°. **34 is the price of the
 * warmth.** The true warm arc runs either side of 0°, which is exactly where
 * the limits coral lives, so a palette that keeps a wide berth from coral has
 * no warm slots left — the previous version had one, an olive, and read cold
 * because of it. Buying three warm hues means moving nearer to coral and
 * packing the five closer together. An earlier set spaced them 45° apart and
 * was measurably better separated; it was also the wrong answer.
 *
 * Two mitigations do most of the work of the lost spacing. The rail order is
 * arranged so that groups the eye actually compares — the ones next to each
 * other — are never closer than 104°; the close pairs are always separated by
 * a group in between. And every group now carries a caption, so colour is a
 * second cue rather than the only one.
 *
 * Lightness is solved per hue for a constant 4.2:1 against the rail (4.95:1 on
 * white, for anywhere they end up outside it).
 *
 * The cost of leaving Astryx's tokens: these no longer follow a theme swap. A
 * new primary means re-running the placement — which is correct, because the
 * whole point of the set is to be a measured distance away from it.
 */
export const familyHues = stylex.defineVars({
  language: '#896C1C', // hue 44, amber — the top group, and the warmest
  media: '#BE27BE', // hue 300, magenta
  growth: '#28811A', // hue 112, green
  engineering: '#CF2A72', // hue 334, rose
  business: '#5D7A19', // hue 78, olive gold
})

/**
 * One colour per area — the full-colour palette, and the one the rail uses.
 *
 * Twenty-six hues, **each with its own lightness**. That second part is why
 * these are generated rather than hand-picked: at one fixed HSL lightness,
 * yellow carries roughly six times the luminance of blue, so a hand-written
 * ramp has some rows shouting and others barely visible. Every value below was
 * solved by bisection for the same 4.2:1 against the rail's #ECEDE4, where an
 * evenly-lit wheel would span about 1.4 to 12.
 *
 * The wheel is not whole. Two arcs are cut out of it before the hues are
 * spaced: 213–273, around the interface primary, and 350–30, around the limits
 * coral. Both are reserved colours in this product, and an icon wearing one is
 * either brand noise or a false promise. Cutting them costs spacing — 260° of
 * usable wheel over 26 hues is 10° apiece rather than 14 — which is affordable
 * only because of the next paragraph.
 *
 * They are handed out scattered, not in wheel order. Sequentially, neighbouring
 * rows would land 10° apart and read as the same colour twice; the rail takes
 * every seventh slot instead (26 and 7 are coprime, so all 26 are used exactly
 * once) and **no two adjacent rows are closer than 70°**.
 *
 * The order is the *rendered* one — Home, then the five groups in the order
 * they appear — not the order areas arrive from the database. Scattering has to
 * be computed against what a reader's eye actually walks down, or it scatters
 * the wrong sequence and neighbours collide anyway.
 *
 * The list starts warm: Home is an amber at 30°, the first hue out of the arc.
 * With colours this scattered that is as far as "warm at the top" can go — the
 * second row is 70° away by construction. A rail whose whole top *region* is
 * warm needs the hues walked in wheel order instead of scattered, which trades
 * the row-to-row separation for a gradient down the column.
 */
export const areaHues = stylex.defineVars({
  home: '#A16121', // hue 30, amber
  contentWriting: '#3C7F1A', // hue 100
  meetingNotes: '#1A7E6D', // hue 170
  pdfDocuments: '#BE27BE', // hue 300
  knowledgeBase: '#81701A', // hue 50
  translation: '#1B821B', // hue 120
  videoGeneration: '#1D7A8D', // hue 190
  imageGeneration: '#C92994', // hue 320
  voiceAudio: '#677718', // hue 70
  uiDesign: '#1A813C', // hue 140
  presentation: '#2772BD', // hue 210
  leadGen: '#D12B62', // hue 340
  emailOutreach: '#4B7D1A', // hue 90
  seoGeo: '#1A7F5D', // hue 160
  socialMedia: '#B52BD1', // hue 290
  customerSupport: '#906A1D', // hue 40
  coding: '#2B811A', // hue 110
  browserAutomation: '#197C7C', // hue 180
  webScraping: '#C428AA', // hue 310
  workflowAutomation: '#747418', // hue 60
  architectureDiagram: '#1A812C', // hue 130
  dataAnalysis: '#2177A2', // hue 200
  researchSearch: '#CE2A7C', // hue 330
  resumeJobs: '#5A7A19', // hue 80
  bookkeeping: '#1A804D', // hue 150
  legalContract: '#A43DD7', // hue 280
})
