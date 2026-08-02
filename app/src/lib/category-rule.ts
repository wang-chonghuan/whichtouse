/** Which area of work does this candidate belong to?
 *
 * Until now nothing answered that question. The refresh job ran one search per
 * category and whatever came back was filed under the category whose search
 * had run — the query string was the classifier. A category whose skill query
 * was the single word "support" collected every repo that supports something,
 * and 11 of 11 of its emerging rows were wrong; the same team mailbox landed in
 * Meeting Notes, Legal & Contracts and Workflow Automation at once, because
 * three searches each found it and none of them ever asked whether it belonged.
 *
 * This module is that missing question, and nothing else. It is pure: same
 * candidate, same answer, no clock, no network, no model. The daily job has to
 * be reproducible at 03:00 with no key in the environment (see the ticket's
 * D5), and a rule that can be unit-tested is a rule whose failures can be
 * written down as tests rather than argued about.
 *
 * The contract is confirm-or-discard. `assignCategory` returns one slug or
 * null; the caller compares it against the category whose search produced the
 * candidate and drops anything that does not match. It never re-files a
 * candidate into a better category — a search that did not run for that
 * category has not seen its competition, so a placement there would be a rank
 * against an unknown field.
 */

export interface CategoryVocabulary {
  /** Phrases specific enough to place a tool on their own evidence. */
  strong: string[]
  /** Words that point the right way but need company. */
  weak: string[]
}

/** Text that means "this repo is a bag of skills for everything", which is a
 * true statement about it and a reason to file it nowhere. These repos are the
 * single largest group among the misfiled rows: a 345-skill marketplace matches
 * every category's vocabulary at once, and whichever category's search ran
 * first got to keep it. */
export const OMNIBUS_PHRASES: string[] = [
  'marketplace',
  'curated list',
  'awesome list',
  'skills store',
  'skill store',
  'skills directory',
  'plugin directory',
  'all in one',
  'everything you need',
  'skills for every',
  'skills for everything',
  'across every domain',
]

/** "330+ skills", "165 evidence-based education skills", "822 professional
 * Agent Skills". A count in front of the word is the tell: nobody advertises
 * the size of a collection that does one thing.
 *
 * Deliberately narrow. "A collection of skills for AI financial analysis" is
 * not an omnibus — it is a bookkeeping repo that happens to hold several
 * skills — and an earlier, broader veto here threw away ten correctly filed
 * bookkeeping rows to catch three wrong ones. */
export const OMNIBUS_COUNT = /(?<![\p{L}\p{N}])(\d{2,})\s?\+?\s+(?:[\p{L}-]+\s+){0,2}(?:skills|plugins|agents|commands)(?![\p{L}\p{N}])/giu

/** Below this, a count is a product ("10 agent skills for outbound"); above it,
 * it is a catalog ("822 professional Agent Skills"). */
export const OMNIBUS_COUNT_THRESHOLD = 40

