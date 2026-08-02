import * as stylex from '@stylexjs/stylex'
import { Section } from '@astryxdesign/core/Section'
import { Grid } from '@astryxdesign/core/Grid'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { List, ListItem } from '@astryxdesign/core/List'
import { Divider } from '@astryxdesign/core/Divider'
import { Token } from '@astryxdesign/core/Token'
import { Icon } from '@astryxdesign/core/Icon'
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

import type { CategoryView, RankItem, Track } from '~/lib/catalog'
import { itemHref, RankMarker, TRACK_BLURB, TRACK_LABEL } from './bits'
import { SectionHeading } from './home-page'

// One task, three columns. The columns are the page: a hosted product, a repo
// you run and a skill you drop in are not substitutes for each other, and the
// layout has to say so before any individual row is read.
//
// Rows, not cards. Each column is a dense scannable list of the same shape, and
// wrapping every listing in its own card would turn a ranking into a gallery.

const TRACKS: Track[] = ['app', 'oss', 'skill']

const styles = stylex.create({
  page: {
    maxWidth: 1400,
    marginInline: 'auto',
    width: '100%',
  },
  column: {
    minWidth: 0,
  },
  standingLabel: {
    paddingInline: spacingVars['--spacing-1'],
  },
  note: {
    maxWidth: 820,
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
    paddingInlineStart: spacingVars['--spacing-4'],
  },
})

export function CategoryPage({ view }: { view: CategoryView }) {
  const { category, tracks, notes, watchlist } = view

  return (
    <VStack xstyle={styles.page}>
      <Section variant="transparent" padding={6}>
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
          {/* The category note is an editor's account of how this particular
            * column was decided — several paragraphs of reasoning, not a page
            * subtitle. Rendering it at subtitle size buried the ranking below a
            * wall of text, so it sits under its own heading at body size. */}
          {notes ? (
            <VStack gap={2} xstyle={styles.note}>
              <Text type="label">How this task was ranked</Text>
              <Text type="body" color="secondary" textWrap="pretty">
                {notes}
              </Text>
            </VStack>
          ) : null}
        </VStack>
      </Section>

      <Section variant="transparent" padding={6} paddingBlock={0}>
        <Grid columns={{ minWidth: 320, max: 3 }} gap={6} align="start">
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

      {watchlist.length > 0 ? (
        <Section variant="transparent" padding={6}>
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
    <VStack gap={4} xstyle={styles.column}>
      <VStack gap={1}>
        <Heading level={3}>{TRACK_LABEL[track]}</Heading>
        <Text type="supporting">{TRACK_BLURB[track]}</Text>
      </VStack>
      <Divider />

      {items.length === 0 ? (
        <EmptyState
          isCompact
          title="Nothing ranked here yet"
          description="Nothing on this route has made the shortlist yet."
        />
      ) : (
        <VStack gap={5}>
          <Standing
            label="Leading"
            hint="Established picks, at the top of today's aggregate."
            items={leading}
            categorySlug={categorySlug}
          />
          <Standing
            label="Emerging"
            hint="Newer challengers, surfaced by two or more sources."
            items={emerging}
            categorySlug={categorySlug}
          />
        </VStack>
      )}
    </VStack>
  )
}

function Standing({
  label,
  hint,
  items,
  categorySlug,
}: {
  label: string
  hint: string
  items: RankItem[]
  categorySlug: string
}) {
  if (items.length === 0) return null

  return (
    <VStack gap={2}>
      <VStack gap={0.5} xstyle={styles.standingLabel}>
        <Text type="label">{label}</Text>
        <Text type="supporting">{hint}</Text>
      </VStack>
      <List density="balanced" hasDividers>
        {items.map((item) => (
          <ListItem
            key={item.id}
            label={item.name}
            href={itemHref(categorySlug, item)}
            startContent={<RankMarker rank={item.rank} />}
            description={
              <Text type="supporting" maxLines={2}>
                {item.bestFor}
              </Text>
            }
            endContent={<Icon icon="chevronRight" size="sm" color="secondary" />}
          />
        ))}
      </List>
    </VStack>
  )
}
