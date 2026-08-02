import * as stylex from '@stylexjs/stylex'
import { Section } from '@astryxdesign/core/Section'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'
import { List, ListItem } from '@astryxdesign/core/List'
import { Divider } from '@astryxdesign/core/Divider'
import { Token } from '@astryxdesign/core/Token'
import { Icon } from '@astryxdesign/core/Icon'
import { Badge } from '@astryxdesign/core/Badge'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs'
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

import type { Category, RankItem, Track } from '~/lib/catalog'
import {
  ConfidenceBadge,
  itemHref,
  Placeholder,
  RankMarker,
  ReviewMark,
  StandingBadge,
  TRACK_LABEL,
} from './bits'

// One listing. The rule this page exists to keep: numbers order the list, they
// never explain it. Star counts and trending positions render under "Signals",
// labelled as observations. The causal account renders under "Why it ranks
// here" and is authored — when it is missing, the slot says so rather than
// borrowing a metric to fill itself.

const styles = stylex.create({
  page: {
    maxWidth: 1200,
    marginInline: 'auto',
    width: '100%',
  },
  // Asymmetric two-column: the aside is a fixed reference rail, not a second
  // reading column, so it gets a pixel budget and the prose gets the rest.
  columns: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) 320px',
      '@media (max-width: 960px)': 'minmax(0, 1fr)',
    },
    gap: spacingVars['--spacing-8'],
    alignItems: 'start',
  },
  rail: {
    position: {default: 'sticky', '@media (max-width: 960px)': 'static'},
    top: spacingVars['--spacing-6'],
  },
  bullet: {
    marginTop: 6,
    flexShrink: 0,
  },
})

