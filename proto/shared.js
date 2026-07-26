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
  { key: 'saas', label: 'App / SaaS' },
  { key: 'oss', label: 'Open Source' },
  { key: 'skill', label: 'Skills / Agents' },
];

/* ---------------------------------------------------------------------------
 * Shell. Every measurement here is from DESIGN.md; the section is cited inline.
 * ------------------------------------------------------------------------ */

/* §3.3 — a logo is never a bare image, it is a contained mark on a tinted
 * square. We have no logo files in the mockup, so the mark is the initial. */
const tile = (name, size = 24) => {
  const s = size === 24
    ? 'size-6 rounded-sm text-[11px]'
    : 'size-[50px] rounded-[13px] text-[20px]';
  return `<span class="flex ${s} shrink-0 items-center justify-center bg-secondary font-bold text-secondary-foreground">${
    name.replace(/^.*\//, '')[0].toUpperCase()
  }</span>`;
};

/* §2.5 — sits above the sticky header, so it scrolls away. */
const BANNER = `
  <div class="relative shrink-0 border-b border-accent-foreground/10 bg-accent">
    <div class="mx-auto flex h-[46px] max-w-container items-center justify-center gap-3 px-4 pr-14 sm:px-6 sm:pr-24 lg:px-8">
      <span class="hidden shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold tracking-micro text-brand-foreground sm:block">UPDATED</span>
      <span class="truncate text-[13.5px] text-accent-foreground">Content Writing re-checked — 3 entries dropped, 2 added</span>
      <a href="category.html" class="hidden shrink-0 text-[13.5px] font-semibold text-accent-foreground sm:block">See what changed &rarr;</a>
    </div>
    <button aria-label="Dismiss"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-accent-foreground/60 transition-colors hover:bg-accent-foreground/10 hover:text-accent-foreground sm:right-5">
      <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>`;

/* §2.4 — 64px inner bar, white on the off-white canvas, 1px bottom border.
 * §3.1 — ghost nav items, pill search, brand CTA. */
const HEADER = `
  <div class="sticky top-0 z-40 w-full shrink-0">
    <header class="flex justify-center border-b border-border bg-card">
      <div class="mx-auto flex h-16 w-full max-w-container items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

        <div class="flex min-w-0 items-center gap-3 lg:gap-6">
          <button id="mobileNav" aria-label="Open tasks"
                  class="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-muted lg:hidden">
            <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <a href="home.html" class="flex shrink-0 items-center gap-2">
            <span class="flex size-8 items-center justify-center rounded-md bg-brand text-[17px] font-bold text-brand-foreground">W</span>
            <span class="hidden text-[19px] font-bold tracking-tight sm:block">WhichToUse</span>
          </a>
          <nav class="hidden items-center gap-1 lg:flex">
            <button id="sidebarToggle" aria-controls="use-case-sidebar"
                    class="flex h-9 items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-foreground/60 transition-colors hover:bg-muted">
              <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
              Tasks
            </button>
            <a href="#" class="flex h-9 items-center rounded-lg px-2 py-1.5 font-medium text-foreground/60 transition-colors hover:bg-muted">Method</a>
          </nav>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <label class="hidden h-9 w-[260px] cursor-text items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-sm font-medium text-foreground/70 transition-colors hover:border-foreground/20 md:flex">
            <svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input placeholder="Search tools and tasks" class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
            <kbd class="shrink-0 font-sans text-[11px] font-semibold text-muted-foreground">&#8984;K</kbd>
          </label>
          <button aria-label="Search"
                  class="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-foreground/70 transition-colors hover:border-foreground/20 md:hidden">
            <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <a href="#" class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand px-[18px] text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/85">
            Suggest a tool
          </a>
        </div>

      </div>
    </header>
  </div>`;

