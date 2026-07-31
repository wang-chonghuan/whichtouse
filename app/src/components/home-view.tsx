// Home — implements demo/home.html.
//
// Hero, then three stacked panels: the by-the-job columns, live GitHub
// trending, and the claims. The demo's four use-case columns are filled from
// the real catalog rather than the demo's sample data.

import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'

import { Mockup, MonoTile, Panel, Pill } from '~/components/ui/primitives'
import type { TrendingRepositoriesResult } from '~/lib/github-trending'
import type { Category, CategoryView } from '~/lib/catalog'

const CLAIMS: Array<[string, string]> = [
  ['Start from the job', 'Pick what you need done, not a tool name off an A-to-Z list.'],
  ['Three forms side by side', 'Hosted product, open-source repo and agent skill, ranked separately.'],
  ['Five, not five hundred', 'Each standing shows five by default, ten at most.'],
  ['Drawbacks up front', 'Every entry names the single biggest reason not to pick it.'],
  ['Emerging, tracked', 'A second standing for what is climbing but still unproven.'],
]

const s = stylex.create({
  hero: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line)',
    backgroundColor: 'var(--wt-surface)',
    paddingInline: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  heroInner: { maxWidth: 768, marginInline: 'auto', textAlign: 'center' },
  kicker: {
    marginBottom: 14,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--wt-line)',
    backgroundColor: 'var(--wt-fill)',
    paddingBlock: 4,
    paddingLeft: 6,
    paddingRight: 12,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--wt-ink)',
  },
  h1: {
    margin: 0,
    fontSize: { default: 42, '@media (max-width: 900px)': 34, '@media (max-width: 640px)': 28 },
    lineHeight: 1.08,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: 'var(--wt-ink)',
    textWrap: 'balance',
  },
  // §3.7 — the one non-orthogonal element on the site
  mark: {
    display: 'inline-block',
    transform: 'rotate(-2deg)',
    borderRadius: 9,
    backgroundColor: 'var(--wt-brand)',
    color: 'var(--wt-on-brand)',
    paddingInline: 8,
  },
  sub: {
    marginBlock: 0,
    marginTop: 12,
    marginInline: 'auto',
    maxWidth: 576,
    fontSize: 15.5,
    lineHeight: 1.5,
    color: 'var(--wt-ink-muted)',
  },
  stats: {
    marginTop: 18,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'center',
    columnGap: 24,
    rowGap: 8,
  },
  statNum: { fontSize: 15, fontWeight: 700, color: 'var(--wt-ink)' },
  statLabel: { fontSize: 13.5, fontWeight: 400, color: 'var(--wt-ink-muted)' },

  page: {
    maxWidth: 'var(--wt-container)',
    marginInline: 'auto',
    marginTop: 28,
    marginBottom: 64,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    paddingInline: { default: 16, '@media (min-width: 640px)': 24, '@media (min-width: 1024px)': 32 },
  },

  panelHead: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  h2: { margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--wt-ink)' },
  lede: { marginBlock: 0, marginTop: 4, fontSize: 14.5, color: 'var(--wt-ink-muted)' },
  quietLink: {
    fontSize: 12.5,
    fontWeight: 600,
    color: { default: 'var(--wt-ink-muted)', ':hover': 'var(--wt-ink)' },
    textDecoration: 'none',
  },

  colGrid: {
    marginTop: 24,
    display: 'grid',
    gap: 36,
    gridTemplateColumns: {
      default: 'repeat(4, minmax(0, 1fr))',
      '@media (max-width: 1180px)': 'repeat(2, minmax(0, 1fr))',
      '@media (max-width: 640px)': '1fr',
    },
  },
  col: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  colHead: {
    paddingBottom: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--wt-ink)',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-ink)',
    margin: 0,
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 10,
    paddingLeft: { default: 2, ':hover': 10 },
    paddingRight: 2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line-soft)',
    fontSize: 14,
    color: 'var(--wt-ink)',
    textDecoration: 'none',
    transitionProperty: 'padding',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  rank: {
    width: 12,
    flexShrink: 0,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--wt-ink-muted)',
  },
  grow: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chev: { flexShrink: 0, color: 'var(--wt-ink-muted)' },
  seeMore: {
    marginTop: 'auto',
    paddingTop: 14,
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: 600,
    color: { default: 'var(--wt-ink-muted)', ':hover': 'var(--wt-ink)' },
    textDecoration: 'none',
  },

  // §3.5 wide row
  wideRow: {
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: {
      default: '56px 1fr 72px 168px',
      '@media (max-width: 1024px)': '56px 1fr 72px',
      '@media (max-width: 640px)': '36px 1fr 72px',
    },
    gap: { default: 20, '@media (max-width: 640px)': 16 },
    paddingBlock: 16,
    paddingLeft: { default: 4, ':hover': 16 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'rgba(26,26,26,0.1)',
    color: 'var(--wt-ink)',
    textDecoration: 'none',
    transitionProperty: 'padding',
    transitionDuration: '150ms',
  },
  wideIdent: { display: 'flex', alignItems: 'center', gap: 10 },
  wideName: { display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  wideDesc: { display: 'block', marginTop: 2, fontSize: 13.5, color: 'var(--wt-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  wideNums: { textAlign: 'end' },
  catCell: {
    display: { default: 'flex', '@media (max-width: 1024px)': 'none' },
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  wideStars: { display: 'block', fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  wideToday: { display: 'block', marginTop: 2, fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--wt-edge)' },

  claimGrid: {
    marginTop: 28,
    display: 'grid',
    columnGap: 32,
    rowGap: 24,
    gridTemplateColumns: {
      default: 'repeat(5, minmax(0, 1fr))',
      '@media (max-width: 1180px)': 'repeat(2, minmax(0, 1fr))',
      '@media (max-width: 640px)': '1fr',
    },
  },
  claimNum: { fontSize: 24, fontWeight: 700, lineHeight: 1, color: 'rgba(26,26,26,0.25)', fontVariantNumeric: 'tabular-nums' },
  claimTitle: { marginTop: 8, fontSize: 15, fontWeight: 700 },
  claimBody: { marginBlock: 0, marginTop: 4, fontSize: 13.5, lineHeight: 1.5, color: 'rgba(26,26,26,0.75)' },
  claimFoot: { marginTop: 32, marginBottom: 0, fontSize: 12.5, fontWeight: 600, color: 'rgba(26,26,26,0.6)' },
  err: { marginBlock: 0, marginTop: 12, fontSize: 13.5, color: 'var(--wt-con)' },
})

const Chevron = () => (
  <svg {...stylex.props(s.chev)} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export function HomeView({
  trending,
  categories,
  featured,
}: {
  trending: TrendingRepositoriesResult
  categories: Category[]
  featured: Array<{ category: Category; items: CategoryView['tracks']['app'] }>
}) {
  return (
    <div>
      <section {...stylex.props(s.hero)}>
        <div {...stylex.props(s.heroInner)}>
          <span {...stylex.props(s.kicker)}>
            <Pill tone="strong">Hands-on</Pill>
            every tool opened, documented, tried
          </span>

          <h1 {...stylex.props(s.h1)}>
            Pick by <span {...stylex.props(s.mark)}>the job</span>, not by the tool.
          </h1>

          <p {...stylex.props(s.sub)}>
            Short lists, three forms compared side by side, and the drawback written where you
            cannot miss it.
          </p>

          <div {...stylex.props(s.stats)}>
            <span {...stylex.props(s.statNum)}>
              {categories.length} <span {...stylex.props(s.statLabel)}>tasks covered</span>
            </span>
            <span {...stylex.props(s.statNum)}>
              3 <span {...stylex.props(s.statLabel)}>forms per task</span>
            </span>
            <span {...stylex.props(s.statNum)}>
              5 <span {...stylex.props(s.statLabel)}>shown by default</span>
            </span>
            <span {...stylex.props(s.statNum)}>
              Daily <span {...stylex.props(s.statLabel)}>re-ranked</span>
            </span>
          </div>
        </div>
      </section>

      <div {...stylex.props(s.page)}>
        <Panel>
          <div {...stylex.props(s.panelHead)}>
            <div>
              <h2 {...stylex.props(s.h2)}>Find your tool by the job</h2>
              <p {...stylex.props(s.lede)}>Top-ranked picks in the tasks people search most</p>
            </div>
            <Link to="/c/$slug" params={{ slug: categories[0]?.slug ?? 'coding' }} {...stylex.props(s.quietLink)}>
              All {categories.length} tasks →
            </Link>
          </div>

          <div {...stylex.props(s.colGrid)}>
            {featured.map(({ category, items }) => (
              <div key={category.slug} {...stylex.props(s.col)}>
                <h3 {...stylex.props(s.colHead)}>{category.name}</h3>
                <div>
                  {items.slice(0, 5).map((it, i) => (
                    <Link
                      key={it.id}
                      to="/c/$slug/$item"
                      params={{ slug: category.slug, item: it.id }}
                      {...stylex.props(s.row)}
                    >
                      <span {...stylex.props(s.rank)}>{i + 1}</span>
                      <MonoTile name={it.name} />
                      <span {...stylex.props(s.grow)}>{it.name}</span>
                      <Chevron />
                    </Link>
                  ))}
                </div>
                <Link to="/c/$slug" params={{ slug: category.slug }} {...stylex.props(s.seeMore)}>
                  See more →
                </Link>
              </div>
            ))}
          </div>
        </Panel>

        <Panel variant="tint">
          <div {...stylex.props(s.panelHead)}>
            <div>
              <h2 {...stylex.props(s.h2)}>Trending today</h2>
              <p {...stylex.props(s.lede)}>
                Fast-growing open-source AI projects, refreshed through the day
              </p>
            </div>
            <span {...stylex.props(s.quietLink)}>{trending.repositories.length} repositories</span>
          </div>

          {trending.error ? <p {...stylex.props(s.err)}>{trending.error}</p> : null}

          <div style={{ marginTop: 20 }}>
            {trending.repositories.map((r) => (
              <Link
                key={r.url}
                to="/t/$owner/$repo"
                params={{ owner: r.name.split('/')[0], repo: r.name.split('/')[1] }}
                {...stylex.props(s.wideRow)}
              >
                <span {...stylex.props(s.wideIdent)}>
                  {/* r.rank is GitHub Trending's own position, scraped from the
                      page. Renumbering by list index would silently substitute
                      our ordering for theirs — the rank IS the datum here. */}
                  <span {...stylex.props(s.rank)}>{r.rank}</span>
                  <MonoTile name={r.name} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span {...stylex.props(s.wideName)}>{r.name}</span>
                  <span {...stylex.props(s.wideDesc)}>{r.description}</span>
                </span>
                <span {...stylex.props(s.wideNums)}>
                  <span {...stylex.props(s.wideStars)}>{r.stars}</span>
                  <span {...stylex.props(s.wideToday)}>+{r.starsToday}</span>
                </span>
                <span {...stylex.props(s.catCell)}>
                  <Pill tone="mid">{r.category}</Pill>
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel variant="brand">
          <h2 {...stylex.props(s.h2)}>What makes this different</h2>
          <p {...stylex.props(s.claimBody)}>
            Five rules we hold to. Each one costs us coverage, which is the point.
          </p>
          <div {...stylex.props(s.claimGrid)}>
            {CLAIMS.map(([title, body], i) => (
              <div key={title}>
                <div {...stylex.props(s.claimNum)}>{i + 1}</div>
                <div {...stylex.props(s.claimTitle)}>{title}</div>
                <p {...stylex.props(s.claimBody)}>{body}</p>
              </div>
            ))}
          </div>
          <p {...stylex.props(s.claimFoot)}>We take no payment for placement.</p>
        </Panel>
      </div>
    </div>
  )
}
