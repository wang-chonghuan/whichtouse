/* Shell for the v2 mockup: top bar + use-case sidebar. */

const CATEGORIES = [
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

function shell({ active = '', home = false } = {}) {
  const items = CATEGORIES.map(
    ([slug, name]) => `<a href="category.html" class="rounded-lg px-4 py-[7px] text-[13.5px] transition ${
      slug === active
        ? 'bg-blue-50 font-semibold text-blue-700'
        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
    }">${name}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="z-30 flex h-[60px] flex-shrink-0 items-center gap-6 border-b border-neutral-200 bg-white/90 px-5 backdrop-blur">
      <a href="home.html" class="text-[21px] font-extrabold tracking-tight">Which<span class="text-blue-600">ToUse</span></a>
      <button class="ml-auto flex h-[38px] w-full max-w-[440px] items-center gap-2.5 rounded-full border border-neutral-200 px-4 text-left text-[13.5px] text-neutral-400 transition hover:border-neutral-300 hover:bg-neutral-50">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        Search AI tools and use cases
        <kbd class="ml-auto rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">⌘K</kbd>
      </button>
    </header>
    <div class="flex min-h-0 flex-1">
      <aside class="hidden w-[236px] flex-shrink-0 overflow-y-auto border-r border-neutral-200 py-4 lg:block">
        <nav class="flex flex-col gap-px px-2">
          <a href="home.html" class="rounded-lg px-4 py-[7px] text-[13.5px] transition ${
            home ? 'bg-blue-50 font-semibold text-blue-700' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
          }">Home</a>
          <div class="my-2 h-px bg-neutral-200"></div>
          ${items}
        </nav>
      </aside>
      <main id="main" class="min-w-0 flex-1 overflow-y-auto"></main>
    </div>
  `);
  return document.getElementById('main');
}

const CONF = {
  High: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-rose-50 text-rose-700',
};
const MONO = ['#3b6fb0', '#8e5bb5', '#0d7d78', '#c0662f', '#2f9e6b', '#b8860b'];
const mono = (name, i) => MONO[(name.charCodeAt(0) + i) % MONO.length];
