import { useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'
import { ArrowRight, FolderGit2, LoaderCircle, Search, Star } from 'lucide-react'

import {
  ProductDetailPanel,
  type DetailPanelItem,
} from '~/components/product-detail-panel'
import type { Category } from '~/lib/catalog'
import { categoryIcon } from '~/lib/category-icons'
import { openCatalogSearch } from '~/lib/catalog-search'
import {
  getTrendingRepositoryDetail,
  type TrendingRepositoriesResult,
} from '~/lib/github-trending'
import type { TrendingRepository } from '~/lib/github-trending'

const s = stylex.create({
  page: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
  },
  inner: {
    width: '100%',
    maxWidth: 1120,
    marginInline: 'auto',
    paddingInline: {
      default: 'var(--spacing-6)',
      '@media (max-width: 640px)': 'var(--spacing-4)',
    },
    paddingBlock: {
      default: 'var(--spacing-7)',
      '@media (max-width: 640px)': 'var(--spacing-5)',
    },
  },
  // --- hero -------------------------------------------------------------
  hero: {
    maxWidth: 720,
    marginBottom: 'var(--spacing-7)',
  },
  kicker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-accent)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 'var(--spacing-3)',
  },
  h1: {
    margin: 0,
    color: 'var(--color-text-primary)',
    fontSize: {
      default: 38,
      '@media (max-width: 640px)': 28,
    },
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  tagline: {
    marginTop: 'var(--spacing-4)',
    marginBottom: 0,
    color: 'var(--color-text-secondary)',
    fontSize: {
      default: 16,
      '@media (max-width: 640px)': 15,
    },
    lineHeight: 1.55,
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    marginTop: 'var(--spacing-5)',
  },
  searchCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    height: 44,
    paddingInline: 'var(--spacing-5)',
    borderWidth: 0,
    borderRadius: 'var(--radius-full)',
    backgroundColor: {
      default: 'var(--color-text-accent)',
      ':hover': '#1d4ed8',
    },
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  trust: {
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 500,
  },
  // --- section scaffolding ---------------------------------------------
  section: {
    marginTop: 'var(--spacing-7)',
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-4)',
    marginBottom: 'var(--spacing-2)',
  },
  sectionTitle: {
    margin: 0,
    color: 'var(--color-text-primary)',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  sectionSub: {
    margin: 0,
    marginBottom: 'var(--spacing-4)',
    color: 'var(--color-text-secondary)',
    fontSize: 13.5,
    lineHeight: 1.5,
    maxWidth: 640,
  },
  count: {
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // --- use-case grid ----------------------------------------------------
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(auto-fill, minmax(210px, 1fr))',
      '@media (max-width: 520px)': 'repeat(auto-fill, minmax(150px, 1fr))',
    },
    gap: 'var(--spacing-3)',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-4)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--color-border)',
      ':hover': 'var(--color-accent)',
    },
    borderRadius: 'var(--radius-container)',
    backgroundColor: {
      default: 'var(--color-background-surface)',
      ':hover': 'var(--color-accent-muted)',
    },
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    transitionProperty: 'transform, border-color, background-color',
    transitionDuration: '0.14s',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-2px)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
      transform: 'none',
    },
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-text-accent)',
  },
  cardBody: { minWidth: 0, flex: 1 },
  cardName: {
    fontSize: 14,
    fontWeight: 650,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  cardArrow: {
    color: 'var(--color-text-disabled)',
    flexShrink: 0,
    display: { default: 'flex', '@media (max-width: 520px)': 'none' },
  },
  // --- trending table ---------------------------------------------------
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  tableHead: {
    display: {
      default: 'grid',
      '@media (max-width: 760px)': 'none',
    },
    gridTemplateColumns: 'minmax(260px, 1fr) 100px 116px 168px',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-3) var(--spacing-5)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0,
  },
  row: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(260px, 1fr) 100px 116px 168px',
      '@media (max-width: 760px)': 'minmax(0, 1fr) auto',
    },
    alignItems: 'center',
    gap: {
      default: 'var(--spacing-4)',
      '@media (max-width: 760px)': 'var(--spacing-3)',
    },
    minHeight: 76,
    padding: {
      default: 'var(--spacing-4) var(--spacing-5)',
      '@media (max-width: 640px)': 'var(--spacing-4)',
    },
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: {
      default: 'var(--color-background-surface)',
      ':hover': 'var(--color-overlay-hover)',
    },
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowActive: {
    backgroundColor: 'var(--color-accent-muted)',
    boxShadow: 'inset 3px 0 0 var(--color-text-accent)',
  },
  product: {
    minWidth: 0,
  },
  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  name: {
    minWidth: 0,
    overflow: 'hidden',
    color: 'var(--color-text-primary)',
    fontSize: 14,
    fontWeight: 700,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    display: '-webkit-box',
    marginTop: 4,
    overflow: 'hidden',
    color: 'var(--color-text-secondary)',
    fontSize: 12.5,
    lineHeight: 1.4,
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
  },
  metric: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  growth: {
    color: 'var(--color-success)',
  },
  category: {
    display: 'flex',
    justifyContent: 'flex-start',
    minWidth: 0,
  },
  mobileMeta: {
    display: {
      default: 'none',
      '@media (max-width: 760px)': 'flex',
    },
    gridColumn: '1 / -1',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    marginTop: 'calc(var(--spacing-2) * -1)',
  },
  desktopOnly: {
    display: {
      default: 'flex',
      '@media (max-width: 760px)': 'none',
    },
  },
  loader: {
    color: 'var(--color-text-accent)',
    animationName: stylex.keyframes({
      to: { transform: 'rotate(360deg)' },
    }),
    animationDuration: '0.8s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
  error: {
    padding: 'var(--spacing-6)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    textAlign: 'center',
  },
  detailError: {
    marginTop: 'var(--spacing-3)',
    color: 'var(--color-error)',
    fontSize: 12.5,
  },
  // --- footer -----------------------------------------------------------
  footer: {
    marginTop: 'var(--spacing-7)',
    paddingTop: 'var(--spacing-5)',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--color-border)',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
    color: 'var(--color-text-secondary)',
    fontSize: 12.5,
    lineHeight: 1.5,
  },
  footerLink: {
    color: 'var(--color-text-accent)',
    textDecoration: 'none',
  },
})

