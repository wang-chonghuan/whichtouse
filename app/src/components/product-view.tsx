// Product detail — implements demo/product.html as a real page.
//
// The demo renders this as a full page with a breadcrumb and a two-column body,
// so that is what this is. The old right-hand drawer is gone; the view decides
// the structure, and the routing follows it.

import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'

import { Mockup, MonoTile, Panel, Pill, SectionHeading, ValenceLine } from '~/components/ui/primitives'
import type { Category, RankItem, Track } from '~/lib/catalog'

const TYPE_LABEL: Record<Track, string> = {
  app: 'App / SaaS',
  oss: 'Open Source',
  skill: 'Agent Skill',
}

const s = stylex.create({
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

  // §3.9 — breadcrumb with a 36px circular back control
  crumbs: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
    color: 'var(--wt-ink-muted)',
  },
  back: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'var(--wt-line)', ':hover': 'rgba(26,26,26,0.2)' },
    backgroundColor: 'var(--wt-surface)',
    color: 'var(--wt-ink)',
    textDecoration: 'none',
  },
  crumbLink: { color: { default: 'var(--wt-ink-muted)', ':hover': 'var(--wt-ink)' }, textDecoration: 'none' },
  crumbHere: { fontWeight: 600, color: 'var(--wt-ink)' },

  grid: {
    display: 'grid',
    gap: 32,
    gridTemplateColumns: { default: '2fr 1fr', '@media (max-width: 1024px)': '1fr' },
  },
  mainCol: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 },
  sideCol: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 },

  // §3.3 detail hero card
  hero: {
    borderRadius: 'var(--wt-r-2xl)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--wt-line)',
    backgroundColor: 'var(--wt-surface)',
    padding: { default: 24, '@media (max-width: 640px)': 20 },
  },
  heroTop: {
    display: 'flex',
    gap: 16,
    flexDirection: { default: 'row', '@media (max-width: 640px)': 'column' },
    alignItems: { default: 'flex-start', '@media (max-width: 640px)': 'stretch' },
  },
  heroIdent: { display: 'flex', minWidth: 0, flex: 1, alignItems: 'flex-start', gap: 16 },
  h1: {
    margin: 0,
    fontSize: { default: 34, '@media (max-width: 640px)': 30 },
    lineHeight: 1.25,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    color: 'var(--wt-ink)',
    overflowWrap: 'anywhere',
  },
  badges: { marginTop: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },

  // §3.1 buttons
  btnBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 'var(--wt-r-xl)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '150ms',
  },
  btnPrimary: {
    paddingInline: 20,
    borderWidth: 0,
    backgroundColor: { default: 'var(--wt-ink)', ':hover': 'rgba(26,26,26,0.88)' },
    color: '#ffffff',
  },
  btnOutline: {
    paddingInline: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: 'var(--wt-input, #e0e1de)', ':hover': 'rgba(26,26,26,0.2)' },
    backgroundColor: 'var(--wt-surface)',
    color: 'var(--wt-ink)',
  },

  desc: { marginBlock: 0, marginTop: 20, fontSize: 15.5, lineHeight: 1.5, color: 'var(--wt-ink-muted)' },
  prose: { marginBlock: 0, fontSize: 14.5, lineHeight: 1.625, color: 'var(--wt-ink)' },

  twoCol: {
    display: 'grid',
    columnGap: 32,
    rowGap: 12,
    gridTemplateColumns: { default: '1fr 1fr', '@media (max-width: 640px)': '1fr' },
  },
  bullets: { display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' },
  caveat: { marginTop: 16, marginBottom: 0, fontSize: 12.5, color: 'var(--wt-ink-muted)' },

  priceBox: { overflow: 'hidden', borderRadius: 'var(--wt-r-xl)', backgroundColor: 'var(--wt-fill)' },
  priceRow: {
    display: 'flex',
    gap: 16,
    paddingInline: 16,
    paddingBlock: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line)',
  },
  priceRowLast: { borderBottomWidth: 0 },
  priceKey: { width: 88, flexShrink: 0, fontSize: 12, color: 'var(--wt-ink-muted)' },
  priceVal: { fontSize: 13.5, color: 'var(--wt-ink)' },

  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 9999,
    backgroundColor: 'var(--wt-fill)',
    paddingInline: 12,
    paddingBlock: 4,
    fontSize: 13.5,
    fontWeight: 500,
    color: 'var(--wt-ink-secondary)',
  },

  srcRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 10,
    paddingLeft: { default: 2, ':hover': 10 },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line-soft)',
    fontSize: 14,
    color: 'var(--wt-ink)',
    textDecoration: 'none',
    transitionProperty: 'padding',
    transitionDuration: '150ms',
  },
  grow: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dim: { flexShrink: 0, color: 'var(--wt-ink-muted)' },

  card: {
    borderRadius: 'var(--wt-r-2xl)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--wt-line)',
    backgroundColor: 'var(--wt-surface)',
    padding: 20,
  },
  cardTint: { borderColor: 'var(--wt-panel-tint-border)', backgroundColor: 'var(--wt-panel-tint)' },
  cardTitle: { margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 600, color: 'var(--wt-ink)' },
  cardNote: { marginBlock: 0, marginBottom: 8, fontSize: 13.5, color: 'var(--wt-ink-muted)' },
  factRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
    paddingBlock: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line-soft)',
  },
  factLast: { borderBottomWidth: 0 },
  factKey: { fontSize: 13.5, color: 'var(--wt-ink-muted)' },
  factVal: { fontSize: 14, fontWeight: 600, textAlign: 'end', color: 'var(--wt-ink)' },
  altRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 10,
    paddingLeft: { default: 2, ':hover': 10 },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--wt-line-soft)',
    textDecoration: 'none',
    color: 'var(--wt-ink)',
    transitionProperty: 'padding',
    transitionDuration: '150ms',
  },
  altBody: { minWidth: 0, flex: 1 },
  altName: { display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  altSub: { display: 'block', marginTop: 2, fontSize: 12.5, color: 'var(--wt-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
})

