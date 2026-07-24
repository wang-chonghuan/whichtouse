import { useMemo, useRef, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'
import { FolderGit2, LoaderCircle, PanelLeftClose, PanelLeftOpen, Star } from 'lucide-react'

import {
  ProductDetailPanel,
  type DetailPanelItem,
} from '~/components/product-detail-panel'
import {
  getTrendingRepositoryDetail,
  type TrendingRepositoriesResult,
} from '~/lib/github-trending'
import type { TrendingRepository } from '~/lib/github-trending'
import { SIDEBAR_ID } from '~/components/sidebar'
import { useLayoutStore } from '~/lib/layout-store'
import { useIsMobile } from '~/lib/use-is-mobile'

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
  hero: { maxWidth: 720 },
  kicker: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--color-text-accent)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 'var(--spacing-3)',
  },
  heroTitle: {
    margin: 0,
    color: 'var(--color-text-primary)',
    fontSize: { default: 38, '@media (max-width: 640px)': 28 },
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  tagline: {
    marginTop: 'var(--spacing-4)',
    marginBottom: 0,
    color: 'var(--color-text-secondary)',
    fontSize: { default: 16, '@media (max-width: 640px)': 15 },
    lineHeight: 1.55,
  },
  browseCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    marginTop: 'var(--spacing-5)',
    height: 52,
    paddingInline: 'var(--spacing-6)',
    borderRadius: 'var(--radius-full)',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transitionProperty: 'background-color, color, box-shadow, border-color',
    transitionDuration: '0.14s',
  },
  // Closed: the inviting primary action.
  ctaClosed: {
    borderWidth: 0,
    backgroundColor: { default: 'var(--color-text-accent)', ':hover': '#1d4ed8' },
    color: '#fff',
    boxShadow: '0 6px 20px -6px rgba(37,99,235,0.5)',
  },
  // Open: the job is done, so it steps back to a quiet secondary control.
  ctaOpen: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    backgroundColor: {
      default: 'var(--color-background-surface)',
      ':hover': 'var(--color-overlay-hover)',
    },
    color: 'var(--color-text-secondary)',
    boxShadow: 'none',
  },
  trust: {
    marginTop: 'var(--spacing-3)',
    marginBottom: 0,
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 500,
  },
  // --- section scaffolding ---------------------------------------------
  section: {
    marginTop: 'var(--spacing-7)',
  },
  h1: {
    margin: 0,
    marginBottom: 'var(--spacing-2)',
    color: 'var(--color-text-primary)',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.01em',
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
  categoryCount,
}: {
  trending: TrendingRepositoriesResult
  categoryCount: number
}) {
  const [selectedItem, setSelectedItem] = useState<DetailPanelItem | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen)
  const mobileOpen = useLayoutStore((state) => state.mobileOpen)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
  const toggleMobile = useLayoutStore((state) => state.toggleMobile)
  // One button, two surfaces: it drives whichever sidebar this viewport shows.
  const catalogOpen = isMobile ? mobileOpen : sidebarOpen
  const toggleCatalog = isMobile ? toggleMobile : toggleSidebar
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
          <span {...stylex.props(s.kicker)}>Hands-on AI tool reviews</span>
          <h1 {...stylex.props(s.heroTitle)}>
            We actually open the tools before we rank them.
          </h1>
          <p {...stylex.props(s.tagline)}>
            For every pick we visit the product, read the documentation, and try it wherever we can —
            then write down what it’s genuinely good at and where it falls short. No scraped
            listicles. No affiliate order.
          </p>
          <button
            type="button"
            aria-expanded={catalogOpen}
            aria-controls={SIDEBAR_ID}
            {...stylex.props(s.browseCta, catalogOpen ? s.ctaOpen : s.ctaClosed)}
            onClick={toggleCatalog}
          >
            {catalogOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            {catalogOpen ? 'Hide categories' : `Browse all ${categoryCount} use cases`}
          </button>
          <p {...stylex.props(s.trust)}>
            {categoryCount} use cases · apps + open-source skills · every claim traceable to a source
          </p>
        </section>

        <section {...stylex.props(s.section)}>
          <div {...stylex.props(s.sectionHead)}>
            <h2 {...stylex.props(s.h1)}>Trending on GitHub today</h2>
            {!trending.error && (
              <span {...stylex.props(s.count)}>{trending.repositories.length} repositories</span>
            )}
          </div>
          <p {...stylex.props(s.sectionSub)}>
            A live snapshot of fast-growing open-source AI projects. Pick any repo for an instant
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
