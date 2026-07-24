import type { DetailPanelItem } from '~/components/product-detail-panel'
import { CURATED_TRENDING_REVIEWS } from '~/content/github-trending-curated'

import type { TrendingRepository } from './github-trending-parser'

type CategoryRule = {
  name: string
  pattern: RegExp
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    name: 'Browser Automation',
    pattern: /\b(playwright|puppeteer|selenium|browser automation|headless browser|web automation)\b/i,
  },
  {
    name: 'Research & Search',
    pattern: /\b(research|search engine|intelligence|monitoring|news aggregation|osint|knowledge discovery)\b/i,
  },
  {
    name: 'Knowledge Base / RAG',
    pattern: /\b(rag|retrieval augmented|knowledge base|vector database|semantic search|second brain)\b/i,
  },
  {
    name: 'Workflow Automation',
    pattern: /\b(workflow|automation|agent skills?|claude skills?|skills for|agentic|orchestration|integration|hive mind)\b/i,
  },
  {
    name: 'Data Analysis',
    pattern: /\b(data analysis|analytics|dashboard|visualization|business intelligence|data science|database tool|sql client)\b/i,
  },
  {
    name: 'Image Generation',
    pattern: /\b(image generation|text-to-image|diffusion|stable diffusion|computer vision)\b/i,
  },
  {
    name: 'Video Generation',
    pattern: /\b(video generation|text-to-video|video editing|animation)\b/i,
  },
  {
    name: 'Voice & Audio',
    pattern: /\b(audio|voice|speech|text-to-speech|music generation|transcription)\b/i,
  },
  {
    name: 'Content Writing',
    pattern: /\b(writing|copywriting|content generation|markdown editor|blogging|grammar checker)\b/i,
  },
  {
    name: 'UI Design',
    pattern: /\b(ui design|design system|frontend design|component library|wireframe)\b/i,
  },
  {
    name: 'PDF & Documents',
    pattern: /\b(pdf|document processing|document extraction|ocr)\b/i,
  },
  {
    name: 'Presentations & Slides',
    pattern: /\b(presentation|slides|powerpoint|pptx)\b/i,
  },
  {
    name: 'Translation',
    pattern: /\b(translation|translator|localization|machine translation)\b/i,
  },
  {
    name: 'SEO & GEO',
    pattern: /\b(seo|search optimization|geo optimization|keyword research)\b/i,
  },
  {
    name: 'Social Media',
    pattern: /\b(social media|twitter|linkedin|instagram|mastodon)\b/i,
  },
  {
    name: 'Customer Support',
    pattern: /\b(customer support|helpdesk|support agent|ticketing)\b/i,
  },
  {
    name: 'Meeting Notes',
    pattern: /\b(meeting notes|meeting assistant|minutes|call transcription)\b/i,
  },
  {
    name: 'Lead Generation',
    pattern: /\b(lead generation|prospecting|sales intelligence|sales development)\b/i,
  },
  {
    name: 'Email Outreach',
    pattern: /\b(email outreach|cold email|email campaign|email automation)\b/i,
  },
  {
    name: 'Bookkeeping & Finance',
    pattern: /\b(bookkeeping|accounting|finance|financial|invoice|expense)\b/i,
  },
  {
    name: 'Legal & Contracts',
    pattern: /\b(legal|contract|compliance|law firm)\b/i,
  },
  {
    name: 'Resume & Job Search',
    pattern: /\b(resume|job search|recruiting|career|applicant tracking)\b/i,
  },
  {
    name: 'Diagrams & Architecture',
    pattern: /\b(diagram|architecture|uml|flowchart|system design)\b/i,
  },
]

