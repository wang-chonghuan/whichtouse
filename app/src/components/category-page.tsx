import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Section } from '@astryxdesign/core/Section'
import { Grid } from '@astryxdesign/core/Grid'
import { Card } from '@astryxdesign/core/Card'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { List, ListItem } from '@astryxdesign/core/List'
import { Divider } from '@astryxdesign/core/Divider'
import { Token } from '@astryxdesign/core/Token'
import { Icon } from '@astryxdesign/core/Icon'
import { Button } from '@astryxdesign/core/Button'
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

import type { BeforeYouPick, CategoryView, RankItem, Track } from '~/lib/catalog'
import { itemHref, RankMarker, TRACK_BLURB, TRACK_LABEL } from './bits'
import { SectionHeading } from './home-page'

// One task, three routes. The routes are the page: a hosted product, a repo you
// run and a skill you drop in are not substitutes for each other, and the
// layout has to say so before any individual row is read.
//
// One card per route — a card is a widget container, so it wraps the whole
// leaderboard and never an individual row (Astryx calls card-per-row "card
// soup"). Before this the three routes were unbounded columns of rows and the
// page read as six floating clusters with nothing to say where one route ended.

const TRACKS: Track[] = ['app', 'oss', 'skill']

const styles = stylex.create({
  // Starts flush with the area rail beside it — see `firstSection` in
  // home-page.tsx for why the gap below is a margin and not this section's own
  // block padding. The section under this one has none of its own, so zeroing
  // the padding without putting the 24px back would collapse the two together.
  firstSection: {
    marginBlockEnd: spacingVars['--spacing-6'],
  },
  // The routes hold different numbers of entries, so content-height cards put
  // the Emerging band at three different altitudes and the ragged edge reads as
  // noise. Equal height plus a bottom-anchored Emerging block lines the two
  // standings up across all three columns — which is the comparison the page
  // exists to make.
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  emerging: {
    marginTop: 'auto',
    backgroundColor: colorVars['--color-background-muted'],
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  leading: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  header: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  // Three columns of "route label | pick", so the labels line up and the card
  // reads as an answer table rather than a paragraph. Collapses on narrow.
  answerRow: {
    display: 'grid',
    gridTemplateColumns: {default: '150px minmax(0, 1fr)', '@media (max-width: 640px)': '1fr'},
    gap: spacingVars['--spacing-3'],
    alignItems: 'baseline',
  },
})

export function CategoryPage({ view }: { view: CategoryView }) {
  const { category, tracks, watchlist, beforeYouPick } = view

  return (
    <VStack>
      <Section
        variant="transparent"
        padding={0}
        paddingBlock={0}
        xstyle={styles.firstSection}>
        <VStack gap={4}>
          <Breadcrumbs variant="supporting">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem isCurrent>{category.name}</BreadcrumbItem>
          </Breadcrumbs>
          <VStack gap={2}>
            <Heading level={1}>{category.name}</Heading>
            <Text type="large" color="secondary" textWrap="pretty">
              SaaS, open source and skills for {category.name.toLowerCase()} work —
              with the limits of each written down.
            </Text>
          </VStack>
          {/* This page's one primary callout, and it always means the same
            * thing site-wide: a judgement we made, as opposed to a number an
            * aggregate produced.
            *
            * It carries how to choose here, never which product to choose —
            * the lists below already answer that, and a card that repeats them
            * costs a screenful to say nothing. Two earlier drafts failed on
            * exactly that: one held the editor's ranking methodology, which is
            * our process rather than the reader's question; the next held the
            * top pick of each route, which was the first row of each list
            * quoted back.
            *
            * Every line is a generalisation about the class of product. Naming
            * a vendor would turn it into a news bulletin; a line that would
            * read equally well on another category's page is filler. Both
            * tests are in the research prompt that produces these. */}
          <BeforeYouPickCard tips={beforeYouPick} />
        </VStack>
      </Section>

      {/* What "Leading" and "Emerging" mean is one fact about the page, not
        * three, so it is explained once and the other two columns carry the
        * bare labels. The first *populated* route rather than a fixed one: a
        * route with no entries renders an empty state and no standings at all,
        * which would leave the explanation nowhere on the page. */}
      <Section variant="transparent" padding={0} paddingBlock={0}>
        <Grid columns={{ minWidth: 320, max: 3 }} gap={4} align="stretch">
          {TRACKS.map((track) => (
            <TrackColumn
              key={track}
              track={track}
              items={tracks[track]}
              categorySlug={category.slug}
              hasHints={track === TRACKS.find((t) => tracks[t].length > 0)}
            />
          ))}
        </Grid>
      </Section>

      {/* "How we ranked these" was here: a demoted card carrying an editor's
        * account of how the area was decided. Removed, and the reason is worth
        * keeping because the idea will come back.
        *
        * Every honest version of it said the same thing — each column is ranked
        * on its own, by adoption, checked by hand — which is one fact about the
        * whole site, not twenty-five facts about twenty-five areas. Said once
        * per area it is filler; the versions that avoided sounding like filler
        * did so by drifting into our own process notes, which is worse. If the
        * method needs stating, it belongs in one place site-wide, not below
        * every list.
        *
        * The `notes` field still exists in the corpus, the database and
        * CategoryView — nothing reads it now. */}

      {watchlist.length > 0 ? (
        <Section variant="transparent" padding={0} paddingBlock={6}>
          <VStack gap={4}>
            <SectionHeading
              title="On the watchlist"
              description="Named by a source we trust, but not on the shortlist."
            />
            <HStack gap={2} wrap="wrap">
              {watchlist.map((entry) => (
                <Token
                  key={entry.name}
                  label={entry.name}
                  href={entry.url ?? undefined}
                  color="gray"
                />
              ))}
            </HStack>
          </VStack>
        </Section>
      ) : null}
    </VStack>
  )
}

/** Three lines, each optional. Research decays, so a category that has not
 * been looked at yet shows nothing rather than an empty frame — the same rule
 * the rest of the site follows for absent content. */
function BeforeYouPickCard({ tips }: { tips: BeforeYouPick }) {
  const [isOpen, setOpen] = useState(false)

  const lines = (
    [
      ['What decides it', tips.weigh, tips.details.weigh],
      ['What to avoid', tips.avoid, tips.details.avoid],
      ['What is changing', tips.moving, tips.details.moving],
    ] as const
  ).filter(([, body]) => Boolean(body))

  if (lines.length === 0) return null

  // Only offered when there is something behind it. A control that expands to
  // nothing teaches the reader not to press it again.
  const expandable = lines.some(([, , detail]) => Boolean(detail))

  return (
    <Card variant="blue" padding={4}>
      <VStack gap={3}>
        <HStack hAlign="between" vAlign="center" gap={3} wrap="wrap">
          <Heading level={2}>Before you pick</Heading>
          {expandable ? (
            <Button
              variant="ghost"
              size="sm"
              label={isOpen ? 'Show less' : 'View all'}
              endContent={
                <Icon icon={isOpen ? 'chevronDown' : 'chevronRight'} size="sm" />
              }
              onClick={() => setOpen((open) => !open)}
            />
          ) : null}
        </HStack>
        <VStack gap={isOpen ? 5 : 3}>
          {lines.map(([label, body, detail]) => (
            <div key={label} {...stylex.props(styles.answerRow)}>
              <Text type="label" color="accent">
                {label}
              </Text>
              <VStack gap={2}>
                <Text type="body" textWrap="pretty">
                  {body}
                </Text>
                {/* The one-line finding stays put when the detail opens under
                  * it — the reader keeps the claim in view while reading what
                  * it rests on, rather than the summary being replaced. */}
                {isOpen && detail ? (
                  <Text type="body" color="secondary" textWrap="pretty">
                    {detail}
                  </Text>
                ) : null}
              </VStack>
            </div>
          ))}
        </VStack>
      </VStack>
    </Card>
  )
}

function TrackColumn({
  track,
  items,
  categorySlug,
  hasHints,
}: {
  track: Track
  items: RankItem[]
  categorySlug: string
  hasHints: boolean
}) {
  const leading = items.filter((item) => item.standing === 'leading')
  const emerging = items.filter((item) => item.standing === 'emerging')

  return (
    <Card padding={0} xstyle={styles.card}>
      <VStack gap={0.5} xstyle={styles.header}>
        <Heading level={3}>{TRACK_LABEL[track]}</Heading>
        <Text type="supporting">{TRACK_BLURB[track]}</Text>
      </VStack>
      <Divider />

      {items.length === 0 ? (
        <VStack xstyle={styles.leading}>
          <EmptyState
            isCompact
            title="Nothing here yet"
            description="Nothing on this route has made the shortlist."
          />
        </VStack>
      ) : (
        <>
          <Standing
            label="Leading"
            hint={hasHints ? "Established picks, at the top of today's aggregate." : undefined}
            items={leading}
            categorySlug={categorySlug}
            xstyle={styles.leading}
          />
          {/* Emerging sits on the recessed tone: the incumbent/challenger split
            * gets a hard edge, and the challengers read as secondary without
            * spending a second colour on them. */}
          <Standing
            label="Emerging"
            hint={hasHints ? 'Newer challengers, surfaced by two or more sources.' : undefined}
            items={emerging}
            categorySlug={categorySlug}
            xstyle={styles.emerging}
          />
        </>
      )}
    </Card>
  )
}

/** Five is the shortlist; ten is everything this page will ever show.
 *
 * The Skills column on a busy area runs to sixteen entries, and a sixteen-row
 * column is a directory — the thing this product is defined against. Expanding
 * is for the reader who wants more than the shortlist, not for exhausting the
 * corpus, so the ceiling holds even when there are more rows behind it. */
const SHORTLIST = 5
const EXPANDED = 10

function Standing({
  label,
  hint,
  items,
  categorySlug,
  xstyle,
}: {
  label: string
  hint?: string
  items: RankItem[]
  categorySlug: string
  xstyle?: stylex.StyleXStyles
}) {
  const [isExpanded, setExpanded] = useState(false)

  if (items.length === 0) return null

  const shown = items.slice(0, isExpanded ? EXPANDED : SHORTLIST)
  const hidden = items.length - shown.length

  return (
    <VStack gap={2} xstyle={xstyle}>
      {/* The caption used to sit on its own line under the label, in every
        * column — three routes times two standings, six lines of the same two
        * sentences on every area page. As a tooltip it costs no height, and
        * Button carries it rather than a bare Icon so it is focusable and
        * reachable by keyboard and touch instead of hover-only. */}
      <HStack gap={1} vAlign="center">
        <Text type="label">{label}</Text>
        {hint ? (
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<Icon icon="info" size="sm" color="secondary" />}
            label={`What ${label} means`}
            tooltip={hint}
          />
        ) : null}
      </HStack>
      <List density="balanced" hasDividers>
        {shown.map((item, index) => (
          <ListItem
            key={item.id}
            label={item.name}
            href={itemHref(categorySlug, item)}
            // Position within this standing, not the row's global rank. The
            // two standings answer different questions, so an Emerging row
            // numbered 8 read as "eighth best" when it means "first
            // challenger".
            startContent={<RankMarker rank={index + 1} />}
            description={
              <Text type="supporting" maxLines={2}>
                {item.bestFor}
              </Text>
            }
            endContent={<Icon icon="chevronRight" size="sm" color="secondary" />}
          />
        ))}
      </List>
      {/* "View all 16" would be a promise this control cannot keep now that
        * expanding stops at ten. It says what pressing it actually does. */}
      {hidden > 0 || isExpanded ? (
        <HStack>
          <Button
            variant="ghost"
            size="sm"
            label={
              isExpanded
                ? 'Show fewer'
                : items.length > EXPANDED
                  ? `View top ${EXPANDED}`
                  : `View all ${items.length}`
            }
            onClick={() => setExpanded((open) => !open)}
          />
        </HStack>
      ) : null}
    </VStack>
  )
}
