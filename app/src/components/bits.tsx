import * as stylex from '@stylexjs/stylex'
import { Badge } from '@astryxdesign/core/Badge'
import { Text } from '@astryxdesign/core/Text'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

import type { Confidence, RankItem, Track } from '~/lib/catalog'

// Small shared pieces. Anything here is a rendering of one of the product's
// load-bearing distinctions — leading vs emerging, a real value vs an absent
// one — so they live in one file rather than being re-improvised per page,
// where they would drift apart.

export const TRACK_LABEL: Record<Track, string> = {
  app: 'SaaS',
  oss: 'Open source',
  skill: 'Skills',
}

export const TRACK_BLURB: Record<Track, string> = {
  app: 'Hosted products you sign up for.',
  oss: 'Repositories you run yourself.',
  skill: 'Skills you drop into a coding agent.',
}

const styles = stylex.create({
  // The placeholder has to be visibly empty rather than convincingly blank:
  // a dashed grey slot reads as "nothing here yet" at a glance, where grey
  // prose reads as content.
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colorVars['--color-border'],
    borderRadius: 6,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
  },
  // Only min-width: text-align belongs to Text's own `justify` prop, and a
  // property the component already owns cannot be overridden from here —
  // Astryx's atomic CSS carries a specificity boost that outranks ours.
  rank: {
    minWidth: 20,
  },
})

/** Standing is an enum, so it renders as a Badge; the two values are the whole
 * hierarchy of a column and must never look interchangeable. */
export function StandingBadge({ standing }: { standing: RankItem['standing'] }) {
  return standing === 'leading' ? (
    <Badge variant="success" label="Leading" />
  ) : (
    <Badge variant="neutral" label="Emerging" />
  )
}

const CONFIDENCE_VARIANT: Record<Confidence, 'success' | 'warning' | 'neutral'> = {
  high: 'success',
  medium: 'warning',
  low: 'neutral',
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <Badge variant={CONFIDENCE_VARIANT[confidence]} label={`${confidence} confidence`} />
  )
}

/** Stands in for content the app cannot supply yet. Never a blank space and
 * never invented prose — the difference between the two is what the site
 * sells. */
export function Placeholder({ children }: { children: string }) {
  return (
    <div {...stylex.props(styles.placeholder)}>
      <Text type="supporting" color="disabled">
        {children}
      </Text>
    </div>
  )
}

export function RankMarker({ rank }: { rank: number }) {
  return (
    <Text
      type="supporting"
      color="secondary"
      hasTabularNumbers
      display="block"
      justify="end"
      xstyle={styles.rank}>
      {rank}
    </Text>
  )
}

/** Where a listing lives, as a path. Kept next to the other shared rendering
 * decisions so no page invents a second URL shape for the same row. */
export function itemHref(categorySlug: string, item: RankItem): string {
  return `/c/${categorySlug}/${item.id}`
}
