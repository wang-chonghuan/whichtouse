export const OPEN_CATALOG_SEARCH_EVENT = 'whichtouse:open-catalog-search'

export function openCatalogSearch(): void {
  window.dispatchEvent(new Event(OPEN_CATALOG_SEARCH_EVENT))
}
