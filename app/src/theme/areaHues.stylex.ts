import * as stylex from '@stylexjs/stylex'

/**
 * One colour per area, for the rail's icons — the alternative to the five
 * work-family colours. It lives here rather than in a component because colour
 * values live in src/theme/ and nowhere else.
 *
 * Twenty-six hues, evenly spaced around the wheel, **each with its own
 * lightness**. That second part is why these are generated rather than
 * hand-picked: at one fixed HSL lightness, yellow carries roughly six times the
 * luminance of blue, so a hand-written ramp has some rows shouting and others
 * barely visible. Every value below was solved by bisection for the same
 * contrast against the rail's #ECEDE4 — the set spans 4.00 to 4.52:1, where an
 * evenly-lit wheel spans about 1.4 to 12.
 *
 * They are also not in wheel order. Handed out in sequence, neighbouring rows
 * would land 14° apart and read as the same colour twice; the rail takes every
 * seventh position instead (26 and 7 are coprime, so all 26 are used exactly
 * once) and no two adjacent rows are closer than 96°.
 *
 * Known collision, inherent rather than an oversight: an even wheel has to pass
 * through the reds, so `contentWriting`, `knowledgeBase` and `leadGen` sit on
 * top of the coral this product reserves for limits. Five families can dodge
 * that hue; twenty-six cannot without leaving a visible gap in the wheel. It is
 * a cost of unique colour, not a bug to fix.
 */
export const areaHues = stylex.defineVars({
  home: '#6B54DE',
  contentWriting: '#D83054',
  videoGeneration: '#567F18',
  imageGeneration: '#198081',
  voiceAudio: '#A445DC',
  leadGen: '#C54C26',
  emailOutreach: '#288519',
  seoGeo: '#2576C0',
  socialMedia: '#C826BA',
  uiDesign: '#916E1C',
  presentation: '#19853C',
  dataAnalysis: '#545DDE',
  researchSearch: '#D62977',
  customerSupport: '#6A7B17',
  meetingNotes: '#19826B',
  pdfDocuments: '#8B54DE',
  knowledgeBase: '#D83432',
  translation: '#408219',
  resumeJobs: '#1E7D9B',
  bookkeeping: '#BD29D6',
  legalContract: '#AA6120',
  coding: '#198623',
  browserAutomation: '#406EDB',
  webScraping: '#D0289A',
  workflowAutomation: '#7C7618',
  architectureDiagram: '#198454',
})
