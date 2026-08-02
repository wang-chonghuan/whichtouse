import { useEffect, useState, type ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Kbd } from '@astryxdesign/core/Kbd'
import { List, ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'

import type { Category, CatalogSearchEntry } from '~/lib/catalog'
import { SearchPalette } from './search-palette'
import { Wordmark } from './bits'

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
  // Everything on the left of the bar: mark, wordmark, Tasks, search. Nothing
  // on the right — this is a reading product, not an app with account chrome,
  // and an empty right edge is quieter than one invented to fill it.
  search: {
    minWidth: 200,
  },
  wide: {
    display: {default: 'flex', '@media (max-width: 720px)': 'none'},
  },
  narrow: {
    display: {default: 'none', '@media (max-width: 720px)': 'flex'},
  },
  // The header is white, so the mark's own white tile has nothing to sit
  // against — the border is what keeps it from dissolving into the bar.
  logo: {
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
  },
  // TopNavHeading takes `heading` as a string, so the tricoloured wordmark
  // cannot go through it. The heading slot itself is a ReactNode, so the mark
  // and the word are composed here instead.
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
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
    top: spacingVars['--spacing-6'],
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
  navScroll: {
    maxHeight: 'calc(100dvh - 180px)',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${colorVars['--color-border-emphasized']} transparent`,
  },
  navHeading: {
    paddingInline: spacingVars['--spacing-3'],
    paddingBottom: spacingVars['--spacing-2'],
  },
})

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
      variant="wash"
      contentPadding={0}
      topNav={
        <TopNav
          label="Main navigation"
          heading={
            <a href="/" aria-label="WhichToUse — home" {...stylex.props(styles.brand)}>
              <img
                src="/logo-mark-64.png"
                srcSet="/logo-mark-64.png 1x, /logo-mark-96.png 1.5x"
                alt=""
                width={28}
                height={28}
                {...stylex.props(styles.logo)}
              />
              <Wordmark />
            </a>
          }
          startContent={
            <>
              <TopNavItem label="Browse" href="/#areas" isSelected={false} />
              <div {...stylex.props(styles.wide)}>
                <Button
                  variant="ghost"
                  icon={<Icon icon="search" size="sm" />}
                  label="Search"
                  width="auto"
                  xstyle={styles.search}
                  endContent={<Kbd keys="mod+k" />}
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
            <div {...stylex.props(styles.navHeading)}>
              <Text type="label">What are you working on?</Text>
              <Text type="supporting" display="block">
                {categories.length} areas, three routes each
              </Text>
            </div>
            <div {...stylex.props(styles.navScroll)}>
              <List density="compact">
                <ListItem label="Home" href="/" isSelected={isHome} />
                {categories.map((category) => (
                  <ListItem
                    key={category.slug}
                    label={category.name}
                    href={`/c/${category.slug}`}
                    isSelected={category.slug === activeSlug}
                    // A task with nothing ranked in it yet is still part of the
                    // map — hiding it would misrepresent the scope — but it is
                    // not somewhere to send a reader.
                    isDisabled={!category.ready}
                  />
                ))}
              </List>
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