function toPanelItem(repository: TrendingRepository): DetailPanelItem {
  return {
    id: repository.url,
    rank: repository.rank,
    name: repository.name,
    homepage: repository.url,
    pricing: 'Public GitHub repository',
    bestFor: repository.description,
    confidence: 'low',
    badge: 'provisional',
    sources: [{ name: 'GitHub repository', url: repository.url }],
    kind: 'repo',
    track: 'skill',
    typeLabel: 'Skill / Repo',
  }
}

export function HomeView({
  trending,
  categories,
}: {
  trending: TrendingRepositoriesResult
  categories: Category[]
}) {
  const [selectedItem, setSelectedItem] = useState<DetailPanelItem | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const requestId = useRef(0)
  const siblings = useMemo(
    () => trending.repositories.map(toPanelItem),
    [trending.repositories],
  )

  const openRepository = async (repository: TrendingRepository) => {
    const currentRequest = ++requestId.current
    setLoadingId(repository.url)
    setDetailError(null)

    try {
      const item = await getTrendingRepositoryDetail({ data: repository })
      if (requestId.current === currentRequest) setSelectedItem(item)
    } catch {
      if (requestId.current === currentRequest) {
        setDetailError(`Could not research ${repository.name}. Try again.`)
      }
    } finally {
      if (requestId.current === currentRequest) setLoadingId(null)
    }
  }

  const selectAlternative = (id: string) => {
    const repository = trending.repositories.find((item) => item.url === id)
    if (repository) void openRepository(repository)
  }

  return (
    <div {...stylex.props(s.page)}>
      <div {...stylex.props(s.inner)}>
        <section {...stylex.props(s.hero)}>
          <span {...stylex.props(s.kicker)}>Independent AI tool rankings</span>
          <h1 {...stylex.props(s.h1)}>Find the best AI tool for what you’re actually doing.</h1>
          <p {...stylex.props(s.tagline)}>
            Rankings across {categories.length} real use cases — apps and open-source skills, side by
            side — with the evidence behind every pick. No hype, no affiliate order.
          </p>
          <div {...stylex.props(s.ctaRow)}>
            <button type="button" {...stylex.props(s.searchCta)} onClick={openCatalogSearch}>
              <Search size={16} />
              Search AI tools &amp; use cases
            </button>
            <span {...stylex.props(s.trust)}>
              {categories.length} use cases · apps + open-source skills
            </span>
          </div>
        </section>

        <section {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHead)}>
            <h2 {...stylex.props(s.sectionTitle)}>Browse by use case</h2>
            <span {...stylex.props(s.count)}>{categories.length} categories</span>
          </div>
          <p {...stylex.props(s.sectionSub)}>
            Start from the job you need done — each use case ranks the strongest apps and skills for it.
          </p>
          <div {...stylex.props(s.grid)}>
            {categories.map((category) => {
              const Icon = categoryIcon(category.slug)
              return (
                <Link
                  key={category.slug}
                  to="/c/$slug"
                  params={{ slug: category.slug }}
                  {...stylex.props(s.card)}
                >
                  <span {...stylex.props(s.cardIcon)}>
                    <Icon size={19} />
                  </span>
                  <span {...stylex.props(s.cardBody)}>
                    <span {...stylex.props(s.cardName)}>{category.name}</span>
                  </span>
                  <span {...stylex.props(s.cardArrow)}>
                    <ArrowRight size={16} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHead)}>
            <h2 {...stylex.props(s.sectionTitle)}>Trending on GitHub today</h2>
            {!trending.error && (
              <span {...stylex.props(s.count)}>{trending.repositories.length} repositories</span>
            )}
          </div>
          <p {...stylex.props(s.sectionSub)}>
            A live snapshot of fast-growing open-source AI projects. Tap any repo for an instant
            breakdown.
          </p>

          {trending.error ? (
            <div {...stylex.props(s.table, s.error)}>{trending.error}</div>
          ) : (
            <div {...stylex.props(s.table)}>
              <div {...stylex.props(s.tableHead)} aria-hidden="true">
                <span>PRODUCT</span>
                <span>TOTAL STARS</span>
                <span>TODAY</span>
                <span>CATEGORY</span>
              </div>

              {trending.repositories.map((repository, index) => {
                const isLoading = loadingId === repository.url
                const isSelected = selectedItem?.id === repository.url
                return (
                  <button
                    key={repository.url}
                    type="button"
                    aria-busy={isLoading}
                    {...stylex.props(
                      s.row,
                      index === trending.repositories.length - 1 && s.rowLast,
                      (isLoading || isSelected) && s.rowActive,
                    )}
                    onClick={() => void openRepository(repository)}
                  >
                    <span {...stylex.props(s.product)}>
                      <span {...stylex.props(s.nameLine)}>
                        {isLoading ? (
                          <LoaderCircle size={16} {...stylex.props(s.loader)} />
                        ) : (
                          <FolderGit2 size={16} />
                        )}
                        <span {...stylex.props(s.name)}>{repository.name}</span>
                      </span>
                      <span {...stylex.props(s.description)}>{repository.description}</span>
                    </span>

                    <span {...stylex.props(s.metric, s.desktopOnly)}>
                      <Star size={13} />
                      {repository.stars}
                    </span>
                    <span {...stylex.props(s.metric, s.growth, s.desktopOnly)}>
                      +{repository.starsToday}
                    </span>
                    <span {...stylex.props(s.category, s.desktopOnly)}>
                      <Badge variant="blue" label={repository.category} />
                    </span>

                    <span {...stylex.props(s.mobileMeta)}>
                      <span {...stylex.props(s.metric)}>
                        <Star size={13} />
                        {repository.stars}
                      </span>
                      <span {...stylex.props(s.metric, s.growth)}>
                        +{repository.starsToday} today
                      </span>
                      <Badge variant="blue" label={repository.category} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {detailError && <div {...stylex.props(s.detailError)}>{detailError}</div>}
        </section>

        <footer {...stylex.props(s.footer)}>
          <span>
            Rankings are built from a consensus of independent public sources, graded by confidence.
            Hands-on testing upgrades a pick from 📋 provisional to 🧪 tested.
          </span>
          <a
            {...stylex.props(s.footerLink)}
            href="https://github.com/trending"
            target="_blank"
            rel="noreferrer"
          >
            Trending data via GitHub ↗
          </a>
        </footer>
      </div>

      {selectedItem && (
        <ProductDetailPanel
          item={selectedItem}
          siblings={siblings}
          onClose={() => setSelectedItem(null)}
          onSelect={selectAlternative}
        />
      )}
    </div>
  )
}