export const CATEGORY_VOCABULARY: Record<string, CategoryVocabulary> = {
  'content-writing': {
    strong: [
      'content writing',
      'copywriting',
      'copywriter',
      'blog post',
      'blog writing',
      'article writing',
      'content marketing',
      'ghostwriting',
      'ghostwriter',
      'writing assistant',
      'proofread',
      'proofreading',
      'grammar check',
      'writing style',
      'editorial voice',
      'long form content',
    ],
    weak: [
      'writing',
      'writer',
      'prose',
      'grammar',
      'essay',
      'draft',
      'editorial',
      'headline',
      'humanize',
      'humanizer',
      'rewrite',
      'storytelling',
      'fiction',
      'novel',
      'wechat',
      'publish',
    ],
  },
  'video-generation': {
    strong: [
      'video generation',
      'text to video',
      'image to video',
      'video editing',
      'video editor',
      'ai video',
      'talking avatar',
      'video diffusion',
      'video model',
      'youtube video',
      'short form video',
      'video clip',
      'b roll',
    ],
    weak: ['video', 'animation', 'footage', 'shorts', 'youtube', 'timeline edit'],
  },
  'image-generation': {
    strong: [
      'image generation',
      'text to image',
      'image editing',
      'image editor',
      'image model',
      'stable diffusion',
      'midjourney',
      'nano banana',
      'photo editing',
      'photo generation',
      'ai art',
      'thumbnail generation',
      'logo generation',
    ],
    weak: ['image', 'photo', 'illustration', 'diffusion', 'picture', 'thumbnail', 'sticker'],
  },
  'voice-audio': {
    strong: [
      'text to speech',
      'speech to text',
      'voice clone',
      'voice cloning',
      'voice agent',
      'voice assistant',
      'transcription',
      'transcribe',
      'music generation',
      'sound effect',
      'podcast',
      'audio editing',
      'speech recognition',
      'tts',
      'stt',
      'asr',
      'whisper',
      'sound design',
      'audio processing',
      'signal processing',
      'spatial audio',
      'voice over',
      'voiceover',
      'dubbing',
    ],
    weak: ['audio', 'voice', 'speech', 'music', 'sound', 'sonic', 'synthesis', 'microphone', 'listening'],
  },
  'lead-gen': {
    strong: [
      'lead generation',
      'lead gen',
      'lead scoring',
      'sales intelligence',
      'contact enrichment',
      'prospecting',
      'prospect list',
      'sales prospecting',
      'sdr',
      'account based marketing',
      'crm enrichment',
      'sales funnel',
      'enterprise sales',
      'sales methodology',
      'go to market',
      'sales enablement',
    ],
    weak: [
      'leads',
      'prospect',
      'sales',
      'selling',
      'outbound',
      'gtm',
      'funnel',
      'pitch',
      'negotiation',
      'positioning',
      'crm',
    ],
  },
  'email-outreach': {
    strong: [
      'cold email',
      'email outreach',
      'email campaign',
      'email sequence',
      'email marketing',
      'inbox warming',
      'drip campaign',
      'email deliverability',
      'newsletter',
      'mailbox',
      'imap',
      'smtp',
      'gmail',
    ],
    weak: ['email', 'inbox', 'mail', 'unsubscribe'],
  },
  'seo-geo': {
    strong: [
      'seo',
      'search engine optimization',
      'search engine optimisation',
      'keyword research',
      'backlink',
      'serp',
      'generative engine optimization',
      'geo optimization',
      'site audit',
      'organic traffic',
      'meta description',
      'core web vitals',
    ],
    weak: ['ranking in search', 'rankings', 'sitemap', 'crawl budget', 'page speed', 'llm visibility', 'answer engine'],
  },
  'social-media': {
    strong: [
      'social media',
      'twitter',
      'tweet',
      'linkedin',
      'instagram',
      'tiktok',
      'reddit',
      'xiaohongshu',
      'xhs',
      'content calendar',
      'post scheduler',
      'community management',
    ],
    weak: ['social', 'followers', 'engagement', 'viral', 'threads'],
  },
  'ui-design': {
    strong: [
      'ui design',
      'ux design',
      'design system',
      'design to code',
      'component library',
      'figma',
      'wireframe',
      'landing page design',
      'frontend design',
      'visual design',
      'high fidelity prototype',
      'design engineer',
    ],
    weak: ['design', 'ui', 'ux', 'css', 'tailwind', 'layout', 'typography', 'prototype'],
  },
  presentation: {
    strong: [
      'presentation',
      'slide deck',
      'slides',
      'pptx',
      'powerpoint',
      'keynote deck',
      'pitch deck',
      'slide generation',
      'deck',
    ],
    weak: ['slide', 'ppt', 'speaker notes'],
  },
  'data-analysis': {
    strong: [
      'data analysis',
      'data analytics',
      'business intelligence',
      'spreadsheet',
      'excel',
      'csv',
      'sql query',
      'sql queries',
      'dataframe',
      'pandas',
      'jupyter',
      'notebook analysis',
      'data visualization',
      'data visualisation',
      'bi dashboard',
      'statistical analysis',
      'ab test',
    ],
    weak: ['analytics', 'dataset', 'metrics', 'dashboard', 'chart', 'statistics', 'reporting'],
  },
  'research-search': {
    strong: [
      'deep research',
      'literature review',
      'academic paper',
      'research paper',
      'citation',
      'scholar',
      'arxiv',
      'research assistant',
      'search engine',
      'web search',
      'fact check',
      'systematic review',
      'research',
    ],
    weak: ['papers', 'scientific', 'sources cited', 'bibliography', 'evidence'],
  },
  'customer-support': {
    strong: [
      'customer support',
      'customer service',
      'help desk',
      'helpdesk',
      'support ticket',
      'ticketing',
      'live chat',
      'zendesk',
      'intercom',
      'freshdesk',
      'support inbox',
      'faq',
      'customer inquiries',
      'service desk',
    ],
    weak: ['support agent', 'customer', 'escalation', 'sla'],
  },
  'meeting-notes': {
    strong: [
      'meeting notes',
      'meeting transcription',
      'meeting assistant',
      'meeting summary',
      'note taker',
      'notetaker',
      'standup notes',
      'minutes of meeting',
      'action items',
      'zoom call',
      'google meet',
      'otter',
    ],
    weak: ['meeting', 'minutes', 'standup', 'attendees', 'agenda'],
  },
  'pdf-documents': {
    strong: [
      'pdf',
      'docx',
      'document processing',
      'document extraction',
      'document conversion',
      'ocr',
      'word document',
      'office document',
      'file conversion',
      'scanned document',
      'form filling',
    ],
    weak: ['document', 'paperwork', 'markdown export', 'epub', 'xlsx'],
  },
  'knowledge-base': {
    strong: [
      'knowledge base',
      'knowledge graph',
      'rag',
      'retrieval augmented',
      'vector database',
      'vector search',
      'vector store',
      'embeddings',
      'semantic search',
      'second brain',
      'long term memory',
      'persistent memory',
      'memory layer',
      'obsidian vault',
      'memory',
    ],
    weak: ['retrieval', 'obsidian', 'notion', 'wiki', 'notes vault', 'context recall'],
  },
  translation: {
    strong: [
      'translation',
      'translate',
      'translator',
      'localization',
      'localisation',
      'i18n',
      'l10n',
      'multilingual',
      'subtitle translation',
      'machine translation',
    ],
    weak: ['language pair', 'bilingual', 'glossary'],
  },
  'resume-jobs': {
    strong: [
      'resume builder',
      'resume writing',
      'resume review',
      'resume screening',
      'curriculum vitae',
      'cover letter',
      'job search',
      'job application',
      'job board',
      'interview prep',
      'interview practice',
      'recruiting',
      'recruiter',
      'applicant tracking',
      'candidate screening',
      'salary negotiation',
      'job hunt',
      'job seeker',
    ],
    weak: ['resume', 'cv', 'career', 'job', 'jobs', 'hiring', 'applicant'],
  },
  bookkeeping: {
    strong: [
      'bookkeeping',
      'accounting',
      'invoice',
      'invoicing',
      'expense report',
      'expense tracking',
      'payroll',
      'general ledger',
      'tax return',
      'tax filing',
      'quickbooks',
      'financial statement',
      'reconciliation',
      'receipts',
      'finance',
      'financial',
      'quant finance',
      'portfolio',
    ],
    weak: ['billing', 'budget', 'budgeting', 'expenses', 'tax', 'accounts payable', 'trading', 'money'],
  },
  'legal-contract': {
    strong: [
      'contract review',
      'contract analysis',
      'legal review',
      'legal research',
      'law firm',
      'litigation',
      'nda',
      'terms of service',
      'privacy policy',
      'gdpr',
      'regulatory compliance',
      'license review',
      'licence review',
      'clause',
      'lease',
      'legal',
    ],
    weak: ['contract', 'compliance', 'lawyer', 'statute', 'liability', 'court', 'jurisdiction'],
  },
  coding: {
    strong: [
      'code review',
      'coding agent',
      'code generation',
      'coding assistant',
      'refactor',
      'refactoring',
      'debugging',
      'unit test',
      'pull request',
      'software engineering',
      'developer tool',
      'codebase',
      'linter',
      'type checking',
      'programming',
      'test driven',
      'spec driven',
    ],
    weak: [
      'code',
      'coding',
      'developer',
      'dev',
      'engineer',
      'engineering',
      'software',
      'repository',
      'typescript',
      'python',
      'compiler',
      'git',
      'terminal',
      'ide',
    ],
  },
  'browser-automation': {
    strong: [
      'browser automation',
      'headless browser',
      'browser agent',
      'web automation',
      'playwright',
      'puppeteer',
      'selenium',
      'browser extension',
      'chrome extension',
      'browser control',
      'form submission',
    ],
    weak: ['browser', 'chrome', 'clicks', 'dom'],
  },
  'web-scraping': {
    strong: [
      'web scraping',
      'web scraper',
      'scraper',
      'scraping',
      'crawler',
      'crawling',
      'data extraction',
      'html parsing',
      'structured extraction',
      'site crawl',
      'scrape',
      'crawl',
    ],
    weak: ['extraction', 'spider', 'parse html', 'proxy rotation'],
  },
  'workflow-automation': {
    strong: [
      'workflow automation',
      'task automation',
      'workflow orchestration',
      'orchestration',
      'zapier',
      'n8n',
      'integration platform',
      'rpa',
      'scheduled job',
      'event driven workflow',
      'business process',
      'workflow',
      'agent harness',
    ],
    weak: ['automation', 'orchestrate', 'pipeline', 'trigger', 'cron', 'multi agent', 'batch job'],
  },
  'architecture-diagram': {
    strong: [
      'architecture diagram',
      'diagram',
      'diagrams',
      'uml',
      'flowchart',
      'mermaid',
      'drawio',
      'sequence diagram',
      'c4 model',
      'entity relationship',
      'system design diagram',
      'graphviz',
      'excalidraw',
    ],
    weak: ['architecture', 'visualization', 'topology', 'schema drawing'],
  },
}


