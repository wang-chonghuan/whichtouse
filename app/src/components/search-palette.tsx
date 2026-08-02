import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CommandPalette } from '@astryxdesign/core/CommandPalette'
import { createStaticSource } from '@astryxdesign/core/Typeahead'
import type { SearchableItem } from '@astryxdesign/core/Typeahead'
import { HStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import type { CatalogSearchEntry } from '~/lib/catalog'

// The catalog is 25 tasks and every listing inside them. That is too many
// destinations for the sidebar alone, and it is the only navigation that
// crosses tasks — you know the tool's name, not which task we filed it under.

type Entry = SearchableItem<{ group?: string; context: string }>

/** The item id doubles as the destination, so selection is one lookup-free
 * navigate() rather than a second map from id back to href. */
function toEntry(entry: CatalogSearchEntry): Entry {
  const href =
    entry.kind === 'category'
      ? `/c/${entry.categorySlug}`
      : `/c/${entry.categorySlug}/${entry.itemId}`
  return {
    id: href,
    label: entry.label,
    auxiliaryData: {
      group: entry.kind === 'category' ? 'Tasks' : 'Tools',
      context: entry.kind === 'category' ? 'Task' : entry.categoryName,
    },
  }
}

export function SearchPalette({
  entries,
  isOpen,
  onOpenChange,
}: {
  entries: CatalogSearchEntry[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const source = useMemo(() => createStaticSource(entries.map(toEntry)), [entries])
  const navigate = useNavigate()

  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={source}
      label="Search tasks and tools"
      emptyBootstrapText="Search a task, or a tool by name."
      emptySearchText="Nothing in the catalog matches that."
      onValueChange={(href) => {
        onOpenChange(false)
        void navigate({ to: href as never })
      }}
      renderItem={(item: Entry) => (
        <HStack gap={3} vAlign="center" hAlign="between" width="100%">
          <Text type="body">{item.label}</Text>
          <Text type="supporting">{item.auxiliaryData?.context}</Text>
        </HStack>
      )}
    />
  )
}
