import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Check, ExternalLink, Minus, X } from 'lucide-react'

import type { RankItem, Track } from '~/lib/catalog'

export type DetailPanelItem = RankItem & {
  id: string
  track: Track
  typeLabel: 'App / SaaS' | 'Skill / Repo'
}

export function monogramColor(name: string): string {
  const hues = ['#0d7d78', '#3b6fb0', '#8e5bb5', '#c0662f', '#2f9e6b', '#b8860b']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % hues.length
  return hues[h]
}

const s = stylex.create({
  scrim: {
    position: 'fixed',
    top: 60,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20,24,31,0.28)',
    zIndex: 90,
  },
  panel: {
    position: 'fixed',
    top: 60,
    right: 0,
    height: 'calc(100vh - 60px)',
    width: 'min(560px, 100vw)',
    backgroundColor: 'var(--color-background-surface)',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-high)',
    zIndex: 100,
    overflowY: 'auto',
    padding: 'var(--spacing-6)',
  },
  head: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
  },
  mono: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 'var(--radius-container)',
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    flexShrink: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    overflowWrap: 'anywhere',
  },
  close: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginInlineStart: 'auto',
    padding: 0,
    borderWidth: 0,
    borderRadius: 'var(--radius-element)',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--color-overlay-hover)',
    },
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  desc: {
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-text-primary)',
    marginBlock: 'var(--spacing-4)',
  },
  btns: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    marginBottom: 'var(--spacing-5)',
  },
  section: {
    marginTop: 'var(--spacing-5)',
  },
  secLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0,
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-3)',
  },
  why: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  pending: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-element)',
    padding: 'var(--spacing-3)',
    fontSize: 12.5,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  },
  srcRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    marginTop: 'var(--spacing-2)',
  },
  src: {
    fontSize: 12,
    color: 'var(--color-text-accent)',
    textDecoration: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: 'var(--color-border)',
  },
  alts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  alt: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    fontSize: 12.5,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--color-overlay-hover)',
    },
    cursor: 'pointer',
  },
  altMono: {
    width: 18,
    height: 18,
    borderRadius: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  green: {
    color: 'var(--color-success)',
    display: 'flex',
    flexShrink: 0,
    marginTop: 2,
  },
  basis: {
    fontSize: 13.5,
    lineHeight: 1.5,
    color: 'var(--color-text-primary)',
  },
  priceGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  priceRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    fontSize: 13.5,
    alignItems: 'baseline',
  },
  priceK: {
    width: 88,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
    fontSize: 12,
  },
  priceV: {
    color: 'var(--color-text-primary)',
    fontWeight: 500,
  },
  featList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  feat: {
    fontSize: 12.5,
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  pcGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr 1fr',
      '@media (max-width: 520px)': '1fr',
    },
    gap: 'var(--spacing-4)',
  },
  pcCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  pcHead: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0,
    color: 'var(--color-text-secondary)',
  },
  pcItem: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    fontSize: 13,
    color: 'var(--color-text-primary)',
    alignItems: 'flex-start',
    lineHeight: 1.4,
  },
  con: {
    color: 'var(--color-error)',
    display: 'flex',
    flexShrink: 0,
    marginTop: 2,
  },
  caveat: {
    fontSize: 11.5,
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--spacing-2)',
    fontStyle: 'italic',
  },
})