/** Evidence-driven addenda, merged into the vocabulary above at module load.
 *
 * The first measurement against the 287 labelled production rows confirmed
 * only 51% of the rows a human pass had judged correctly filed, and emptied
 * pdf-documents outright. A 3x3 sweep of the thresholds moved that between 44%
 * and 51%, and rows carrying full evidence (repo + topics) scored the same as
 * rows carrying little — so neither the bar nor the inputs were the constraint.
 * The vocabulary simply had no word for what these tools say about themselves.
 *
 * These terms come from reading the dropped rows, not from guessing: a GitHub
 * topic is normalised to spaces before matching, so `browser-automation` on a
 * repo is the phrase "browser automation" here.
 *
 * Deliberately NOT added: `marketing` to seo-geo / social-media / email-outreach
 * / lead-gen. The general "120 marketing skills" libraries sit in all four at
 * once; a shared term would score them equally everywhere, collapse the margin
 * and discard them from all four. They are genuinely ambiguous and discarding
 * them is the right answer, so the gap is left open on purpose. */
export const VOCABULARY_ADDENDA: Record<string, CategoryVocabulary> = {
  'browser-automation': { strong: ['browser automation', 'web automation', 'cloud browser', 'headless browser', 'anti bot', 'browser agent', 'searxng'], weak: ['browser', 'browse'] },
  coding: { strong: ['coding agent', 'code review', 'software engineering', 'refactor', 'pull request'], weak: ['engineer', 'developer', 'codebase'] },
  'content-writing': { strong: ['copywriting', 'academic writing', 'blog post', 'creative writing', 'novel writing', 'content writer', 'wechat'], weak: ['writing', 'article', 'prose'] },
  'email-outreach': { strong: ['cold email', 'email enrichment', 'email sequence', 'deliverability', 'outreach'], weak: ['email', 'inbox'] },
  'image-generation': { strong: ['text to image', 'image generation', 'generative media', 'diffusion'], weak: ['image'] },
  'knowledge-base': { strong: ['knowledge graph', 'knowledge base', 'second brain', 'retrieval'], weak: ['memory', 'vault'] },
  'lead-gen': { strong: ['lead generation', 'sales automation', 'prospecting', 'linkedin automation'], weak: ['leads', 'enrichment'] },
  'legal-contract': { strong: ['legal', 'contract analysis', 'bluebook', 'jurisdiction', 'legal writing'], weak: ['law', 'compliance'] },
  'meeting-notes': { strong: ['meeting notes', 'meeting assistant', 'note taker', 'transcription', 'meeting'], weak: ['minutes', 'transcript'] },
  'pdf-documents': { strong: ['pdf', 'docx', 'document conversion', 'study vault'], weak: ['document', 'docs'] },
  presentation: { strong: ['powerpoint', 'pptx', 'slide deck', 'presentation', 'slides'], weak: ['deck'] },
  'research-search': { strong: ['deep research', 'literature review', 'web search'], weak: ['research'] },
  // `resume` alone is not usable here and the test proves it: a tool named
  // `resume-skills` that resumes a coding session matches it on its own
  // name, which is the exact defect this module exists to remove. Only
  // phrases that cannot mean "resume a session" are strong.
  'resume-jobs': { strong: ['job search', 'cover letter', 'resume writing', 'applicant tracking'], weak: ['resume', 'cv', 'career', 'interview'] },
  translation: { strong: ['video translation', 'dubbing', 'subtitles', 'localization', 'localisation'], weak: ['translate', 'multilingual'] },
  'video-generation': { strong: ['video generation', 'text to video', 'ai video', 'video editing', 'video recap'], weak: ['video'] },
  'voice-audio': { strong: ['text to speech', 'audio generation', 'voice cloning', 'notebooklm', 'podcast', 'speech'], weak: ['audio', 'voice'] },
  'web-scraping': { strong: ['web scraping', 'scraper', 'crawler'], weak: ['scrape', 'crawl'] },
  'workflow-automation': { strong: ['workflow', 'orchestration', 'agent harness', 'plugin marketplace'], weak: ['automation', 'pipeline'] },
}

