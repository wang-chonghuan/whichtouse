import { useEffect, useState, type ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav } from '@astryxdesign/core/TopNav'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { List, ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'

import type { Category, CatalogSearchEntry } from '~/lib/catalog'
import { SearchPalette } from './search-palette'
import { Wordmark } from './bits'
import { AreaIcon, FAMILIES, familyOf, HomeIcon } from './area-icons'

// The frame. Every page renders inside it, so it is decided once here and the
// page views never touch chrome.
//
// The task list is a column *inside* the page container, not a shell rail
// pinned to the viewport edge. A flush-left rail reads as an application — a
// console you work in — and this is a site you read. Keeping the nav on the
// same measure as the content also stops the content fighting a fixed 260px
// off its left edge on a narrow laptop.
//
// Responsive contract:
//   > 1024px  task column 248 | content, nav sticky under the bar
//  <= 1024px  one column, no task rail. Twenty-five rows stacked above every
//             page would bury the content, and laying them into a horizontal
//             strip is not available: List owns its own display and Astryx's
//             CSS outranks ours. Navigation moves to the bar instead — "Tasks"
//             goes to the full list, and search is a tap or ⌘K away.

const CONTAINER = 1320
const NAV_WIDTH = 248

const styles = stylex.create({
  // Everything on the left of the bar: wordmark, Browse, search. Nothing on the
  // right — this is a reading product, not an app with account chrome, and an
  // empty right edge is quieter than one invented to fill it.
  search: {
    minWidth: 200,
  },
  wide: {
    display: {default: 'flex', '@media (max-width: 720px)': 'none'},
  },
  narrow: {
    display: {default: 'none', '@media (max-width: 720px)': 'flex'},
  },
  // TopNavHeading takes `heading` as a string, so the drawn wordmark cannot go
  // through it. The heading slot is a ReactNode, so the link is composed here.
  //
  // The mark tile that used to sit to its left is gone. It was the geometric
  // three-colour WTU, and next to a hand-drawn neon script the two read as two
  // logos rather than one lockup — the wordmark says the name on its own, and
  // it is now large enough not to need a tile propping it up. The mark is still
  // the favicon and every app icon, which is where a square mark belongs.
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  },

  page: {
    maxWidth: CONTAINER,
    marginInline: 'auto',
    width: '100%',
    // One value at every width, because the top bar has to match it and a
    // theme-level component override cannot carry a media query.
    paddingInline: spacingVars['--spacing-6'],
    paddingBlock: spacingVars['--spacing-6'],
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: {
      default: `${NAV_WIDTH}px minmax(0, 1fr)`,
      '@media (max-width: 1024px)': 'minmax(0, 1fr)',
    },
    gap: spacingVars['--spacing-8'],
    alignItems: 'start',
  },
  // Sticky rather than fixed: it travels with the page until it meets the bar,
  // which keeps it tied to the container instead of to the viewport.
  //
  // On a white page the task list is the one standing tinted surface. It earns
  // it: twenty-five rows that persist across every page are a different kind of
  // thing from the content beside them, and the tone says so without spending a
  // colour. Same recessed tone as Signals and Quick facts — demoted, not
  // decorated.
  nav: {
    display: {default: 'block', '@media (max-width: 1024px)': 'none'},
    position: 'sticky',
    // Clear of the bar, not of the viewport. The header is sticky too, so a
    // plain `top: 24px` parked the rail's first 28px underneath it — "Home"
    // was half-eaten on every scrolled page, and a taller bar makes it worse.
    // AppShell measures its own header into --appshell-header-height in auto
    // mode; reading it here means this offset follows the bar instead of
    // needing a second edit whenever its height changes.
    top: `calc(var(--appshell-header-height, 0px) + ${spacingVars['--spacing-6']})`,
    minWidth: 0,
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: 12,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-2'],
  },
  // Its own scroller, so a long task list never pushes the sticky column past
  // the viewport and strands the last few tasks below the fold.
  // The default scrollbar is painted by the OS and lands almost black on this
  // pale rail — the heaviest thing in the column, next to the lightest content.
  // scrollbarColor/-width are standard CSS now, so the thumb can come from a
  // token like everything else and the track can disappear entirely.
  //
  // `track`, not `border-emphasized`. Two reasons, and the first is what makes
  // it the right token rather than merely a lighter one: Astryx names this
  // colour for exactly this job, the groove a control slides in, so a scrollbar
  // asking for it is asking by meaning instead of borrowing a value that
  // happens to look right. The second is weight — #D6DFDD against the rail's
  // #ECEDE4 measures 1.15:1 where border-emphasized measured 1.32:1, so the
  // thumb reads as a soft shadow in the groove rather than a bar drawn over the
  // list. `--color-border` was the other candidate and lands at 1.09, which is
  // low enough that the affordance disappears.
  navScroll: {
    // Was a flat 180px, of which 52 was the bar as it stood. Splitting the bar
    // back out keeps the rail's own breathing room at the 128px it was tuned
    // to and lets the header's real height do the rest.
    maxHeight: 'calc(100dvh - var(--appshell-header-height, 0px) - 128px)',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${colorVars['--color-track']} transparent`,
  },
  // A group's caption, and the rule under it. The rule is a border on the
  // caption rather than a Divider between the lists because it belongs to the
  // heading — it is what makes the caption read as a break in the column
  // instead of a stray line of grey text — and because a separate Divider
  // would be a second element for a screen reader to walk past on its way into
  // the list the caption already names.
  //
  // Top margin, not bottom padding on the list above it: the gap belongs to
  // the group that is starting, so the first group can suppress it and sit
  // straight under Home.
  //
  // The rule is an inset box-shadow, not a border, and that is not a
  // preference. Astryx's reset zeroes border-width on everything and its
  // `@layer reset` is declared after our StyleX layers, so layer order beats
  // specificity and a border set from here silently computes to 0px — measured,
  // not assumed. `ActionLink` in bits.tsx already draws its outline this way
  // for the same reason. box-shadow has no reset rule to lose to.
  //
  // `border-emphasized`, not `border`: the plain line token is #DDE5E3 and the
  // rail is #ECEDE4, which is 1.09:1 — a hairline at that contrast is not a
  // faint rule, it is an absent one. This is the same token the scrollbar was
  // moved *off* for being heavy, and both are right: a 1px line needs more
  // contrast than a solid bar to read as the same weight.
  groupHeading: {
    marginTop: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-3'],
    paddingBottom: spacingVars['--spacing-1'],
    boxShadow: `inset 0 -1px 0 ${colorVars['--color-border-emphasized']}`,
  },
})

/** The rail, cut into the five families and in their order.
 *
 * Within a group the areas keep the order they arrive in, which is the order
 * the content decides — grouping is allowed to move a row into its family, not
 * to re-rank it inside one.
 *
 * An area with no family lands in a trailing group with no caption. Areas live
 * in the database and the icon table is code, so a new one can exist before
 * anyone has filed it; dropping it would quietly shrink the site's own map of
 * itself, which is worse than an uncaptioned row at the bottom. */
function groupByFamily(categories: Category[]) {
  const groups = FAMILIES.map((family) => ({
    key: family.key as string,
    label: family.label,
    items: categories.filter((category) => familyOf(category.slug) === family.key),
  })).filter((group) => group.items.length > 0)

  const unfiled = categories.filter((category) => familyOf(category.slug) === null)
  return unfiled.length > 0
    ? [...groups, { key: 'unfiled', label: '', items: unfiled }]
    : groups
}

/** Reset the scroll position on navigation.
 *
 * The shell is height="auto", so the document is the scroller and
 * window.scrollTo is the call that does the work here. The container query
 * stays because height="fill" puts the scrollbar on an inner element instead,
 * and this keeps working if that is ever switched back. */
function scrollContentToTop() {
  document.querySelector('.astryx-layout-content')?.scrollTo({ top: 0 })
  window.scrollTo({ top: 0 })
}

export function AppFrame({
  categories,
  searchEntries,
  activeSlug,
  isHome,
  pathname,
  children,
}: {
  categories: Category[]
  searchEntries: CatalogSearchEntry[]
  activeSlug: string | null
  isHome: boolean
  pathname: string
  children: ReactNode
}) {
  const [isSearchOpen, setSearchOpen] = useState(false)
  const groups = groupByFamily(categories)

  useEffect(() => {
    scrollContentToTop()
  }, [pathname])

  // ⌘K / Ctrl-K, matching the hint rendered in the search control.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AppShell
      height="auto"
      // wash, not the default `elevated`: elevated paints the content region
      // white, and with the nav now inside that region the whole page went one
      // flat tone. On the wash the canvas shows through and cards read as
      // raised again — which is what the callouts and route cards depend on.
      //
      // Not `section` either, though it is the variant that owns a divider
      // between nav and content. Its rule goes on the inner LayoutHeader, which
      // sits inside the header's own inline padding, so it stopped 16px short
      // of both window edges while the bar's white ran past it — an inset line
      // under a full-bleed surface reads as a mistake. The rule is on
      // `app-shell-header` in the theme instead, which is the element that
      // spans the window.
      variant="wash"
      contentPadding={0}
      topNav={
        <TopNav
          label="Main navigation"
          heading={
            <a href="/" aria-label="WhichToUse — home" {...stylex.props(styles.brand)}>
              <Wordmark />
            </a>
          }
          startContent={
            <>
              {/* No "Browse" item. It pointed at Home, which the wordmark to its
                * left already does, and browsing is what the rail beside this
                * does on every page — a nav item that duplicates two things
                * next to it is a third place to look, not a way in. */}
              <div {...stylex.props(styles.wide)}>
                {/* No ⌘K hint on the button. The binding still works — see the
                  * keydown handler above — it is just not advertised here. */}
                <Button
                  variant="ghost"
                  icon={<Icon icon="search" size="sm" />}
                  label="Search"
                  width="auto"
                  xstyle={styles.search}
                  onClick={() => setSearchOpen(true)}
                />
              </div>
              <div {...stylex.props(styles.narrow)}>
                <Button
                  variant="ghost"
                  icon={<Icon icon="search" size="sm" />}
                  isIconOnly
                  label="Search areas and tools"
                  onClick={() => setSearchOpen(true)}
                />
              </div>
            </>
          }
        />
      }>
      <div {...stylex.props(styles.page)}>
        <div {...stylex.props(styles.columns)}>
          <nav aria-label="Areas of work" {...stylex.props(styles.nav)}>
            <div {...stylex.props(styles.navScroll)}>
              {/* Home stands outside the groups: it is not an area, and giving
                * it a heading of its own would imply it were one. */}
              <List density="compact">
                <ListItem
                  label="Home"
                  href="/"
                  isSelected={isHome}
                  startContent={<HomeIcon />}
                />
              </List>
              {/* One labelled List per family rather than one List with
                * headings dropped between the rows. `header` is List's own
                * slot and wires the heading to the list with aria-labelledby,
                * so the grouping a sighted reader sees as a rule and a caption
                * is the same grouping a screen reader announces. Headings
                * faked with sibling divs would leave twenty-five items in one
                * flat list to anything that is not looking at it. */}
              {groups.map((group) => (
                <List
                  key={group.key}
                  density="compact"
                  header={
                    group.label ? (
                      <div {...stylex.props(styles.groupHeading)}>
                        <Text type="supporting">{group.label}</Text>
                      </div>
                    ) : undefined
                  }>
                  {group.items.map((category) => (
                    <ListItem
                      key={category.slug}
                      label={category.name}
                      href={`/c/${category.slug}`}
                      isSelected={category.slug === activeSlug}
                      // Twenty-five rows of same-weight text give a reader
                      // nothing to aim at. The glyph is the aiming point and
                      // its colour is the group it belongs to — see
                      // area-icons.tsx, which also carries why this is allowed
                      // to put colour in a surface the palette calls demoted.
                      startContent={<AreaIcon slug={category.slug} />}
                      // A task with nothing ranked in it yet is still part of
                      // the map — hiding it would misrepresent the scope — but
                      // it is not somewhere to send a reader.
                      isDisabled={!category.ready}
                    />
                  ))}
                </List>
              ))}
            </div>
          </nav>
          <div>{children}</div>
        </div>
      </div>
      <SearchPalette
        entries={searchEntries}
        isOpen={isSearchOpen}
        onOpenChange={setSearchOpen}
      />
    </AppShell>
  )
}