function shell({ active = '', home = false } = {}) {
  /* §2.4/§1.3 — sidebar tokens: #fbfbfa surface, #3f3f3c text, brand for the
   * one active row. Item geometry follows the nav item in §3.1 (36px, r12). */
  const item = (href, label, on) => `
    <a href="${href}" class="flex h-9 items-center rounded-lg px-3 text-[13.5px] transition-colors ${
      on ? 'bg-brand font-semibold text-brand-foreground'
         : 'text-sidebar-foreground hover:bg-muted'
    }">${label}</a>`;

  /* Below lg the sidebar becomes an overlay panel. Kept in one place rather
   * than threaded through max-lg: variants on every class list. */
  document.head.insertAdjacentHTML('beforeend', `<style>
    @media (max-width: 1023px) {
      #use-case-sidebar.is-open {
        display: block; position: fixed; inset: 0 auto 0 0; z-index: 50;
        width: 280px; box-shadow: 0 1px 3px 0 rgba(0,0,0,.10), 0 8px 10px -1px rgba(0,0,0,.10);
      }
      #sidebar-scrim.is-open { display: block; }
    }
  </style>`);

  document.body.insertAdjacentHTML('afterbegin', `
    ${BANNER}
    ${HEADER}
    <div id="sidebar-scrim" class="hidden fixed inset-0 z-40 bg-foreground/20"></div>
    <div class="flex min-h-0 flex-1">
      <aside id="use-case-sidebar"
             class="hidden w-[240px] shrink-0 overflow-y-auto border-r border-border bg-sidebar py-4 lg:block">
        <nav class="flex flex-col gap-0.5 px-3">${item('home.html', 'Home', home)}</nav>
        <div class="px-4 pb-2 pt-5 text-[11px] font-bold uppercase tracking-label text-muted-foreground">Tasks</div>
        <nav class="flex flex-col gap-0.5 px-3 pb-4">
          ${TASKS.map(([slug, name]) => item('category.html', name, slug === active)).join('')}
        </nav>
      </aside>
      <main id="main" class="min-w-0 flex-1 overflow-y-auto bg-background"></main>
    </div>
  `);

  const aside = document.getElementById('use-case-sidebar');
  const scrim = document.getElementById('sidebar-scrim');

  /* Desktop: the sidebar is a column that collapses out of the layout.
   * Mobile: the same element is an overlay panel. One control each. */
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    aside.classList.toggle('lg:hidden');
  });
  const closeMobile = () => {
    aside.classList.remove('is-open');
    scrim.classList.remove('is-open');
  };
  document.getElementById('mobileNav')?.addEventListener('click', () => {
    aside.classList.add('is-open');
    scrim.classList.add('is-open');
  });
  scrim.addEventListener('click', closeMobile);

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
      { owner:'open-webui', n:'open-webui', desc:'A self-hosted chat front-end for any model backend.',
        edge:'Model-agnostic with a mature interface', con:'A shell — quality is whatever model you attach' },
      { owner:'steven-tey', n:'novel', desc:'An open Notion-style editor with AI completions.',
        edge:'The cleanest embeddable editing surface', con:'You supply the model, the keys and the hosting' },
      { owner:'danny-avila', n:'LibreChat', desc:'Multi-model chat you can host for a team.',
        edge:'Serious multi-user hosting and auth', con:'Not writing-specific in any way' },
      { owner:'Mintplex-Labs', n:'anything-llm', desc:'A local RAG workspace over your own documents.',
        edge:'Straightforward grounding in your files', con:'Heavier to run than this job needs' },
      { owner:'menloresearch', n:'jan', desc:'A fully offline desktop assistant.',
        edge:'Genuinely offline, easy to install', con:'Local models still trail hosted ones for prose' },
      { owner:'reorproject', n:'reor', desc:'A local-first note app with retrieval built in.',
        edge:'Search across your own corpus, offline', con:'Writing is adjacent, not the focus' },
      { owner:'khoj-ai', n:'khoj', desc:'A personal assistant over your notes and documents.',
        edge:'Strongest personal-corpus search here', con:'Setup is a project in itself' },
      { owner:'onyx-dot-app', n:'onyx', desc:'Team knowledge search that can draft from what it finds.',
        edge:'Many first-party connectors', con:'Overkill for an individual writer' },
    ],
    emerging: [
      { owner:'Automattic', n:'harper', desc:'An offline grammar checker written in Rust.',
        edge:'Runs locally — no text leaves the machine', con:'Checks only — no rewriting, no generation' },
      { owner:'ItzCrazyKns', n:'Perplexica', desc:'An open answer engine you can self-host.',
        edge:'Cited answers without a third party', con:'Only as good as the search backend you give it' },
      { owner:'karakeep-app', n:'karakeep', desc:'A capture tool that files links and pages for later.',
        edge:'Fast capture with automatic tagging', con:'Not a writing tool by itself' },
      { owner:'miurla', n:'morphic', desc:'A generative answer interface you can fork.',
        edge:'Clean, genuinely hackable codebase', con:'A starting point, not a product' },
      { owner:'papra-hq', n:'papra', desc:'A document store with extraction built in.',
        edge:'Sane handling of filed documents', con:'Young, with a small maintainer base' },
      { owner:'MODSetter', n:'SurfSense', desc:'A research assistant over your browsing and files.',
        edge:'Ingests an unusually wide range of sources', con:'Rough edges everywhere; early software' },
    ],
  },

  skill: {
    leading: [
      { owner:'anthropics', n:'skills', desc:'Official skills that produce real office documents.',
        edge:'Outputs editable .docx and .pptx, not text', con:'No GUI — you install and wire it yourself' },
      { owner:'ComposioHQ', n:'awesome-claude-skills', desc:'A curated index of published agent skills.',
        edge:'Broadest coverage of what exists', con:'An index, not a tool — quality inside varies' },
      { owner:'ComposioHQ', n:'content-research-writer', desc:'A skill covering research through to a cited draft.',
        edge:'Handles the whole chain in one pass', con:'Adoption inherited from its parent collection' },
      { owner:'mattpocock', n:'skills', desc:'Opinionated skills from a well-known maintainer.',
        edge:'Consistent, well-reviewed conventions', con:'Written for its author’s workflow first' },
      { owner:'dagrici', n:'seo-content-writer', desc:'A drafting skill shaped around target keywords.',
        edge:'SEO structure out of the box', con:'One maintainer, little independent review' },
      { owner:'obra', n:'writing-style-editor', desc:'A skill that enforces a style guide over a draft.',
        edge:'Deterministic, rule-driven edits', con:'Useless without a style guide you have written' },
      { owner:'devrel-tools', n:'docs-to-blog', desc:'Turns existing documentation into posts.',
        edge:'Very predictable output', con:'Only works if the docs already exist' },
    ],
    emerging: [
      { owner:'sethblack', n:'blog-post-agent', desc:'End-to-end post drafting from a brief.',
        edge:'One command from brief to draft', con:'Almost no control over intermediate steps' },
      { owner:'scholarly', n:'academic-writer-skill', desc:'Citation-disciplined drafting for papers.',
        edge:'Handles reference formats properly', con:'Rigid outside academic structure' },
      { owner:'buttondown', n:'newsletter-skill', desc:'Assembles a week of links into an issue.',
        edge:'Genuinely saves the assembly hour', con:'Voice needs heavy editing afterwards' },
      { owner:'ghostwriter', n:'style-transfer-skill', desc:'Rewrites a draft into a target voice from samples.',
        edge:'Sample-driven, no prompt engineering', con:'Needs a lot of clean samples to work' },
      { owner:'skillhost', n:'skill-seeker', desc:'Finds and installs skills for a described job.',
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