for (const [slug, extra] of Object.entries(VOCABULARY_ADDENDA)) {
  const base = CATEGORY_VOCABULARY[slug]
  if (!base) continue
  base.strong = [...new Set([...base.strong, ...extra.strong])]
  base.weak = [...new Set([...base.weak, ...extra.weak])]
}

export const CATEGORY_SLUGS: string[] = Object.keys(CATEGORY_VOCABULARY)

export type Track = 'saas' | 'oss' | 'skill'

export interface Candidate {
  name: string
  description?: string | null
  /** GitHub topics. Ignored for `saas`, see `readableText`. */
  topics?: string[] | null
  track: Track
}

export interface Assignment {
  slug: string
  /** Weighted evidence for the winner. */
  score: number
  /** How far ahead of the second-placed category it finished. */
  margin: number
  /** The terms that placed it, for evidence and for debugging a bad call. */
  matched: string[]
}

export const STRONG_WEIGHT = 3
export const WEAK_WEIGHT = 1

/** What the author called the thing is worth more than what they mentioned in
 * passing. `finance-skills` is about finance; a repo whose blurb lists finance
 * among nine other departments is not. The bonus is paid once per category, no
 * matter how many of its terms are in the name — a name is short, and paying
 * per word would just reward long hyphenated names. */
