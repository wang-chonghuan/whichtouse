import * as stylex from '@stylexjs/stylex'
import { Section } from '@astryxdesign/core/Section'
import { Card } from '@astryxdesign/core/Card'
import { Grid } from '@astryxdesign/core/Grid'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'
import { List, ListItem } from '@astryxdesign/core/List'
import { Divider } from '@astryxdesign/core/Divider'
import { Token } from '@astryxdesign/core/Token'
import { Table, pixel, proportional } from '@astryxdesign/core/Table'
import { Icon } from '@astryxdesign/core/Icon'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

import type { Category, CategoryView } from '~/lib/catalog'
import type { TrendingRepositoriesResult, TrendingRepository } from '~/lib/github-trending'
import { ActionLink, Bullet, itemHref, RankMarker } from './bits'

// Home, in three moves: say what the site decides for you, show the shortlists
// it has, and show what the internet is excited about today — clearly
// separated, because the last one is aggregation and the first two are not.
//
// Vocabulary is fixed across every view and must not drift.
//
//   the job    what the reader is trying to get done. Second person, prose
//              only — "the best AI tool for the job". Never a label.
//   area       one of the 25. They are broad on purpose: half of them span
//              several verbs (Voice & Audio is TTS *and* music *and*
//              listening), so naming them after one action would make the
//              label lie about its own list.
//   route      SaaS, open source, skills — the three per area.
//   standing   leading, emerging — the two within a route.
//
// "task" was the word here until it was checked against the list and did not
// fit: an area covers many tasks, so the container could not be one. It also
// carried a to-do-list connotation the product does not want.

const styles = stylex.create({
  // The first section on a page starts flush with the area rail beside it.
  //
  // Both columns begin at the page wrapper's top padding, so any block padding
  // on this section pushes the content down while the rail stays where it is —
  // 32px of drift on this page, and the two tops visibly disagreed. Section's
  // `paddingBlock` is symmetric and it owns the property (Astryx compiles it to
  // padding-block-start/end with a specificity boost, so an xstyle longhand
  // loses silently), which is why the gap *below* comes back as a margin
  // instead: margin is not a property Section sets, so there is nothing to win
  // against, and every gap further down the page is unchanged.
  firstSection: {
    marginBlockEnd: spacingVars['--spacing-8'],
  },
  heroText: {
    maxWidth: 720,
  },
  cardHeader: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  cardFooter: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
  },
})

type Featured = { category: Category; items: CategoryView['tracks']['app'] }

