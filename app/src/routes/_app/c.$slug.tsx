import { createFileRoute, Link, notFound } from '@tanstack/react-router'

import { getCategoryView, type RankItem } from '~/lib/catalog'

export const Route = createFileRoute('/_app/c/$slug')({
  component: CategoryPage,
  loader: async ({ params }) => {
    const view = await getCategoryView({ data: params.slug })
    if (!view) throw notFound()
    return { view }
  },
})

const TRACKS: Array<['app' | 'skill' | 'repo', string]> = [
  ['app', 'App / SaaS'],
  ['skill', 'Skill'],
  ['repo', 'Open source'],
]

function overallLabel(it: RankItem) {
  const v = it.overall ?? '—'
  return it.formFactor === 'app' ? `▲ ${v}` : `★ ${v}`
}

function ItemLink({ it }: { it: RankItem }) {
  return (
    <a className="wt-item" href={it.homepage || it.url || '#'} target="_blank" rel="noreferrer">
      {it.name}
    </a>
  )
}

function TrackList({ label, items, dim }: { label: string; items: RankItem[]; dim: 'overall' | 'growth' }) {
  return (
    <div className="wt-track">
      <div className="wt-track-h">
        {label} <span className="wt-track-n">{items.length}</span>
      </div>
      <ol className="wt-list">
        {items.map((it) => (
          <li key={`${it.rank}-${it.name}`} className="wt-row">
            <span className="wt-rank">{it.rank}</span>
            <ItemLink it={it} />
            <span className="wt-sig">{dim === 'growth' ? `↑${it.growth ?? '—'}/mo` : overallLabel(it)}</span>
          </li>
        ))}
        {items.length === 0 && <li className="wt-empty">—</li>}
      </ol>
    </div>
  )
}

function CategoryPage() {
  const { view } = Route.useLoaderData()
  return (
    <main className="wt-wrap">
      <header className="wt-chead">
        <Link to="/" className="wt-back">
          ← WhichToUse
        </Link>
        <h1 className="wt-ctitle">{view.category.name}</h1>
      </header>

      <section className="wt-sec">
        <div className="wt-sec-h">🏆 Best 3 · 综合推荐</div>
        <ol className="wt-best3">
          {view.best3.map((it) => (
            <li key={it.rank} className="wt-row wt-best3-row">
              <span className="wt-rank gold">{it.rank}</span>
              <ItemLink it={it} />
              <span className="wt-ff">{it.formFactor}</span>
              <span className="wt-sig">{overallLabel(it)}</span>
            </li>
          ))}
          {view.best3.length === 0 && <li className="wt-empty">—</li>}
        </ol>
      </section>

      <section className="wt-sec">
        <div className="wt-sec-h">整体最高 · Overall</div>
        <div className="wt-cols">
          {TRACKS.map(([k, label]) => (
            <TrackList key={k} label={label} items={view.overall[k]} dim="overall" />
          ))}
        </div>
      </section>

      <section className="wt-sec">
        <div className="wt-sec-h">🔥 近一月增长最快 · Rising</div>
        <div className="wt-cols">
          {TRACKS.map(([k, label]) => (
            <TrackList key={k} label={label} items={view.growth[k]} dim="growth" />
          ))}
        </div>
      </section>

      <p className="wt-note">
        📋 provisional — ranked by public signals (GitHub stars / directory upvotes). Hands-on testing comes later.
      </p>
    </main>
  )
}