export const NAME_BONUS = 2

/** The bar. One strong phrase, or three weak words, and a clear win over the
 * runner-up. Both halves matter: the score alone lets a tool that talks about
 * everything win everywhere, and the margin alone lets a tool with one weak
 * word win a category no other word touched. */
export const MIN_SCORE = 3
export const MIN_MARGIN = 2

/** The bar for a source that is allowed to place a listing without a second
 * origin (`mayPlaceAlone` in sources.json). Corroboration is what normally
 * stops a keyword match from becoming a row; when a source is excused from it —
 * because every skill source is GitHub and two origins are unreachable — the
 * classification has to carry the weight instead, so it is held higher. */
export const SOLO_MIN_SCORE = 6
export const SOLO_MIN_MARGIN = 4

/** Lowercase, strip everything that is not a letter or a digit, collapse.
 * Hyphens and underscores become spaces so `claude-code-recap` is three words
 * and `pdf_tools` is two. CJK is left alone: it survives as its own runs and
 * simply never matches an English term, which is the honest outcome. */
export function normalise(text: string): string {
  return ` ${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `
}

const patternCache = new Map<string, RegExp>()

/** Word-boundary match with an optional plural. This is the whole fix for the
 * substring family of errors: "resume" no longer fires on "resumable", "sql"
 * no longer fires on "SQLite", "cv" no longer fires on "cvs". A term with a
 * space is matched as the phrase it is. */
