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
import { ActionLink, itemHref, RankMarker } from './bits'

// Home, in three moves: say what the site decides for you, show the shortlists
// it has, and show what the internet is excited about today — clearly
// separated, because the last one is aggregation and the first two are not.
//
// Vocabulary is fixed across every view and must not drift: the 25 are *tasks*;
// the three are *SaaS*, *open source* and *skills*, collectively *routes*;
// within a route the two standings are *leading* and *emerging*. Earlier drafts
// also called these "jobs" and "forms", which read as four concepts instead of
// two.

const styles = stylex.create({
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
      <Section variant="transparent" padding={0} paddingBlock={8}>
        {/* The hero is this page's one primary callout. Site-wide that surface
          * means the same thing — a judgement we made — and on the home page
          * the judgement is the product's whole claim. */}
        <Card variant="blue" padding={6}>
        <VStack gap={5} xstyle={styles.heroText}>
          {/* Name the three routes rather than calling them "three forms":
            * SaaS, open source and skills are what a reader already has words
            * for, and an abstraction they have to decode is a sentence they do
            * not read. "Limits first" is the promise the rest of the site keeps
            * — it belongs in the headline, not in a paragraph below it.
            *
            * No `type="display-*"`: Astryx scopes the display treatment to the
            * Text component, so on a Heading the prop does nothing — measured
            * identical with it and without. Size belongs to the theme's type
            * scale, not to a prop here. */}
          <VStack gap={3}>
            <Heading level={1} textWrap="balance">
              Find the best AI tool for your task — limits first.
            </Heading>
            <Text type="large" color="secondary" textWrap="pretty">
              SaaS, open source and agent skills, side by side. Leading and
              emerging picks in each.
            </Text>
          </VStack>
          <HStack gap={6} wrap="wrap">
            <Stat value={String(ready.length)} label="tasks" />
            <Stat value="3" label="routes per task" />
            <Stat value="Limits" label="checked by hand" />
          </HStack>
          <HStack gap={2} wrap="wrap">
            <ActionLink href="/c/coding">Browse all tasks</ActionLink>
          </HStack>
        </VStack>
        </Card>
      </Section>

      <Section variant="transparent" padding={0} paddingBlock={6}>
        <VStack gap={4}>
          <SectionHeading
            title="Start with a task"
            description="The tasks with the most depth behind them right now."
          />
          {/* 220, not 260: with the task rail inside the container the content
              column is ~990px at 1440, where a 260 minimum fits only three of
              the four featured tasks and strands the fourth alone on a second
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
            id="tasks"
            title="Every task"
            description="Twenty-five tasks people actually search for."
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <HStack gap={1.5} vAlign="center">
      <Text type="body" weight="semibold">
        {value}
      </Text>
      <Text type="supporting">{label}</Text>
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
