/* Shell + shared data for the v2 mockup.
 * The product is a task-decision site: you arrive with a job, and each job shows
 * the same three forms side by side. The left column is the task directory. */

const TASKS = [
  ['content-writing', 'Content Writing'], ['video-generation', 'Video Generation'],
  ['image-generation', 'Image Generation'], ['voice-audio', 'Voice & Audio'],
  ['lead-gen', 'Lead Generation'], ['email-outreach', 'Email Outreach'],
  ['seo-geo', 'SEO & GEO'], ['social-media', 'Social Media'],
  ['ui-design', 'UI Design'], ['presentation', 'Presentations & Slides'],
  ['data-analysis', 'Data Analysis'], ['research-search', 'Research & Search'],
  ['customer-support', 'Customer Support'], ['meeting-notes', 'Meeting Notes'],
  ['pdf-documents', 'PDF & Documents'], ['knowledge-base', 'Knowledge Base / RAG'],
  ['translation', 'Translation'], ['resume-jobs', 'Resume & Job Search'],
  ['bookkeeping', 'Bookkeeping & Finance'], ['legal-contract', 'Legal & Contracts'],
  ['coding', 'Coding'], ['browser-automation', 'Browser Automation'],
  ['web-scraping', 'Web Scraping'], ['workflow-automation', 'Workflow Automation'],
  ['architecture-diagram', 'Diagrams & Architecture'],
];

/* The three forms, compared side by side for every task. */
const TRACKS = [
  { key: 'saas', label: 'App / SaaS', dot: '#4257c9' },
  { key: 'oss', label: 'Open Source', dot: '#0d7d78' },
  { key: 'skill', label: 'Skills / Agents', dot: '#7a49d6' },
];

const MONO = ['#3b6fb0', '#8e5bb5', '#0d7d78', '#c0662f', '#2f9e6b', '#b8860b'];
const mono = (n, i) => MONO[(n.charCodeAt(0) + i) % MONO.length];

function shell({ active = '' } = {}) {
  const items = TASKS.map(
    ([slug, name]) => `<a href="category.html" class="rounded-lg px-3.5 py-[7px] text-[13.5px] transition ${
      slug === active
        ? 'bg-blue-50 font-semibold text-blue-700'
        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
    }">${name}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="z-30 flex h-[58px] flex-shrink-0 items-center gap-5 border-b border-neutral-200 bg-white px-5">
      <a href="category.html" class="text-[20px] font-extrabold tracking-tight">Which<span class="text-blue-600">ToUse</span></a>
      <span class="hidden text-[12.5px] text-neutral-400 md:block">Pick by the job, not by the tool</span>
      <button class="ml-auto flex h-[36px] w-full max-w-[380px] items-center gap-2.5 rounded-full border border-neutral-200 px-4 text-left text-[13px] text-neutral-400 transition hover:border-neutral-300 hover:bg-neutral-50">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        Search
        <kbd class="ml-auto rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">⌘K</kbd>
      </button>
    </header>
    <div class="flex min-h-0 flex-1">
      <aside class="hidden w-[228px] flex-shrink-0 overflow-y-auto border-r border-neutral-200 py-3 lg:block">
        <div class="px-4 pb-2 text-[10.5px] font-bold uppercase tracking-[0.09em] text-neutral-400">Tasks</div>
        <nav class="flex flex-col gap-px px-2">${items}</nav>
      </aside>
      <main id="main" class="min-w-0 flex-1 overflow-y-auto"></main>
    </div>
  `);
  return document.getElementById('main');
}

/* Two standings per form. Both labels are participles, not nouns: a participle
 * is a state that currently holds and can stop holding, which is what a
 * standing re-checked every few weeks actually is. */
const LISTS = [
  { key: 'leading',  label: 'Leading',  note: 'held the top for 12+ months' },
  { key: 'emerging', label: 'Emerging', note: 'climbing fast, not yet proven' },
];

/* Each entry is exactly three sentences and they must not overlap:
 *   desc  — what it is, neutral, no judgement
 *   edge  — the one thing it does better than the others here
 *   con   — the single biggest reason not to pick it
 * Everything else (pricing, who it suits, sources, when we checked) belongs on
 * the detail page. A list is for deciding what to open, not for reading. */