const IconExternal = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
)

export function ProductView({
  item,
  category,
  siblings,
  track,
}: {
  item: RankItem
  category: Category
  siblings: RankItem[]
  track: Track
}) {
  const hasPricing = item.pricingFree != null || item.pricingPaid != null
  const alts = siblings.filter((x) => x.id !== item.id).slice(0, 5)

  return (
    <div {...stylex.props(s.page)}>
      <nav {...stylex.props(s.crumbs)}>
        <Link to="/c/$slug" params={{ slug: category.slug }} aria-label={`Back to ${category.name}`} {...stylex.props(s.back)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5m0 0 7 7m-7-7 7-7" />
          </svg>
        </Link>
        <Link to="/" {...stylex.props(s.crumbLink)}>Home</Link>
        <span>›</span>
        <Link to="/c/$slug" params={{ slug: category.slug }} {...stylex.props(s.crumbLink)}>
          {category.name}
        </Link>
        <span>›</span>
        <span {...stylex.props(s.crumbHere)}>{item.name}</span>
      </nav>

      <div {...stylex.props(s.grid)}>
        <div {...stylex.props(s.mainCol)}>
          <section {...stylex.props(s.hero)}>
            <div {...stylex.props(s.heroTop)}>
              <div {...stylex.props(s.heroIdent)}>
                <MonoTile name={item.name} size="lg" />
                <div style={{ minWidth: 0 }}>
                  <h1 {...stylex.props(s.h1)}>{item.name}</h1>
                  <div {...stylex.props(s.badges)}>
                    <Pill tone="strong">
                      {item.standing} · #{item.rank}
                    </Pill>
                    <Pill tone="quiet">{TYPE_LABEL[track]}</Pill>
                    {item.pricing ? <Pill tone="mid">{item.pricing}</Pill> : null}
                    {item.reviewed ? null : <Pill tone="mid">Not yet reviewed</Pill>}
                  </div>
                </div>
              </div>
              <div {...stylex.props(s.actions)}>
                {item.homepage ? (
                  <a
                    href={item.homepage}
                    target="_blank"
                    rel="noreferrer"
                    {...stylex.props(s.btnBase, s.btnPrimary)}
                  >
                    Visit <IconExternal />
                  </a>
                ) : null}
              </div>
            </div>
            <p {...stylex.props(s.desc)}>
              {item.bestFor || <Mockup>No write-up yet — this entry is ranked from sources only.</Mockup>}
            </p>
          </section>

          <section>
            <SectionHeading>Why it ranks #{item.rank}</SectionHeading>
            <p {...stylex.props(s.prose)}>
              {item.rankBasis ?? (
                <Mockup>
                  {item.signals?.length
                    ? `Placed by aggregation: ${item.signals.join(' · ')}. No hands-on write-up yet.`
                    : 'No hands-on write-up yet.'}
                </Mockup>
              )}
            </p>
          </section>

          <section>
            <SectionHeading>Strengths and limitations</SectionHeading>
            {(item.pros?.length ?? 0) + (item.cons?.length ?? 0) > 0 ? (
              <>
                <div {...stylex.props(s.twoCol)}>
                  <ul {...stylex.props(s.bullets)}>
                    {(item.pros ?? []).map((p) => (
                      <li key={p}>
                        <ValenceLine kind="edge">{p}</ValenceLine>
                      </li>
                    ))}
                  </ul>
                  <ul {...stylex.props(s.bullets)}>
                    {(item.cons ?? []).map((c) => (
                      <li key={c}>
                        <ValenceLine kind="con">{c}</ValenceLine>
                      </li>
                    ))}
                  </ul>
                </div>
                <p {...stylex.props(s.caveat)}>
                  From our own use plus aggregated reviews and community reports.
                </p>
              </>
            ) : (
              <p {...stylex.props(s.prose)}>
                <Mockup>Review pending — strengths and limitations are added once we open it.</Mockup>
              </p>
            )}
          </section>

          <section>
            <SectionHeading>Pricing</SectionHeading>
            {hasPricing ? (
              <>
                <div {...stylex.props(s.priceBox)}>
                  <div {...stylex.props(s.priceRow)}>
                    <span {...stylex.props(s.priceKey)}>Free plan</span>
                    <span {...stylex.props(s.priceVal)}>{item.pricingFree ?? '—'}</span>
                  </div>
                  <div {...stylex.props(s.priceRow, s.priceRowLast)}>
                    <span {...stylex.props(s.priceKey)}>Entry paid</span>
                    <span {...stylex.props(s.priceVal)}>{item.pricingPaid ?? 'No paid tier'}</span>
                  </div>
                </div>
                {item.pricingCheckedAt ? (
                  <p {...stylex.props(s.caveat)}>
                    Verified by hand on {item.pricingCheckedAt}. Prices in this category change
                    often — if this looks wrong, it probably is, and we want to know.
                  </p>
                ) : null}
              </>
            ) : (
              <p {...stylex.props(s.prose)}>
                <Mockup>Pricing not checked yet.</Mockup>
              </p>
            )}
          </section>

          {item.features?.length ? (
            <section>
              <SectionHeading>Key features</SectionHeading>
              <div {...stylex.props(s.chips)}>
                {item.features.map((f) => (
                  <span key={f} {...stylex.props(s.chip)}>
                    {f}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {item.sources.length ? (
            <section>
              <SectionHeading>Sources ({item.sources.length})</SectionHeading>
              <div>
                {item.sources.map((src) => (
                  <a
                    key={src.url + src.name}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    {...stylex.props(s.srcRow)}
                  >
                    <span {...stylex.props(s.grow)}>{src.name}</span>
                    <span {...stylex.props(s.dim)}>
                      <IconExternal />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside {...stylex.props(s.sideCol)}>
          <section {...stylex.props(s.card)}>
            <h2 {...stylex.props(s.cardTitle)}>Quick facts</h2>
            <div {...stylex.props(s.factRow)}>
              <span {...stylex.props(s.factKey)}>Form</span>
              <span {...stylex.props(s.factVal)}>{TYPE_LABEL[track]}</span>
            </div>
            <div {...stylex.props(s.factRow)}>
              <span {...stylex.props(s.factKey)}>Standing</span>
              <span {...stylex.props(s.factVal)}>
                {item.standing} · #{item.rank}
              </span>
            </div>
            <div {...stylex.props(s.factRow)}>
              <span {...stylex.props(s.factKey)}>Pricing model</span>
              <span {...stylex.props(s.factVal)}>{item.pricing ?? '—'}</span>
            </div>
            <div {...stylex.props(s.factRow, s.factLast)}>
              <span {...stylex.props(s.factKey)}>Last verified</span>
              <span {...stylex.props(s.factVal)}>
                {item.pricingCheckedAt ?? <Mockup>not yet</Mockup>}
              </span>
            </div>
          </section>

          {alts.length ? (
            <section {...stylex.props(s.card, s.cardTint)}>
              <h2 {...stylex.props(s.cardTitle)}>Other {TYPE_LABEL[track]} options</h2>
              <p {...stylex.props(s.cardNote)}>Same task, same form.</p>
              {alts.map((o, i) => (
                <Link
                  key={o.id}
                  to="/c/$slug/$item"
                  params={{ slug: category.slug, item: o.id }}
                  {...stylex.props(s.altRow, i === alts.length - 1 && s.factLast)}
                >
                  <MonoTile name={o.name} />
                  <span {...stylex.props(s.altBody)}>
                    <span {...stylex.props(s.altName)}>{o.name}</span>
                    <span {...stylex.props(s.altSub)}>{o.edge ?? o.bestFor}</span>
                  </span>
                </Link>
              ))}
            </section>
          ) : null}

          <div {...stylex.props(s.actionGrid)}>
            <button type="button" {...stylex.props(s.btnBase, s.btnOutline)}>
              Suggest an edit
            </button>
            <button type="button" {...stylex.props(s.btnBase, s.btnOutline)}>
              Report
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