export function ProductPage({
  item,
  category,
  siblings,
  track,
  backTo,
}: {
  item: RankItem
  category: Category
  siblings: RankItem[]
  track: Track
  backTo?: string
}) {
  const others = siblings.filter((sibling) => sibling.id !== item.id).slice(0, 6)
  const pros = item.pros?.length ? item.pros : item.edge ? [item.edge] : []
  const cons = item.cons?.length ? item.cons : item.con ? [item.con] : []

  return (
    <VStack xstyle={styles.page}>
      <Section variant="transparent" padding={6}>
        <VStack gap={4}>
          <Breadcrumbs variant="supporting">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href={backTo ?? `/c/${category.slug}`}>
              {category.name}
            </BreadcrumbItem>
            <BreadcrumbItem isCurrent>{item.name}</BreadcrumbItem>
          </Breadcrumbs>

          <VStack gap={3}>
            <Heading level={1}>{item.name}</Heading>
            <HStack gap={2} wrap="wrap" vAlign="center">
              <StandingBadge standing={item.standing} />
              <Badge variant="neutral" label={`#${item.rank} in ${TRACK_LABEL[track]}`} />
              {item.badge ? <Badge variant="blue" label={item.badge} /> : null}
              <ConfidenceBadge confidence={item.confidence} />
              <ReviewMark reviewed={item.reviewed} />
            </HStack>
            <Text type="large" color="secondary" textWrap="pretty">
              {item.bestFor}
            </Text>
            {item.homepage ? (
              <HStack>
                <Link href={item.homepage} isExternalLink isStandalone>
                  Open {item.name}
                </Link>
              </HStack>
            ) : null}
          </VStack>
        </VStack>
      </Section>

      <Section variant="transparent" padding={6} paddingBlock={0}>
        <div {...stylex.props(styles.columns)}>
          <VStack gap={8}>
            <Block title={`Why it ranks #${item.rank}`}>
              {item.rankBasis ? (
                <Text textWrap="pretty">{item.rankBasis}</Text>
              ) : (
                <Placeholder>
                  No one has written the reasoning for this entry yet. Its position
                  comes from aggregated source rankings alone.
                </Placeholder>
              )}
            </Block>

            <Block title="Strengths and limitations">
              {pros.length === 0 && cons.length === 0 ? (
                <Placeholder>
                  Nobody has recorded what this does well or badly yet.
                </Placeholder>
              ) : (
                <HStack gap={8} wrap="wrap" vAlign="start">
                  <PointList
                    heading="Does this well"
                    variant="success"
                    points={pros}
                  />
                  <PointList
                    heading="Here is the catch"
                    variant="error"
                    points={cons}
                  />
                </HStack>
              )}
            </Block>

            <Block title="Pricing">
              {item.pricingFree || item.pricingPaid || item.pricing ? (
                <VStack gap={3}>
                  <MetadataList label={{ position: 'start', width: 130 }}>
                    {item.pricing ? (
                      <MetadataListItem label="Model">{item.pricing}</MetadataListItem>
                    ) : null}
                    {item.pricingFree ? (
                      <MetadataListItem label="Free plan">
                        {item.pricingFree}
                      </MetadataListItem>
                    ) : null}
                    {item.pricingPaid ? (
                      <MetadataListItem label="Entry paid">
                        {item.pricingPaid}
                      </MetadataListItem>
                    ) : null}
                  </MetadataList>
                  {/* Priced separately from everything else because pricing
                    * rots fastest, and a stale price read as current is worse
                    * than no price. */}
                  <Text type="supporting">
                    {item.pricingCheckedAt
                      ? `Checked by hand on ${item.pricingCheckedAt}. Prices in this category change often — if this looks wrong, it probably is.`
                      : 'Not price-checked by hand. Confirm on the vendor’s own page before you budget.'}
                  </Text>
                </VStack>
              ) : (
                <Placeholder>No pricing has been recorded for this entry.</Placeholder>
              )}
            </Block>

            {item.features?.length ? (
              <Block title="Key features">
                <HStack gap={2} wrap="wrap">
                  {item.features.map((feature) => (
                    <Token key={feature} label={feature} color="gray" />
                  ))}
                </HStack>
              </Block>
            ) : null}

            {item.signals?.length ? (
              <Block
                title="Signals"
                description="Observations, not reasons. These say something resonated; they never say it is good.">
                <List density="compact" hasDividers>
                  {item.signals.map((signal) => (
                    <ListItem key={signal} label={signal} />
                  ))}
                </List>
              </Block>
            ) : null}

            {item.evidence?.sources?.length ? (
              <Block
                title="What the ranking used"
                description="The aggregate inputs behind this position, as they were read.">
                <List density="compact" hasDividers>
                  {item.evidence.sources.map((source) => (
                    <ListItem
                      key={`${source.site}-${source.rank}`}
                      label={source.site}
                      href={source.url}
                      target={source.url ? '_blank' : undefined}
                      startContent={<RankMarker rank={source.rank} />}
                      endContent={
                        source.url ? (
                          <Icon icon="externalLink" size="sm" color="secondary" />
                        ) : null
                      }
                    />
                  ))}
                </List>
              </Block>
            ) : null}

            {item.sources.length ? (
              <Block title="Sources we read">
                <List density="compact" hasDividers>
                  {item.sources.map((source) => (
                    <ListItem
                      key={source.url}
                      label={source.name}
                      href={source.url}
                      target="_blank"
                      endContent={
                        <Icon icon="externalLink" size="sm" color="secondary" />
                      }
                    />
                  ))}
                </List>
              </Block>
            ) : null}
          </VStack>

          <VStack gap={6} xstyle={styles.rail}>
            <Block title="Quick facts" level={3}>
              <MetadataList label={{ position: 'start', width: 110 }}>
                <MetadataListItem label="Route">{TRACK_LABEL[track]}</MetadataListItem>
                <MetadataListItem label="Standing">
                  {item.standing} · #{item.rank}
                </MetadataListItem>
                {item.kind ? (
                  <MetadataListItem label="Kind">{item.kind}</MetadataListItem>
                ) : null}
                {item.pricing ? (
                  <MetadataListItem label="Pricing">{item.pricing}</MetadataListItem>
                ) : null}
                <MetadataListItem label="Reviewed">
                  {item.reviewed ? 'By hand' : 'Not yet'}
                </MetadataListItem>
                {item.evidence?.score !== undefined ? (
                  <MetadataListItem label="Fusion score">
                    {item.evidence.score.toFixed(2)}
                  </MetadataListItem>
                ) : null}
              </MetadataList>
            </Block>

            {others.length ? (
              <VStack gap={3}>
                <Divider />
                <VStack gap={1}>
                  <Heading level={3}>Same task, same route</Heading>
                  <Text type="supporting">
                    The rest of the {TRACK_LABEL[track]} column.
                  </Text>
                </VStack>
                <List density="compact" hasDividers>
                  {others.map((sibling) => (
                    <ListItem
                      key={sibling.id}
                      label={sibling.name}
                      href={itemHref(category.slug, sibling)}
                      startContent={<RankMarker rank={sibling.rank} />}
                      description={
                        <Text type="supporting" maxLines={1}>
                          {sibling.bestFor}
                        </Text>
                      }
                    />
                  ))}
                </List>
              </VStack>
            ) : null}
          </VStack>
        </div>
      </Section>
    </VStack>
  )
}

function Block({
  title,
  description,
  level = 2,
  children,
}: {
  title: string
  description?: string
  level?: 2 | 3
  children: React.ReactNode
}) {
  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <Heading level={level}>{title}</Heading>
        {description ? <Text type="supporting">{description}</Text> : null}
      </VStack>
      {children}
    </VStack>
  )
}

function PointList({
  heading,
  variant,
  points,
}: {
  heading: string
  variant: 'success' | 'error'
  points: string[]
}) {
  if (points.length === 0) return null

  return (
    <VStack gap={2}>
      <Text type="label">{heading}</Text>
      <VStack gap={2}>
        {points.map((point) => (
          <HStack key={point} gap={2} vAlign="start">
            <StatusDot variant={variant} label={heading} xstyle={styles.bullet} />
            <Text type="body" textWrap="pretty">
              {point}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  )
}
