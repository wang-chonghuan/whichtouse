import { useEffect, useState, type ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { AppShell } from '@astryxdesign/core/AppShell'
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Kbd } from '@astryxdesign/core/Kbd'
import { Home, ListOrdered } from 'lucide-react'

import type { Category, CatalogSearchEntry } from '~/lib/catalog'
import { SearchPalette } from './search-palette'
import { Wordmark } from './bits'

// The frame. Every page renders inside it, so it is decided once here and the
// page views below never touch chrome.
//
// Responsive contract:
//   > 1024px  side nav 260 (collapsible) | content
//  <= 1024px  side nav becomes AppShell's mobile drawer, opened from the
//             hamburger AppShell puts in the top nav
//
// height="fill": the task list is 25 entries and outlives any one page, so the
// nav column keeps its own scroll position while the content scrolls.

const styles = stylex.create({
  // Everything lives on the left: mark, wordmark, Tasks, search. Nothing sits
  // on the right — this is a reading product, not an app with account chrome,
  // and an empty right edge is quieter than one invented to fill it.
  search: {
    minWidth: 200,
  },
  // Two renderings of one control rather than one that adapts: the wide form
  // is a labelled field, the narrow form is an icon. At 390px the labelled
  // form plus the logo left no room for AppShell's own nav toggle, which then
  // sat off the edge of the bar.
  //
  // These go on plain elements we own, not on an Astryx component's xstyle.
  // Astryx ships its atomic CSS with a `:not(#\#)` specificity boost, so a
  // property the component already sets — display, on any Stack — cannot be
  // overridden from a consumer stylesheet. Overriding our own <div> has no
  // such contest. Where a component owns the property, use its prop instead.
  wide: {
    display: {default: 'flex', '@media (max-width: 720px)': 'none'},
  },
  narrow: {
    display: {default: 'none', '@media (max-width: 720px)': 'flex'},
  },
  // The header is white now, so the mark's own white tile has nothing to sit
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
})

/** The element AppShell actually scrolls.
 *
 * height="fill" puts the scrollbar on an inner container rather than on the
 * document, so `window.scrollY` is permanently 0 and the router's
 * scrollRestoration — which manages window scroll — has nothing to reset.
 * Without this, opening a listing from halfway down a task page landed halfway
 * down the listing.
 *
 * Queried by Astryx's own component class, which its styling docs name as the
 * supported selector surface. Written defensively anyway: if the class ever
 * moves, navigation still works and only the scroll reset is lost. */
function scrollContentToTop() {
  document.querySelector('.astryx-layout-content')?.scrollTo({ top: 0 })
  // Belt and braces for any layout where the document is the scroller after
  // all — a no-op in the current shell.
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

  // Every navigation starts at the top. This resets on back/forward too: the
  // inner container was never restored in the first place, so nothing is lost —
  // but per-page restoration would have to save and replay the container's
  // offset itself, which is a feature rather than a fix.
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
      height="fill"
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
              <TopNavItem label="Tasks" href="/#tasks" isSelected={false} />
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
                  label="Search tasks and tools"
                  onClick={() => setSearchOpen(true)}
                />
              </div>
            </>
          }
        />
      }
      sideNav={
        <SideNav collapsible>
          <SideNavSection title="Browse" isHeaderHidden>
            <SideNavItem label="Home" icon={Home} href="/" isSelected={isHome} />
          </SideNavSection>
          <SideNavSection
            title="Tasks"
            subtitle={`${categories.length} tasks, three routes each`}>
            {categories.map((category) => (
              <SideNavItem
                key={category.slug}
                label={category.name}
                icon={ListOrdered}
                href={`/c/${category.slug}`}
                isSelected={category.slug === activeSlug}
                // A task with nothing ranked in it yet is still part of the
                // map — hiding it would misrepresent the scope — but it is
                // not somewhere to send a reader.
                isDisabled={!category.ready}
              />
            ))}
          </SideNavSection>
        </SideNav>
      }>
      {children}
      <SearchPalette
        entries={searchEntries}
        isOpen={isSearchOpen}
        onOpenChange={setSearchOpen}
      />
    </AppShell>
  )
}
