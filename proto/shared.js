/* Shared shell for the prototypes: top bar, sidebar, and the data-source
 * annotation layer. Not shipped — this directory exists to argue about
 * structure before anything is built in app/. */

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

/** Data-source badge. `kind` drives the colour so provenance is scannable:
 *  judgement = ours, hard = computed from a public API, manual = human-verified,
 *  soft = weak evidence we must not dress up as strong. */
function src(kind, label) {
  const styles = {
    judgement: 'bg-blue-50 text-blue-700 ring-blue-200',
    hard: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    manual: 'bg-amber-50 text-amber-700 ring-amber-200',
    soft: 'bg-neutral-100 text-neutral-600 ring-neutral-300',
  };
  return `<span data-src class="hidden ml-2 align-middle rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${styles[kind]}">${label}</span>`;
}

function shell({ active = '', page = '' } = {}) {
  const items = CATEGORIES.map(
    ([slug, name]) => `<a href="category.html" class="flex items-center gap-3 rounded-lg px-4 py-2 text-[13.5px] ${
      slug === active ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-500 hover:bg-neutral-50'
    }">${name}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="sticky top-0 z-30 flex h-[60px] flex-shrink-0 items-center gap-6 border-b border-neutral-200 bg-white px-5">
      <a href="index.html" class="text-xl font-extrabold tracking-tight">Which<span class="text-blue-600">ToUse</span></a>
      <span class="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">PROTO · ${page}</span>
      <button class="ml-auto flex h-[38px] flex-1 max-w-[420px] items-center gap-2 rounded-full border border-neutral-200 px-4 text-left text-[13.5px] text-neutral-400">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        Search AI tools and use cases
      </button>
      <label class="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-medium text-neutral-600">
        <input type="checkbox" id="srcToggle" class="h-3.5 w-3.5 accent-blue-600"> 显示数据来源
      </label>
    </header>
    <div class="flex flex-1 min-h-0">
      <aside class="hidden w-[232px] flex-shrink-0 overflow-y-auto border-r border-neutral-200 py-4 lg:block">
        <nav class="flex flex-col gap-px px-2">
          <a href="home.html" class="flex items-center gap-3 rounded-lg px-4 py-2 text-[13.5px] ${
            page === 'Home' ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-500 hover:bg-neutral-50'
          }">Home</a>
          <div class="my-2 h-px bg-neutral-200"></div>
          ${items}
        </nav>
      </aside>
      <main id="main" class="min-w-0 flex-1 overflow-y-auto"></main>
    </div>
  `);

  const toggle = document.getElementById('srcToggle');
  const apply = () => document.querySelectorAll('[data-src]')
    .forEach((el) => el.classList.toggle('hidden', !toggle.checked));
  toggle.addEventListener('change', () => {
    localStorage.setItem('proto-src', toggle.checked ? '1' : '0');
    apply();
  });
  toggle.checked = localStorage.getItem('proto-src') === '1';
  queueMicrotask(apply);
  return document.getElementById('main');
}

/** Re-apply badges after a page injects markup later. */
function refreshBadges() {
  const t = document.getElementById('srcToggle');
  document.querySelectorAll('[data-src]').forEach((el) => el.classList.toggle('hidden', !t.checked));
}