const CATEGORY_FEATURES: Record<string, string[]> = {
  'Browser Automation': ['Browser-driven automation', 'Repeatable web workflows'],
  'Research & Search': ['Source discovery and monitoring', 'Searchable intelligence'],
  'Knowledge Base / RAG': ['Knowledge retrieval', 'Source-grounded workflows'],
  'Workflow Automation': ['Automated multi-step workflows', 'Tool and service orchestration'],
  'Data Analysis': ['Data exploration', 'Analysis and reporting'],
  'Image Generation': ['Image generation workflow', 'Model or asset customization'],
  'Video Generation': ['Video generation workflow', 'Video processing'],
  'Voice & Audio': ['Audio processing', 'Voice or speech workflows'],
  'Content Writing': ['Content drafting workflow', 'Text transformation'],
  'UI Design': ['Interface design workflow', 'Reusable UI components'],
  'PDF & Documents': ['Document processing', 'Structured document output'],
  'Presentations & Slides': ['Presentation generation', 'Slide authoring workflow'],
  Translation: ['Multilingual translation', 'Localization workflow'],
  'SEO & GEO': ['Search optimization workflow', 'Keyword and visibility analysis'],
  'Social Media': ['Social publishing workflow', 'Audience content operations'],
  'Customer Support': ['Support workflow automation', 'Customer-response tooling'],
  'Meeting Notes': ['Meeting capture', 'Notes and action extraction'],
  'Lead Generation': ['Prospect discovery', 'Lead research workflow'],
  'Email Outreach': ['Email campaign workflow', 'Personalized outreach'],
  'Bookkeeping & Finance': ['Financial workflow automation', 'Structured finance data'],
  'Legal & Contracts': ['Legal document workflow', 'Contract analysis'],
  'Resume & Job Search': ['Job-search workflow', 'Resume or application support'],
  'Diagrams & Architecture': ['Diagram generation', 'Architecture documentation'],
  Coding: ['Developer workflow', 'Source-based customization'],
}

export type GitHubRepositoryMetadata = {
  html_url: string
  homepage: string | null
  description: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  license: { spdx_id: string | null; name: string } | null
  pushed_at: string | null
}

export type GitHubIssueSignal = {
  title: string
  html_url: string
  comments: number
  pull_request?: unknown
}

export function classifyTrendingRepository({
  name,
  description,
  language,
  topics = [],
  readme = '',
}: {
  name: string
  description: string
  language: string | null
  topics?: string[]
  readme?: string
}): string {
  const haystack = `${name} ${description} ${language ?? ''} ${topics.join(' ')} ${readme.slice(0, 4000)}`
  return CATEGORY_RULES.find((rule) => rule.pattern.test(haystack))?.name ?? 'Coding'
}