function pattern(term: string): RegExp {
  let re = patternCache.get(term)
  if (!re) {
    const words = normalise(term).trim().split(' ').filter(Boolean)
    if (words.length === 0) return /(?!)/
    const body = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(' ')
    re = new RegExp(`(?<=[^\\p{L}\\p{N}])${body}s?(?=[^\\p{L}\\p{N}])`, 'u')
    patternCache.set(term, re)
  }
  return re
}

export function matches(haystack: string, term: string): boolean {
  return pattern(term).test(haystack)
}

/** What the rule is allowed to read.
 *
 * Split by track on purpose (ticket D11). GitHub topics are the author's own
 * classification and the best signal we have for `oss` and `skill`. For `saas`
 * the only source is Product Hunt, whose name and tagline are what the job
 * stores — so those two fields are all this rule may use, or the result would
 * be unreproducible the moment the row is in the database. */
export function readableText(candidate: Candidate): string {
  const parts = [candidate.name ?? '', candidate.description ?? '']
  if (candidate.track !== 'saas' && candidate.topics?.length) {
    parts.push(candidate.topics.join(' '))
  }
  return normalise(parts.join(' '))
}

/** A repo that is a bag of skills for every profession belongs to no category,
 * and saying so is the honest answer. These match every vocabulary at once, so
 * without this they are placed by whichever search ran first — which is exactly
 * the defect this module exists to remove. */
export function isOmnibus(haystack: string): boolean {
  OMNIBUS_COUNT.lastIndex = 0
  for (const m of haystack.matchAll(OMNIBUS_COUNT)) {
    if (Number(m[1]) >= OMNIBUS_COUNT_THRESHOLD) return true
  }
  return OMNIBUS_PHRASES.some((phrase) => matches(haystack, phrase))
}

export interface CategoryScore {
  slug: string
  score: number
  matched: string[]
}

/** Every category, scored, best first. Exported because a ranked list is what
 * you want when you are asking why a call went the way it did. */
export function scoreCategories(
  candidate: Candidate,
  vocabulary: Record<string, CategoryVocabulary> = CATEGORY_VOCABULARY,
): CategoryScore[] {
  const hay = readableText(candidate)
  const nameHay = normalise(candidate.name ?? '')
  const scored: CategoryScore[] = []
  for (const [slug, vocab] of Object.entries(vocabulary)) {
    let score = 0
    let named = false
    const matched: string[] = []
    // A term counts once. Repeating "video" six times in a tagline is
    // enthusiasm, not evidence, and length would otherwise buy placement.
    const take = (term: string, weight: number) => {
      if (!matches(hay, term)) return
      score += weight
      matched.push(term)
      if (matches(nameHay, term)) named = true
    }
    for (const term of vocab.strong) take(term, STRONG_WEIGHT)
    for (const term of vocab.weak) take(term, WEAK_WEIGHT)
    if (named) score += NAME_BONUS
    scored.push({ slug, score, matched })
  }
  return scored.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
}

export interface AssignOptions {
  vocabulary?: Record<string, CategoryVocabulary>
  minScore?: number
  minMargin?: number
}

/** The one call the job makes. Null means "not sure", and not-sure means the
 * candidate is dropped: the corpus is better one row short than one row wrong,
 * and there is no default category to fall back to. */
export function assignCategory(
  candidate: Candidate,
  options: AssignOptions = {},
): Assignment | null {
  const minScore = options.minScore ?? MIN_SCORE
  const minMargin = options.minMargin ?? MIN_MARGIN

  if (!candidate?.name) return null
  const hay = readableText(candidate)
  if (isOmnibus(hay)) return null

  const [best, second] = scoreCategories(candidate, options.vocabulary)
  if (!best || best.score < minScore) return null
  const margin = best.score - (second?.score ?? 0)
  if (margin < minMargin) return null

  return { slug: best.slug, score: best.score, margin, matched: best.matched }
}

/** Does this assignment clear the higher bar a source needs to place a listing
 * on its own, with no second origin corroborating it? (Ticket D2.) */
export function clearsSoloBar(assignment: Assignment | null): boolean {
  return (
    assignment != null &&
    assignment.score >= SOLO_MIN_SCORE &&
    assignment.margin >= SOLO_MIN_MARGIN
  )
}
