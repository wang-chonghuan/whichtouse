import { useEffect, useState, type ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex'
import { AppShell } from '@astryxdesign/core/AppShell'
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Kbd } from '@astryxdesign/core/Kbd'
import { Home, ListOrdered } from 'lucide-react'

import type { Category, CatalogSearchEntry } from '~/lib/catalog'
import { SearchPalette } from './search-palette'

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
  // The search control is the only thing in the end slot, and it should read
  // as a search field rather than a toolbar button.
  search: {
    minWidth: 220,
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
  // The mark ships on its own near-white field, so it needs a rounded edge and
  // a hairline to read as a logo tile rather than as a white hole punched in
  // the nav bar.
  logo: {
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
  },
})

export function AppFrame({
  categories,
  searchEntries,
  activeSlug,
  isHome,
  children,
}: {
  categories: Category[]
  searchEntries: CatalogSearchEntry[]
  activeSlug: string | null
  isHome: boolean
  children: ReactNode
}) {
  const [isSearchOpen, setSearchOpen] = useState(false)

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
            <TopNavHeading
              heading="WhichToUse"
              headingHref="/"
              logo={
                <img
                  src="/logo-mark-64.png"
                  srcSet="/logo-mark-64.png 1x, /logo-mark-96.png 1.5x"
                  alt=""
                  width={28}
                  height={28}
                  {...stylex.props(styles.logo)}
                />
              }
            />
          }
          endContent={
            <>
              <div {...stylex.props(styles.wide)}>
                <Button
                  variant="secondary"
                  icon={<Icon icon="search" size="sm" />}
                  label="Search tasks and tools"
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