function cleanMarkdownText(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function toFeatureLabel(value: string): string {
  const cleaned = cleanMarkdownText(value)
    .replace(/^[\s:–—-]+|[.;:,]+$/g, '')
    .trim()
  return cleaned.length > 92 ? `${cleaned.slice(0, 89).trim()}...` : cleaned
}

function readableTopic(topic: string): string {
  return topic
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function uniqueShort(values: string[], limit: number): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const normalized = value.toLowerCase()
    if (!value || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(value)
    if (result.length === limit) break
  }
  return result
}

export function extractReadmeFeatures(
  readme: string,
  category: string,
  topics: string[],
  description: string,
  language: string | null,
): string[] {
  const candidates: string[] = []
  let inFeatureSection = false

  for (const rawLine of readme.split(/\r?\n/)) {
    const heading = rawLine.match(/^#{1,4}\s+(.+)$/)
    if (heading) {
      const title = cleanMarkdownText(heading[1])
      inFeatureSection =
        /\b(features?|capabilities|highlights?|what .*does|what .*can|overview)\b/i.test(title)
      continue
    }

    if (!inFeatureSection) continue
    const bullet = rawLine.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/)
    if (!bullet) continue

    const feature = toFeatureLabel(bullet[1])
    if (
      feature.length >= 8 &&
      feature.length <= 92 &&
      !/^(install|npm |pnpm |yarn |pip |docker |http|contribut|sponsor|license)/i.test(feature)
    ) {
      candidates.push(feature)
    }
  }

  if (description) candidates.push(toFeatureLabel(description))
  candidates.push(...topics.slice(0, 4).map(readableTopic))
  if (language) candidates.push(`${language} implementation`)
  candidates.push(...(CATEGORY_FEATURES[category] ?? CATEGORY_FEATURES.Coding))

  return uniqueShort(candidates, 4).slice(0, Math.max(2, Math.min(4, candidates.length)))
}

function issueLimitation(issue: GitHubIssueSignal): string {
  const title = cleanMarkdownText(issue.title)
  const shortTitle = title.length > 110 ? `${title.slice(0, 107).trim()}...` : title
  return `Community issue${issue.comments ? ` (${issue.comments} comments)` : ''}: ${shortTitle}`
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

export function buildTrendingDetailItem({
  repository,
  metadata,
  readme,
  issues,
}: {
  repository: TrendingRepository
  metadata: GitHubRepositoryMetadata | null
  readme: string
  issues: GitHubIssueSignal[]
}): DetailPanelItem {
  const category = classifyTrendingRepository({
    ...repository,
    topics: metadata?.topics ?? [],
    readme,
  })
  const totalStars = metadata?.stargazers_count.toLocaleString('en-US') ?? repository.stars
  const forks = metadata?.forks_count.toLocaleString('en-US')
  const pushedAt = formatDate(metadata?.pushed_at ?? null)
  const licenseId = metadata?.license?.spdx_id
  const recognizedLicense = licenseId && licenseId !== 'NOASSERTION' ? licenseId : null
  const concreteSignals = [
    `#${repository.rank} on GitHub Trending`,
    `+${repository.starsToday} stars today`,
    `${totalStars} total stars`,
    forks ? `${forks} forks` : null,
    pushedAt ? `last pushed ${pushedAt}` : null,
  ].filter(Boolean)
  const issueSignals = issues
    .filter((issue) => !issue.pull_request && issue.title)
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 2)

  const pros = uniqueShort(
    [
      `Strong current momentum: +${repository.starsToday} stars today on GitHub Trending`,
      `${totalStars} stars${forks ? ` and ${forks} forks` : ''} provide a concrete adoption signal`,
      pushedAt ? `Repository activity is current, with the latest push on ${pushedAt}` : '',
    ],
    3,
  )

  const cons = uniqueShort(
    [
      ...issueSignals.map(issueLimitation),
      !recognizedLicense ? 'No recognized open-source license is reported by the GitHub API' : '',
      'Trending placement is a short-term momentum signal, not a hands-on quality test',
      'Using the repository directly may require local setup and ongoing maintenance',
    ],
    3,
  ).slice(0, 3)

  const sources = [
    { name: 'GitHub repository', url: repository.url },
    { name: 'Official README', url: `${repository.url}#readme` },
    { name: 'GitHub Trending', url: 'https://github.com/trending' },
  ]
  if (issueSignals.length) {
    sources.push({
      name: 'Community issues',
      url: `${repository.url}/issues?q=is%3Aissue+sort%3Acomments-desc`,
    })
  }

  const description = metadata?.description?.trim() || repository.description

  const generatedItem: DetailPanelItem = {
    id: repository.url,
    rank: repository.rank,
    name: repository.name,
    homepage: metadata?.homepage || metadata?.html_url || repository.url,
    pricing: recognizedLicense ? `Open source (${recognizedLicense})` : 'Public GitHub repository',
    bestFor: description,
    confidence: metadata && readme ? 'medium' : 'low',
    badge: 'provisional',
    sources,
    kind: 'repo',
    track: 'skill',
    typeLabel: 'Skill / Repo',
    rankBasis: `${concreteSignals.join(', ')}. Categorized as ${category} from its official repository description, topics, and README.`,
    pricingFree: recognizedLicense
      ? `Free & open-source (${recognizedLicense}; self-host)`
      : 'Public source on GitHub; no recognized open-source license detected',
    pricingPaid: null,
    features: extractReadmeFeatures(
      readme,
      category,
      metadata?.topics ?? [],
      description,
      metadata?.language ?? repository.language,
    ),
    pros,
    cons,
  }

  const curated = CURATED_TRENDING_REVIEWS[repository.name]
  return curated
    ? {
        ...generatedItem,
        ...curated,
        id: repository.url,
        rank: repository.rank,
        name: repository.name,
        kind: 'repo',
        track: 'skill',
        typeLabel: 'Skill / Repo',
      }
    : generatedItem
}
