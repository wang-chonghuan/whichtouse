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
import { Card } from '@astryxdesign/core/Card'
import { Badge } from '@astryxdesign/core/Badge'
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs'
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

import type { Category, RankItem, Track } from '~/lib/catalog'
import {
  ActionLink,
  Bullet,
  ConfidenceBadge,
  itemHref,
  LimitTone,
  Placeholder,
  RankMarker,
  StandingBadge,
  TRACK_LABEL,
} from './bits'

// One listing. The rule this page exists to keep: numbers order the list, they
// never explain it. Star counts and trending positions render under "Signals",
// labelled as observations. The causal account renders under "Why it ranks
// here" and is authored — when it is missing, the slot says so rather than
// borrowing a metric to fill itself.

const styles = stylex.create({
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
  // Position within its own standing, matching how the area page numbers its
  // lists. The global rank would have this page say "#8 in SaaS" about a row
  // the reader just saw listed as the first challenger.
  const sameStanding = siblings.filter((sibling) => sibling.standing === item.standing)
  const position = Math.max(1, sameStanding.findIndex((sibling) => sibling.id === item.id) + 1)
  const others = siblings.filter((sibling) => sibling.id !== item.id).slice(0, 6)
  const pros = item.pros?.length ? item.pros : item.edge ? [item.edge] : []
  const cons = item.cons?.length ? item.cons : item.con ? [item.con] : []

  return (
    <VStack>
      <Section variant="transparent" padding={0} paddingBlock={6}>
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
              <Badge variant="neutral" label={`#${position} in ${TRACK_LABEL[track]}`} />
              {item.badge ? <Badge variant="blue" label={item.badge} /> : null}
              <ConfidenceBadge confidence={item.confidence} />
            </HStack>
            <Text type="large" color="secondary" textWrap="pretty">
              {item.bestFor}
            </Text>
            {item.homepage ? (
              <HStack gap={2} wrap="wrap">
                <ActionLink href={item.homepage} isExternal>
                  {`Open ${item.name} ↗`}
                </ActionLink>
                <ActionLink href={backTo ?? `/c/${category.slug}`} variant="secondary">
                  {`See all ${TRACK_LABEL[track]}`}
                </ActionLink>
              </HStack>
            ) : null}
          </VStack>
        </VStack>
      </Section>

      <Section variant="transparent" padding={0} paddingBlock={0}>
        <div {...stylex.props(styles.columns)}>
          <VStack gap={8}>
            {/* The one primary callout this page gets, and it carries the same
              * meaning everywhere on the site: a judgement we made, as against
              * a position an aggregate produced. When nobody has written one,
              * the slot says so — it never borrows a metric to fill itself. */}
            {item.rankBasis ? (
              <Card variant="blue" padding={4}>
                <VStack gap={1.5}>
                  <Text type="label" color="accent">
                    Our read
                  </Text>
                  <Heading level={2}>{`Why it ranks #${position}`}</Heading>
                  <Text textWrap="pretty">{item.rankBasis}</Text>
                </VStack>
              </Card>
            ) : (
              <Block title={`Why it ranks #${position}`}>
                <Placeholder>
                  No written reasoning for this entry yet — its position comes
                  from aggregated source rankings alone.
                </Placeholder>
              </Block>
            )}

            {pros.length === 0 && cons.length === 0 ? (
              <Block title="Strengths and limitations">
                <Placeholder>No strengths or limitations recorded yet.</Placeholder>
              </Block>
            ) : (
              <>
                {/* Limits get the only other coloured surface on the page. It is
                  * what the reader came for, and it is the thing every other
                  * directory leaves out. */}
                {cons.length ? (
                  <Card variant="red" padding={4}>
                    <VStack gap={2}>
                      <LimitTone>
                        <Heading level={2} color="inherit">
                          Here is the catch
                        </Heading>
                      </LimitTone>
                      <PointList tone="limit" points={cons} />
                    </VStack>
                  </Card>
                ) : null}
                {pros.length ? (
                  <Block title="Does this well">
                    <PointList tone="ink" points={pros} />
                  </Block>
                ) : null}
              </>
            )}

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
              <Card variant="muted" padding={4}>
                <Block
                  title="Signals"
                  description="Observations, not reasons. These say something resonated; they never say it is good.">
                  <List density="compact" hasDividers>
                    {item.signals.map((signal) => (
                      <ListItem key={signal} label={signal} />
                    ))}
                  </List>
                </Block>
              </Card>
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
            <Card variant="muted" padding={4}>
              <Block title="Quick facts" level={3}>
              <MetadataList label={{ position: 'start', width: 110 }}>
                <MetadataListItem label="Route">{TRACK_LABEL[track]}</MetadataListItem>
                <MetadataListItem label="Standing">
                  {item.standing} · #{position}
                </MetadataListItem>
                {item.kind ? (
                  <MetadataListItem label="Kind">{item.kind}</MetadataListItem>
                ) : null}
                {item.pricing ? (
                  <MetadataListItem label="Pricing">{item.pricing}</MetadataListItem>
                ) : null}
                {item.evidence?.score !== undefined ? (
                  <MetadataListItem label="Fusion score">
                    {item.evidence.score.toFixed(2)}
                  </MetadataListItem>
                ) : null}
              </MetadataList>
              </Block>
            </Card>

            {others.length ? (
              <VStack gap={3}>
                <Divider />
                <VStack gap={1}>
                  <Heading level={3}>More in this area</Heading>
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

function PointList({ tone, points }: { tone: 'ink' | 'limit'; points: string[] }) {
  return (
    <VStack gap={2}>
      {points.map((point) => (
        <HStack key={point} gap={2} vAlign="start">
          <Bullet tone={tone} />
          <Text type="body" textWrap="pretty">
            {point}
          </Text>
        </HStack>
      ))}
    </VStack>
  )
}