const TASK = {
  name: 'Content Writing',
  note: 'General-purpose models absorbed most of this job. What is left for dedicated tools is brand voice and team workflow; the open-source side is genuinely thin.',

  saas: {
    leading: [
      { n:'ChatGPT', desc:'OpenAI’s general assistant, used here as a drafting tool.',
        edge:'Strongest raw generation from a blank page', con:'Drifts off-voice past a few thousand words' },
      { n:'Claude', desc:'Anthropic’s assistant, with a long working context.',
        edge:'Holds one voice across a whole document', con:'Free tier throttles quickly' },
      { n:'Jasper', desc:'A marketing writing suite built around brand voice.',
        edge:'Real brand-voice and team controls', con:'Expensive, and output reads templated' },
      { n:'Grammarly', desc:'An editing layer that sits on top of your existing writing.',
        edge:'Works inside almost every writing surface', con:'Edits only — it will not write for you' },
      { n:'Notion AI', desc:'Writing assistance inside the Notion workspace.',
        edge:'No context-switching if you already live there', con:'Weaker than a dedicated model for real drafting' },
      { n:'Writesonic', desc:'A template-driven generator aimed at marketing volume.',
        edge:'Cheapest way to bulk-generate copy', con:'Quality varies hard between runs' },
      { n:'Copy.ai', desc:'Short-form ad and email copy from templates.',
        edge:'Fast at producing many variants', con:'Thin the moment you leave its templates' },
      { n:'Writer', desc:'An enterprise platform for governed, on-brand content.',
        edge:'Terminology and compliance enforcement', con:'Sales-led pricing, heavy to adopt' },
      { n:'Rytr', desc:'A budget generator with a small feature surface.',
        edge:'Lowest paid tier in this list', con:'Noticeably weaker output than the tools above' },
      { n:'Anyword', desc:'Copy generation scored against predicted performance.',
        edge:'Predicts which variant will convert', con:'Predictions are directional, not truth' },
    ],
    emerging: [
      { n:'Lex', desc:'A writing app with AI kept to the margins.',
        edge:'The calmest writing surface here', con:'Deliberately fewer features than the leaders' },
      { n:'Type', desc:'A document editor that drafts from your research.',
        edge:'Smooth research-to-draft flow', con:'Small team, short track record' },
      { n:'HyperWrite', desc:'An agentic writer that browses while it drafts.',
        edge:'Pulls live facts into the document', con:'Agent steps fail quietly and burn tokens' },
      { n:'Cohesive', desc:'A template library spanning many content formats.',
        edge:'Widest format coverage of the newcomers', con:'Shallow in every one of them' },
      { n:'Wordware', desc:'A builder for your own writing pipelines.',
        edge:'Composable and fully inspectable', con:'You end up building a tool, not using one' },
      { n:'Bearly', desc:'A desktop reader-summariser-writer.',
        edge:'Fastest capture-to-draft loop', con:'Drafting quality lags the leaders' },
      { n:'Sudowrite', desc:'A writing tool shaped for fiction.',
        edge:'Craft tools no general model exposes', con:'Actively unhelpful for business writing' },
      { n:'Wordtune', desc:'A rewriter that changes register while keeping meaning.',
        edge:'Best single-sentence rewrites anywhere', con:'Little help above the sentence' },
    ],
  },

  oss: {
    leading: [
      { n:'Open WebUI', desc:'A self-hosted chat front-end for any model backend.',
        edge:'Model-agnostic with a mature interface', con:'A shell — quality is whatever model you attach' },
      { n:'Novel', desc:'An open Notion-style editor with AI completions.',
        edge:'The cleanest embeddable editing surface', con:'You supply the model, the keys and the hosting' },
      { n:'LibreChat', desc:'Multi-model chat you can host for a team.',
        edge:'Serious multi-user hosting and auth', con:'Not writing-specific in any way' },
      { n:'AnythingLLM', desc:'A local RAG workspace over your own documents.',
        edge:'Straightforward grounding in your files', con:'Heavier to run than this job needs' },
      { n:'Jan', desc:'A fully offline desktop assistant.',
        edge:'Genuinely offline, easy to install', con:'Local models still trail hosted ones for prose' },
      { n:'Reor', desc:'A local-first note app with retrieval built in.',
        edge:'Search across your own corpus, offline', con:'Writing is adjacent, not the focus' },
      { n:'Khoj', desc:'A personal assistant over your notes and documents.',
        edge:'Strongest personal-corpus search here', con:'Setup is a project in itself' },
      { n:'Onyx', desc:'Team knowledge search that can draft from what it finds.',
        edge:'Many first-party connectors', con:'Overkill for an individual writer' },
    ],
    emerging: [
      { n:'harper', desc:'An offline grammar checker written in Rust.',
        edge:'Runs locally — no text leaves the machine', con:'Checks only — no rewriting, no generation' },
      { n:'Perplexica', desc:'An open answer engine you can self-host.',
        edge:'Cited answers without a third party', con:'Only as good as the search backend you give it' },
      { n:'Karakeep', desc:'A capture tool that files links and pages for later.',
        edge:'Fast capture with automatic tagging', con:'Not a writing tool by itself' },
      { n:'Morphic', desc:'A generative answer interface you can fork.',
        edge:'Clean, genuinely hackable codebase', con:'A starting point, not a product' },
      { n:'Papra', desc:'A document store with extraction built in.',
        edge:'Sane handling of filed documents', con:'Young, with a small maintainer base' },
      { n:'SurfSense', desc:'A research assistant over your browsing and files.',
        edge:'Ingests an unusually wide range of sources', con:'Rough edges everywhere; early software' },
    ],
  },

  skill: {
    leading: [
      { n:'Anthropic Document Skills', desc:'Official skills that produce real office documents.',
        edge:'Outputs editable .docx and .pptx, not text', con:'No GUI — you install and wire it yourself' },
      { n:'awesome-claude-skills', desc:'A curated index of published agent skills.',
        edge:'Broadest coverage of what exists', con:'An index, not a tool — quality inside varies' },
      { n:'content-research-writer', desc:'A skill covering research through to a cited draft.',
        edge:'Handles the whole chain in one pass', con:'Adoption inherited from its parent collection' },
      { n:'mattpocock/skills', desc:'Opinionated skills from a well-known maintainer.',
        edge:'Consistent, well-reviewed conventions', con:'Written for its author’s workflow first' },
      { n:'seo-content-writer', desc:'A drafting skill shaped around target keywords.',
        edge:'SEO structure out of the box', con:'One maintainer, little independent review' },
      { n:'writing-style-editor', desc:'A skill that enforces a style guide over a draft.',
        edge:'Deterministic, rule-driven edits', con:'Useless without a style guide you have written' },
      { n:'docs-to-blog', desc:'Turns existing documentation into posts.',
        edge:'Very predictable output', con:'Only works if the docs already exist' },
    ],
    emerging: [
      { n:'blog-post-agent', desc:'End-to-end post drafting from a brief.',
        edge:'One command from brief to draft', con:'Almost no control over intermediate steps' },
      { n:'academic-writer-skill', desc:'Citation-disciplined drafting for papers.',
        edge:'Handles reference formats properly', con:'Rigid outside academic structure' },
      { n:'newsletter-skill', desc:'Assembles a week of links into an issue.',
        edge:'Genuinely saves the assembly hour', con:'Voice needs heavy editing afterwards' },
      { n:'style-transfer-skill', desc:'Rewrites a draft into a target voice from samples.',
        edge:'Sample-driven, no prompt engineering', con:'Needs a lot of clean samples to work' },
      { n:'skill-seeker', desc:'Finds and installs skills for a described job.',
        edge:'Removes the discovery problem', con:'Recommends without evaluating quality' },
    ],
  },

  /* Pulled or being re-checked. Names and links only. */
  watchlist: [
    { n:'Office-PowerPoint-MCP-Server', url:'#' },
    { n:'SlideSpeak MCP', url:'#' },
    { n:'Peppertype', url:'#' },
    { n:'Smart Copy (Unbounce)', url:'#' },
    { n:'Wordtune', url:'#' },
  ],
};
