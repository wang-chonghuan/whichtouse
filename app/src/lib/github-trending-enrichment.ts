// Category classification for GitHub Trending rows. The rest of this module
// built the old detail drawer, which the demo replaces with a real product
// page; only the classifier survives, because the trending list still labels
// each repo with a category.

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
