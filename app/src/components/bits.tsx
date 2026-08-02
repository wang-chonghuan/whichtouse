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
  // Two things here are worked around rather than written the obvious way,
  // both for the same reason: Astryx's reset lives in @layer reset, which is
  // declared AFTER our StyleX layers, so its zero-specificity rules still win.
  //   :where(a)  { color: inherit }        -> colour cannot be set on the <a>
  //   :where(*)  { border-color: currentColor } -> nor can border-color
  // Hence the colour goes on an inner <span> (not an anchor, so the rule does
  // not reach it) and the outline is an inset box-shadow, which the reset does
  // not touch. background-color has no reset rule and is set normally.
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1-5'],
    borderRadius: 8,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    fontWeight: 600,
    textDecoration: 'none',
  },
  primary: {
    backgroundColor: colorVars['--color-accent'],
  },
  primaryLabel: {
    color: colorVars['--color-on-accent'],
  },
  secondary: {
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: `inset 0 0 0 1px ${colorVars['--color-border']}`,
  },
  secondaryLabel: {
    color: colorVars['--color-text-accent'],
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 7,
  },
  ink: { backgroundColor: colorVars['--color-text-primary'] },
  limit: { backgroundColor: colorVars['--color-error'] },
  limitTone: { color: colorVars['--color-text-red'] },

  // The wordmark is drawn art, not set type: the neon bloom around the letters
  // is the whole character of it and no font can carry that. So it is an image,
  // and the only thing this style decides is how tall it stands.
  //
  // Width is left to the file's own aspect ratio rather than pinned to a second
  // number here, so a re-cut master cannot come out stretched. The width/height
  // attributes reserve the box before the image lands; the height below is what
  // actually decides the size, and the two must agree or the bar reflows.
  //
  // No colour: the file carries its own, deliberately independent of the theme
  // — the logo should not recolour because the product did.
  wordmark: {
    height: 34,
    width: 'auto',
    display: 'block',
  },
})

/** WhichToUse, as the neon lockup. Cut out of resources/wtu-logo-name.png by
 * scripts/crop-wordmark.mjs — the two files are one crop at 1x and 2x, and
 * neither is edited by hand.
 *
 * `alt` is empty on purpose: the link wrapping this in `app-frame` already
 * carries the accessible name, and a second copy would read the brand twice. */
export function Wordmark() {
  return (
    <img
      src="/wordmark-116.webp"
      srcSet="/wordmark-116.webp 1x, /wordmark-232.webp 2x"
      alt=""
      width={116}
      height={34}
      {...stylex.props(styles.wordmark)}
    />
  )
}

/** Astryx's Text/Heading colour enum has no member for the limits hue, and
 * Card's coloured variants set a background but not a text colour. Setting the
 * colour once on a wrapper and letting the heading inherit keeps the element
 * semantic and the value in a token. */
export function LimitTone({ children }: { children: React.ReactNode }) {
  return <div {...stylex.props(styles.limitTone)}>{children}</div>
}

/** Standing is an enum, so it renders as a Badge; the two values are the whole
 * hierarchy of a column and must never look interchangeable.
 *
 * Leading takes the primary tint rather than green: green as "good" is retired
 * across this product, and the soft stop is deliberate — a solid indigo chip on
 * every top row would shout louder than the ranking it labels. */
export function StandingBadge({ standing }: { standing: RankItem['standing'] }) {
  return standing === 'leading' ? (
    <Badge variant="blue" label="Leading" />
  ) : (
    <Badge variant="neutral" label="Emerging" />
  )
}

/** Confidence is neutral in every state. It is a third meaning, and the palette
 * has exactly two jobs left — indigo for our judgement, coral for limits.
 * Spending a colour here would dilute both; the word already says it. */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <Badge variant="neutral" label={`${confidence} confidence`} />
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

/** A link that has to read as the page's primary action.
 *
 * Astryx's Button takes no href and its Link is a text link, so nothing in the
 * system covers "navigate, and look like the main thing to do". Built on our
 * own <a> rather than by overriding one of theirs: a component that owns
 * padding and colour cannot be argued with from a consumer stylesheet, and
 * every value here still comes from a theme token, so a theme swap carries it. */
export function ActionLink({
  href,
  children,
  variant = 'primary',
  isExternal = false,
}: {
  href: string
  children: string
  variant?: 'primary' | 'secondary'
  isExternal?: boolean
}) {
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...stylex.props(styles.action, styles[variant])}>
      <span {...stylex.props(variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel)}>
        {children}
      </span>
    </a>
  )
}

/** Strengths are marked in ink, never in green.
 *
 * Green as "good" collides with green as a brand colour, and green/red is the
 * one pair colour-blind readers cannot separate. Coral carries the limits on
 * its own — which is also what the product promises. */
export function Bullet({ tone }: { tone: 'ink' | 'limit' }) {
  return <span {...stylex.props(styles.bullet, styles[tone])} aria-hidden />
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