export function ProductDetailPanel({
  item,
  siblings,
  onClose,
  onSelect,
}: {
  item: DetailPanelItem
  siblings: DetailPanelItem[]
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const alts = siblings.filter((x) => x.id !== item.id).slice(0, 4)
  const hasPricing = item.pricingFree != null || item.pricingPaid != null
  const hasPC = (item.pros?.length ?? 0) > 0 || (item.cons?.length ?? 0) > 0

  return (
    <>
      <div {...stylex.props(s.scrim)} onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} details`}
        {...stylex.props(s.panel)}
      >
        <div {...stylex.props(s.head)}>
          <div {...stylex.props(s.mono)} style={{ backgroundColor: monogramColor(item.name) }}>
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div {...stylex.props(s.name)}>
              {item.name}
              <Badge variant={item.track === 'app' ? 'blue' : 'purple'} label={item.typeLabel} />
            </div>
          </div>
          <button type="button" aria-label="Close details" {...stylex.props(s.close)} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p {...stylex.props(s.desc)}>{item.bestFor}</p>

        <div {...stylex.props(s.btns)}>
          {item.homepage && (
            <Button
              variant="secondary"
              label="Official site"
              endContent={<ExternalLink size={14} />}
              onClick={() => window.open(item.homepage!, '_blank', 'noreferrer')}
            />
          )}
        </div>

        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.secLabel)}>WHY IT RANKS #{item.rank}</div>
          <p {...stylex.props(s.basis)}>{item.rankBasis ?? item.bestFor}</p>
        </div>

        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.secLabel)}>PRICING</div>
          {hasPricing ? (
            <div {...stylex.props(s.priceGrid)}>
              <div {...stylex.props(s.priceRow)}>
                <span {...stylex.props(s.priceK)}>Free plan</span>
                <span {...stylex.props(s.priceV)}>{item.pricingFree ?? 'None'}</span>
              </div>
              <div {...stylex.props(s.priceRow)}>
                <span {...stylex.props(s.priceK)}>Basic paid</span>
                <span {...stylex.props(s.priceV)}>{item.pricingPaid ?? '—'}</span>
              </div>
            </div>
          ) : (
            <p {...stylex.props(s.basis)}>{item.pricing ?? '—'}</p>
          )}
        </div>

        {item.features && item.features.length > 0 && (
          <div {...stylex.props(s.section)}>
            <div {...stylex.props(s.secLabel)}>KEY FEATURES</div>
            <div {...stylex.props(s.featList)}>
              {item.features.map((feature) => (
                <span key={feature} {...stylex.props(s.feat)}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.secLabel)}>STRENGTHS &amp; LIMITATIONS</div>
          {hasPC ? (
            <>
              <div {...stylex.props(s.pcGrid)}>
                <div {...stylex.props(s.pcCol)}>
                  <div {...stylex.props(s.pcHead)}>STRENGTHS</div>
                  {(item.pros ?? []).map((pro) => (
                    <div key={pro} {...stylex.props(s.pcItem)}>
                      <span {...stylex.props(s.green)}>
                        <Check size={15} />
                      </span>
                      {pro}
                    </div>
                  ))}
                </div>
                <div {...stylex.props(s.pcCol)}>
                  <div {...stylex.props(s.pcHead)}>LIMITATIONS</div>
                  {(item.cons ?? []).map((con) => (
                    <div key={con} {...stylex.props(s.pcItem)}>
                      <span {...stylex.props(s.con)}>
                        <Minus size={15} />
                      </span>
                      {con}
                    </div>
                  ))}
                </div>
              </div>
              <div {...stylex.props(s.caveat)}>
                From aggregated reviews &amp; community — not our own hands-on test yet.
              </div>
            </>
          ) : (
            <div {...stylex.props(s.pending)}>
              Review pending — competitive strengths and limitations are added from aggregated
              reviews and our own testing.
            </div>
          )}
        </div>

        <div {...stylex.props(s.section)}>
          <div {...stylex.props(s.secLabel)}>SOURCES ({item.sources.length})</div>
          <div {...stylex.props(s.srcRow)}>
            {item.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                {...stylex.props(s.src)}
              >
                {source.name}
              </a>
            ))}
          </div>
        </div>

        {alts.length > 0 && (
          <div {...stylex.props(s.section)}>
            <div {...stylex.props(s.secLabel)}>OTHER {item.typeLabel.toUpperCase()} OPTIONS</div>
            <div {...stylex.props(s.alts)}>
              {alts.map((alternative) => (
                <button
                  key={alternative.id}
                  type="button"
                  {...stylex.props(s.alt)}
                  onClick={() => onSelect(alternative.id)}
                >
                  <span
                    {...stylex.props(s.altMono)}
                    style={{ backgroundColor: monogramColor(alternative.name) }}
                  >
                    {alternative.name.charAt(0).toUpperCase()}
                  </span>
                  {alternative.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
