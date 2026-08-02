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

import type { CategoryView, RankItem, Track } from '~/lib/catalog'
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
    gridTemplateColumns: {default: '120px minmax(0, 1fr)', '@media (max-width: 640px)': '1fr'},
    gap: spacingVars['--spacing-3'],
    alignItems: 'baseline',
  },
})

export function CategoryPage({ view }: { view: CategoryView }) {
  const { category, tracks, notes, watchlist } = view

  // The top Leading entry of each route. Not a computation over the data —
  // just the first row of each column, said once at the top so the answer is
  // not something you have to assemble by reading three lists.
  const shortAnswer = TRACKS.map((track) => ({
    track,
    item: tracks[track].find((entry) => entry.standing === 'leading'),
  })).filter((row): row is { track: Track; item: RankItem } => Boolean(row.item))

  return (
    <VStack>
      <Section variant="transparent" padding={0} paddingBlock={6}>
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
            * It used to hold the editor's ranking note — several paragraphs of
            * internal reasoning about why one entry outranks another. That is
            * real content, but it is *our* process, and nobody arriving at an
            * area page wants the methodology before the answer. The note moves
            * below the columns; this slot now carries the answer: the top pick
            * on each route, which is what the reader came to find out.
            *
            * Nothing here is synthesised — it is the first Leading entry of
            * each route and its own authored line. */}
          {shortAnswer.length ? (
            <Card variant="blue" padding={4}>
              <VStack gap={3}>
                <VStack gap={1}>
                  <Text type="label" color="accent">
                    Our read
                  </Text>
                  <Heading level={2}>If you only read one thing</Heading>
                </VStack>
                <VStack gap={3}>
                  {shortAnswer.map(({ track, item }) => (
                    <div key={track} {...stylex.props(styles.answerRow)}>
                      <Text type="label" color="secondary">
                        {TRACK_LABEL[track]}
                      </Text>
                      <VStack gap={0.5}>
                        <Text type="body" weight="semibold">
                          {item.name}
                        </Text>
                        <Text type="supporting" textWrap="pretty">
                          {item.edge || item.bestFor}
                        </Text>
                      </VStack>
                    </div>
                  ))}
                </VStack>
              </VStack>
            </Card>
          ) : null}
        </VStack>
      </Section>

      <Section variant="transparent" padding={0} paddingBlock={0}>
        <Grid columns={{ minWidth: 320, max: 3 }} gap={4} align="stretch">
          {TRACKS.map((track) => (
            <TrackColumn
              key={track}
              track={track}
              items={tracks[track]}
              categorySlug={category.slug}
            />
          ))}
        </Grid>
      </Section>

      {/* Demoted, and below the thing it describes. The note is an editor's
        * account of how this area was decided — worth publishing, worth
        * reading second. */}
      {notes ? (
        <Section variant="transparent" padding={0} paddingBlock={6}>
          <Card variant="muted" padding={4}>
            <VStack gap={1.5}>
              <Heading level={2}>How we ranked these</Heading>
              <Text type="body" color="secondary" textWrap="pretty">
                {notes}
              </Text>
            </VStack>
          </Card>
        </Section>
      ) : null}

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

function TrackColumn({
  track,
  items,
  categorySlug,
}: {
  track: Track
  items: RankItem[]
  categorySlug: string
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
            hint="Established picks, at the top of today's aggregate."
            items={leading}
            categorySlug={categorySlug}
            xstyle={styles.leading}
          />
          {/* Emerging sits on the recessed tone: the incumbent/challenger split
            * gets a hard edge, and the challengers read as secondary without
            * spending a second colour on them. */}
          <Standing
            label="Emerging"
            hint="Newer challengers, surfaced by two or more sources."
            items={emerging}
            categorySlug={categorySlug}
            xstyle={styles.emerging}
          />
        </>
      )}
    </Card>
  )
}

/** Five is the shortlist; the rest is available but not spent on first read.
 *
 * The Skills column on a busy area runs to sixteen entries, and a sixteen-row
 * column is a directory — the thing this product is defined against. */
const SHORTLIST = 5

function Standing({
  label,
  hint,
  items,
  categorySlug,
  xstyle,
}: {
  label: string
  hint: string
  items: RankItem[]
  categorySlug: string
  xstyle?: stylex.StyleXStyles
}) {
  const [isExpanded, setExpanded] = useState(false)

  if (items.length === 0) return null

  const shown = isExpanded ? items : items.slice(0, SHORTLIST)
  const hidden = items.length - shown.length

  return (
    <VStack gap={2} xstyle={xstyle}>
      <VStack gap={0.5}>
        <Text type="label">{label}</Text>
        <Text type="supporting">{hint}</Text>
      </VStack>
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
      {hidden > 0 || isExpanded ? (
        <HStack>
          <Button
            variant="ghost"
            size="sm"
            label={isExpanded ? 'Show fewer' : `View all ${items.length}`}
            onClick={() => setExpanded((open) => !open)}
          />
        </HStack>
      ) : null}
    </VStack>
  )
}
