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

/* Why something is no longer in a standing. Only these three exist: anything
 * still under evaluation is editorial workflow and never reaches the page. */
const STATUS = {
  watching: ['Re-checking', 'bg-amber-50 text-amber-700 ring-amber-200'],
  delisted: ['Delisted',    'bg-neutral-100 text-neutral-500 ring-neutral-300'],
  rejected: ['Rejected',    'bg-rose-50 text-rose-600 ring-rose-200'],
};

const MONO = ['#3b6fb0', '#8e5bb5', '#0d7d78', '#c0662f', '#2f9e6b', '#b8860b'];
const mono = (n, i) => MONO[(n.charCodeAt(0) + i) % MONO.length];

function shell({ active = '', home = false } = {}) {
  const items = TASKS.map(
    ([slug, name]) => `<a href="category.html" class="rounded-lg px-3.5 py-[7px] text-[13.5px] transition ${
      slug === active
        ? 'bg-blue-50 font-semibold text-blue-700'
        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
    }">${name}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="z-30 flex h-[58px] flex-shrink-0 items-center gap-5 border-b border-neutral-200 bg-white px-5">
      <a href="home.html" class="text-[20px] font-extrabold tracking-tight">Which<span class="text-blue-600">ToUse</span></a>
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

/* Two standings per form. Vocabulary chosen deliberately:
 * Both are participles, not nouns. "Leaders" would read as a title conferred;
 * "Leading" reads as a state that currently holds and can stop holding — which
 * is what a standing re-checked every few weeks actually is. A bare participle
 * heading is standard in this context (Trending, Featured), and the one-line
 * definition beside it supplies the noun. */
const LISTS = [
  { key: 'incumbents',  label: 'Leading',  note: 'held the top for 12+ months' },
  { key: 'challengers', label: 'Emerging', note: 'climbing fast, not yet proven' },
];

/* ---- one task's data: Content Writing, used by both screens ---- */
const TASK = {
  name: 'Content Writing',
  note: 'General-purpose models absorbed most of this job. What is left for dedicated tools is brand voice and team workflow; the open-source side is genuinely thin.',

  saas: {
    incumbents: [
      { n:'ChatGPT', url:'openai.com', verdict:'The strongest all-round first draft.',
        who:'Anyone who needs volume from a blank page.',
        pro:'Best raw generation in this task', con:'Drifts off-voice past a few thousand words',
        price:'Free tier · $20/mo', checked:'Jul 23' },
      { n:'Claude', url:'claude.ai', verdict:'Holds a voice across a long document better than anything else here.',
        who:'Long-form writers who care about tone consistency.',
        pro:'Most consistent over long documents', con:'Free tier throttles quickly',
        price:'Free tier · $20/mo', checked:'Jul 23' },
      { n:'Jasper', url:'jasper.ai', verdict:'Built for brand voice and marketing teams, priced accordingly.',
        who:'Marketing teams with a style guide to enforce.',
        pro:'Real brand-voice and team controls', con:'Expensive, and output reads templated',
        price:'No free tier · from $49/mo', checked:'Jul 20' },
      { n:'Grammarly', url:'grammarly.com', verdict:'Edits what you already wrote. It will not write it for you.',
        who:'People who can draft but not self-edit.',
        pro:'Works inside almost every writing surface', con:'Flattens a deliberate voice',
        price:'Free tier · $12/mo', checked:'Jul 23' },
      { n:'Notion AI', url:'notion.so', verdict:'Good enough writing where your documents already live.',
        who:'Teams already running on Notion.',
        pro:'Zero context-switching', con:'Weaker than a dedicated model for real drafting',
        price:'Add-on · $10/user/mo', checked:'Jul 22' },
      { n:'Writesonic', url:'writesonic.com', verdict:'Cheap bulk marketing copy, with the quality swings that implies.',
        who:'High-volume, low-stakes ad and SEO copy.',
        pro:'Cheapest way to bulk-generate', con:'Quality varies hard between runs',
        price:'Free tier · from $16/mo', checked:'Jul 20' },
      { n:'Copy.ai', url:'copy.ai', verdict:'Short-form ad and email variants, little beyond templates.',
        who:'Performance marketers testing many variants.',
        pro:'Fast variant generation', con:'Thin outside its templates',
        price:'Free tier · from $49/mo', checked:'Jul 20' },
      { n:'Writer', url:'writer.com', verdict:'The enterprise answer: governance first, generation second.',
        who:'Regulated teams needing audit and terminology control.',
        pro:'Serious governance and term enforcement', con:'Sales-led pricing, heavy to adopt',
        price:'Enterprise · quote only', checked:'Jul 19' },
      { n:'Rytr', url:'rytr.me', verdict:'The budget option; you feel the price in the output.',
        who:'Hobby projects with no budget.',
        pro:'Cheapest paid tier here', con:'Noticeably weaker generation',
        price:'Free tier · from $9/mo', checked:'Jul 19' },
      { n:'Anyword', url:'anyword.com', verdict:'Copy scored against predicted performance, not taste.',
        who:'Teams that A/B test copy as a habit.',
        pro:'Predictive scoring is genuinely differentiated', con:'Predictions are directional, not truth',
        price:'From $49/mo', checked:'Jul 19' },
    ],
    challengers: [
      { n:'Lex', url:'lex.page', verdict:'A writing app that happens to have AI, not the reverse.',
        who:'Writers who want the editor to stay out of the way.',
        pro:'The calmest writing surface in this list', con:'Deliberately fewer features than the incumbents',
        price:'Free tier · $12/mo', checked:'Jul 24' },
      { n:'Type', url:'type.ai', verdict:'Document-first drafting with the model in the margin.',
        who:'Long documents assembled from research.',
        pro:'Good research-to-draft flow', con:'Small team, short track record',
        price:'From $19/mo', checked:'Jul 24' },
      { n:'HyperWrite', url:'hyperwriteai.com', verdict:'Agentic drafting that will browse for you mid-document.',
        who:'Writers who need live facts inside the draft.',
        pro:'Browsing inside the writing flow', con:'Agent steps fail quietly and cost tokens',
        price:'Free tier · from $19.99/mo', checked:'Jul 24' },
      { n:'Cohesive', url:'cohesive.so', verdict:'Template-heavy but unusually broad output formats.',
        who:'Small teams producing many content types.',
        pro:'Wide format coverage', con:'Depth is shallow in every one of them',
        price:'Free tier · from $15/mo', checked:'Jul 22' },
      { n:'Wordware', url:'wordware.ai', verdict:'Build your own writing pipeline without writing code.',
        who:'People who want a repeatable pipeline, not a chat box.',
        pro:'Composable and inspectable', con:'You are building a tool, not using one',
        price:'Usage-based', checked:'Jul 22' },
      { n:'Bearly', url:'bearly.ai', verdict:'Read, summarise, then write — anywhere on the desktop.',
        who:'Research-heavy writing across many sources.',
        pro:'Fast capture-to-draft loop', con:'Drafting quality lags the leaders',
        price:'From $15/mo', checked:'Jul 21' },
      { n:'Sudowrite', url:'sudowrite.com', verdict:'Fiction-shaped tooling — the only one here that is.',
        who:'Novelists, not marketers.',
        pro:'Craft tools no general model exposes', con:'Actively unhelpful for business writing',
        price:'From $19/mo', checked:'Jul 21' },
      { n:'Wordtune', url:'wordtune.com', verdict:'Rewriting that keeps meaning while changing register.',
        who:'Non-native writers polishing tone.',
        pro:'Best-in-class single-sentence rewrites', con:'Little help above sentence level',
        price:'Free tier · from $13.99/mo', checked:'Jul 21' },
    ],
  },

  oss: {
    incumbents: [
      { n:'Open WebUI', url:'github.com/open-webui/open-webui', verdict:'A self-hosted chat front-end you can point at any model.',
        who:'Self-hosters who want ChatGPT ergonomics on their own models.',
        pro:'Model-agnostic, mature UI', con:'A shell — writing quality is whatever model you attach',
        price:'Free · self-host', checked:'Jul 22' },
      { n:'Novel', url:'github.com/steven-tey/novel', verdict:'The de-facto open AI editor — an editor, not a writer.',
        who:'Teams embedding AI writing into their own product.',
        pro:'Clean Notion-style editing surface', con:'You supply the model, the keys and the hosting',
        price:'Free · MIT · self-host', checked:'Jul 23' },
      { n:'LibreChat', url:'github.com/danny-avila/LibreChat', verdict:'Multi-model chat you can host for a whole team.',
        who:'Teams needing shared access to several models.',
        pro:'Solid multi-user hosting and auth', con:'Not writing-specific',
        price:'Free · MIT', checked:'Jul 17' },
      { n:'AnythingLLM', url:'github.com/Mintplex-Labs/anything-llm', verdict:'Document-grounded drafting on your own files.',
        who:'Writing that must cite an internal corpus.',
        pro:'Straightforward RAG over local documents', con:'Heavier to run than the job usually needs',
        price:'Free · MIT · self-host', checked:'Jul 18' },
      { n:'Jan', url:'github.com/menloresearch/jan', verdict:'Fully offline assistant with a real desktop app.',
        who:'Anyone who cannot send text to a cloud service.',
        pro:'Genuinely offline, easy install', con:'Local models still trail hosted ones for prose',
        price:'Free · AGPL', checked:'Jul 20' },
      { n:'Reor', url:'github.com/reorproject/reor', verdict:'Local-first notes with retrieval built in.',
        who:'Researchers accumulating notes they later write from.',
        pro:'Retrieval over your own corpus, offline', con:'Writing is adjacent, not the focus',
        price:'Free · AGPL', checked:'Jul 18' },
      { n:'Khoj', url:'github.com/khoj-ai/khoj', verdict:'Your notes become something you can ask questions of.',
        who:'People whose drafts start from years of notes.',
        pro:'Strong personal-corpus search', con:'Setup is a project in itself',
        price:'Free · AGPL', checked:'Jul 20' },
      { n:'Onyx', url:'github.com/onyx-dot-app/onyx', verdict:'Team knowledge search that can draft from what it finds.',
        who:'Companies writing from internal knowledge.',
        pro:'Many first-party connectors', con:'Overkill for an individual writer',
        price:'Free · MIT', checked:'Jul 19' },
    ],
    challengers: [
      { n:'harper', url:'github.com/Automattic/harper', verdict:'Offline grammar checking, fast and private.',
        who:'Anyone who cannot send text to a cloud service.',
        pro:'Runs locally, no data leaves the machine', con:'Checks only — no rewriting, no generation',
        price:'Free · Apache-2.0', checked:'Jul 25' },
      { n:'Perplexica', url:'github.com/ItzCrazyKns/Perplexica', verdict:'Open answer engine you can draft from.',
        who:'Writers who start every piece with research.',
        pro:'Cited answers, self-hosted', con:'Answer quality depends entirely on your search backend',
        price:'Free · MIT', checked:'Jul 24' },
      { n:'Karakeep', url:'github.com/karakeep-app/karakeep', verdict:'Capture everything now, write from it later.',
        who:'People who hoard links and then write essays.',
        pro:'Fast capture with automatic tagging', con:'Not a writing tool by itself',
        price:'Free · AGPL', checked:'Jul 24' },
      { n:'Morphic', url:'github.com/miurla/morphic', verdict:'Generative answer UI you can fork into a writing tool.',
        who:'Builders, more than writers.',
        pro:'Clean, hackable codebase', con:'A starting point, not a product',
        price:'Free · Apache-2.0', checked:'Jul 22' },
      { n:'Papra', url:'github.com/papra-hq/papra', verdict:'Document store with extraction, useful upstream of writing.',
        who:'Writing that has to cite filed documents.',
        pro:'Sane document handling', con:'Young, small maintainer base',
        price:'Free · AGPL', checked:'Jul 21' },
      { n:'SurfSense', url:'github.com/MODSetter/SurfSense', verdict:'Research assistant over your own browsing and files.',
        who:'Researchers writing from what they already read.',
        pro:'Broad source ingestion', con:'Rough edges everywhere; early software',
        price:'Free · Apache-2.0', checked:'Jul 21' },
    ],
  },

  skill: {
    incumbents: [
      { n:'Anthropic Document Skills', url:'github.com/anthropics/skills', verdict:'Produces genuinely editable .docx and .pptx, not text you reformat.',
        who:'Anyone whose deliverable is a file, not a chat reply.',
        pro:'Real file output, official and maintained', con:'No GUI — you install and wire it yourself',
        price:'Free · official', checked:'Jul 23' },
      { n:'awesome-claude-skills', url:'github.com/ComposioHQ/awesome-claude-skills', verdict:'The index most people find skills through.',
        who:'Anyone starting to assemble a skill set.',
        pro:'Broadest curated coverage', con:'An index, not a tool — quality inside varies',
        price:'Free · OSS', checked:'Jul 23' },
      { n:'content-research-writer', url:'github.com/ComposioHQ', verdict:'Research → outline → draft in one skill, with citations.',
        who:'Long posts that need sourcing along the way.',
        pro:'Covers the whole research-to-draft chain', con:'Adoption inherited from its parent collection',
        price:'Free · OSS', checked:'Jul 18' },
      { n:'mattpocock/skills', url:'github.com/mattpocock/skills', verdict:'Opinionated skills from a maintainer people already trust.',
        who:'Developers who write as part of the job.',
        pro:'Consistent, well-reviewed conventions', con:'Written for its author first',
        price:'Free · OSS', checked:'Jul 22' },
      { n:'seo-content-writer', url:'github.com/seo-geo-claude-skills', verdict:'Keyword-shaped drafting. Single-author, thin review history.',
        who:'SEO writers already working inside an agent.',
        pro:'Opinionated SEO structure out of the box', con:'One maintainer, little independent review',
        price:'Free · OSS', checked:'Jul 18' },
      { n:'writing-style-editor', url:'github.com/example/style-editor', verdict:'Enforces a style guide over an existing draft.',
        who:'Teams with a written house style.',
        pro:'Deterministic, rule-driven edits', con:'Needs a style guide you have actually written',
        price:'Free · OSS', checked:'Jul 15' },
      { n:'docs-to-blog', url:'github.com/example/docs-to-blog', verdict:'Turns existing docs into posts. Narrow but reliable.',
        who:'Devrel teams recycling documentation.',
        pro:'Very predictable output', con:'Only useful if the docs already exist',
        price:'Free · OSS', checked:'Jul 14' },
    ],
    challengers: [
      { n:'blog-post-agent', url:'github.com/example/blog-agent', verdict:'End-to-end post drafting; quality tracks the model behind it.',
        who:'Solo bloggers wanting a repeatable pipeline.',
        pro:'One command from brief to draft', con:'Little control over intermediate steps',
        price:'Free · OSS', checked:'Jul 15' },
      { n:'academic-writer-skill', url:'github.com/example/academic-writer', verdict:'Citation-disciplined drafting for papers.',
        who:'Researchers writing to a format.',
        pro:'Handles reference formats properly', con:'Rigid outside academic structure',
        price:'Free · OSS', checked:'Jul 24' },
      { n:'newsletter-skill', url:'github.com/example/newsletter', verdict:'Turns a week of links into a sendable issue.',
        who:'Newsletter writers on a weekly cadence.',
        pro:'Genuinely saves the assembly hour', con:'Voice needs heavy editing afterwards',
        price:'Free · OSS', checked:'Jul 24' },
      { n:'style-transfer-skill', url:'github.com/example/style-transfer', verdict:'Rewrites a draft into a target voice from samples.',
        who:'Ghostwriters matching someone else’s voice.',
        pro:'Sample-driven, no prompt engineering', con:'Needs a lot of clean samples to work',
        price:'Free · OSS', checked:'Jul 22' },
      { n:'skill-seeker', url:'github.com/example/skill-seeker', verdict:'Finds and installs skills for the job you describe.',
        who:'People drowning in skill repositories.',
        pro:'Removes the discovery problem', con:'Recommends without evaluating quality',
        price:'Free · OSS', checked:'Jul 21' },
    ],
  },

  /* how many found-but-not-yet-judged items sit in the queue; the queue itself
   * is editorial workflow, not something a reader can act on */
  inReview: 4,
  archive: [
    { n:'Office-PowerPoint-MCP-Server', url:'#', status:'rejected', why:'MCP server — out of scope' },
    { n:'SlideSpeak MCP', url:'#', status:'rejected', why:'MCP server — out of scope' },
    { n:'Peppertype', url:'#', status:'delisted', why:'Product discontinued' },
    { n:'Smart Copy (Unbounce)', url:'#', status:'delisted', why:'Shut down by the vendor' },
    { n:'Wordtune', url:'#', status:'watching', why:'Pulled after the 2026 pricing change — re-checking' },
  ],
};