export function HomePage({
  trending,
  categories,
  featured,
}: {
  trending: TrendingRepositoriesResult
  categories: Category[]
  featured: Featured[]
}) {
  const ready = categories.filter((category) => category.ready)

  return (
    <VStack>
      <Section
        variant="transparent"
        padding={0}
        paddingBlock={0}
        xstyle={styles.firstSection}>
        {/* The hero is this page's one primary callout. Site-wide that surface
          * means the same thing — a judgement we made — and on the home page
          * the judgement is the product's whole claim. */}
        <Card variant="blue" padding={6}>
        <VStack gap={5} xstyle={styles.heroText}>
          {/* The headline names the cost of getting this wrong, because that is
            * the reader's actual position — they are not browsing, they have a
            * job to do and one shot at picking a tool for it. The subtitle then
            * says what we hand them instead of a feature table.
            *
            * Coverage moved below into the dimension list. It was three bare
            * numbers in a row, which read as a marketing stat strip and said
            * nothing a reader could use; the same three facts as a list can
            * each carry a clause explaining what they mean.
            *
            * No `type="display-*"`: Astryx scopes the display treatment to the
            * Text component, so on a Heading the prop does nothing — measured
            * identical with it and without. Size belongs to the theme's type
            * scale, not to a prop here. */}
          <VStack gap={3}>
            <Heading level={1} textWrap="balance">
              Pick the wrong AI tool and you lose the week.
            </Heading>
            <Text type="large" color="secondary" textWrap="pretty">
              Every area tells you what actually decides the choice, what to
              avoid, and what&rsquo;s changing — before you look at a single
              product.
            </Text>
          </VStack>
          <VStack gap={2}>
            <Dimension label={`${ready.length} areas of work`}>
              from coding to bookkeeping
            </Dimension>
            <Dimension label="Three routes in each">
              SaaS, open source and agent skills, compared side by side
            </Dimension>
            <Dimension label="Two standings">
              what leads today, and what is gaining on it
            </Dimension>
          </VStack>
          <HStack gap={2} wrap="wrap">
            <ActionLink href="#areas">See all 25 areas</ActionLink>
          </HStack>
        </VStack>
        </Card>
      </Section>

      <Section variant="transparent" padding={0} paddingBlock={6}>
        <VStack gap={4}>
          <SectionHeading
            title="Where to start"
            description="The areas with the most depth behind them right now."
          />
          {/* 220, not 260: with the area rail inside the container the content
              column is ~990px at 1440, where a 260 minimum fits only three of
              the four featured areas and strands the fourth alone on a second
              row. */}
          <Grid columns={{ minWidth: 220, max: 4 }} gap={4}>
            {featured.map(({ category, items }) => (
              <Card key={category.slug} padding={0}>
                <VStack>
                  <HStack
                    hAlign="between"
                    vAlign="center"
                    gap={2}
                    xstyle={styles.cardHeader}>
                    <Text type="label">{category.name}</Text>
                    <Text type="supporting">SaaS</Text>
                  </HStack>
                  <Divider />
                  <List density="compact" hasDividers>
                    {items.slice(0, 5).map((item) => (
                      <ListItem
                        key={item.id}
                        label={item.name}
                        href={itemHref(category.slug, item)}
                        startContent={<RankMarker rank={item.rank} />}
                        endContent={<Icon icon="chevronRight" size="sm" color="secondary" />}
                      />
                    ))}
                  </List>
                  <Divider />
                  <HStack xstyle={styles.cardFooter}>
                    <Link href={`/c/${category.slug}`}>
                      <Text type="supporting">Compare all three →</Text>
                    </Link>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </Section>

      <Section variant="transparent" padding={0} paddingBlock={6}>
        <VStack gap={4}>
          <SectionHeading
            title="Trending on GitHub today"
            description="Ranked by GitHub, not by us. Open one to see what we can tell you about it."
            action={
              <Text type="supporting">
                {trending.repositories.length} repositories
              </Text>
            }
          />
          <TrendingTable trending={trending} />
        </VStack>
      </Section>

      <Section variant="transparent" padding={0} paddingBlock={6}>
        <VStack gap={4}>
          <SectionHeading
            id="areas"
            title="All 25 areas"
            description="Pick the one your job falls under."
          />
          <HStack gap={2} wrap="wrap">
            {categories.map((category) => (
              <Token
                key={category.slug}
                label={category.name}
                href={category.ready ? `/c/${category.slug}` : undefined}
                isDisabled={!category.ready}
              />
            ))}
          </HStack>
        </VStack>
      </Section>
    </VStack>
  )
}

/** One axis the catalog is organised along: areas, routes, standings.
 *
 * Label and gloss sit in one Text rather than two side by side, because two
 * would be two flex children and the gloss would wrap into a column of its own
 * on a narrow screen instead of flowing under the label. Astryx's Text is
 * inline by default, so a nested one is a span and the whole row wraps as a
 * single paragraph. */
function Dimension({ label, children }: { label: string; children: string }) {
  return (
    <HStack gap={2} vAlign="start">
      <Bullet tone="ink" />
      <Text type="body" color="secondary" textWrap="pretty">
        <Text type="body" weight="semibold">
          {label}
        </Text>
        {' — '}
        {children}
      </Text>
    </HStack>
  )
}

export function SectionHeading({
  id,
  title,
  description,
  action,
}: {
  id?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <HStack hAlign="between" vAlign="end" gap={4} wrap="wrap">
      <VStack gap={1}>
        <Heading level={2} id={id}>
          {title}
        </Heading>
        {description ? (
          <Text type="supporting" textWrap="pretty">
            {description}
          </Text>
        ) : null}
      </VStack>
      {action}
    </HStack>
  )
}

// The trending board is columnar and uniform, so it is a table rather than a
// stack of cards — five facts per row, all of them the same five.
function TrendingTable({ trending }: { trending: TrendingRepositoriesResult }) {
  if (trending.error && trending.repositories.length === 0) {
    return (
      <EmptyState
        title="GitHub Trending is unavailable"
        description="The board is scraped from GitHub; it will be back on the next refresh."
      />
    )
  }

  return (
    <Table<TrendingRepository>
      data={trending.repositories}
      idKey="name"
      density="compact"
      hasHover
      textOverflow="truncate"
      columns={[
        {
          key: 'rank',
          header: '#',
          width: pixel(48),
          align: 'end',
          renderCell: (row) => <RankMarker rank={row.rank} />,
        },
        {
          key: 'name',
          header: 'Repository',
          width: proportional(1.2),
          renderCell: (row) => (
            <Link href={`/t/${row.name}`}>
              <Text type="body" weight="medium">
                {row.name}
              </Text>
            </Link>
          ),
        },
        {
          key: 'description',
          header: 'What it is',
          width: proportional(2),
          renderCell: (row) => (
            <Text type="supporting" maxLines={1}>
              {row.description}
            </Text>
          ),
        },
        {
          key: 'category',
          header: 'Reads as',
          width: pixel(150),
          renderCell: (row) => <Text type="supporting">{row.category}</Text>,
        },
        {
          key: 'language',
          header: 'Language',
          width: pixel(120),
          renderCell: (row) => (
            <Text type="supporting">{row.language ?? '—'}</Text>
          ),
        },
        {
          key: 'starsToday',
          header: 'Stars today',
          width: pixel(120),
          align: 'end',
          renderCell: (row) => (
            <Text type="supporting" hasTabularNumbers>
              {row.starsToday}
            </Text>
          ),
        },
      ]}
    />
  )
}
