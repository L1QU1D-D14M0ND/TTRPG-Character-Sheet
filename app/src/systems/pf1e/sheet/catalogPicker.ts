/**
 * Search and the dialog for the PF1e catalog picker (ADR 0009).
 *
 * Listing, resolving, and stamping a host live in the catalog index.
 * This module keeps the search cap and re-exports the index for the picker.
 */

import {
  groups,
  type CatalogGroup,
  type CatalogKind,
  type CatalogOption,
} from '../content/catalogIndex'

export type {
  CatalogGroup,
  CatalogHostMap,
  CatalogKind,
  CatalogOption,
  HostFor,
  MechanicsFor,
  MechanicsMap,
} from '../content/catalogIndex'
export {
  catalogId,
  catalogName,
  setCatalogName,
  stamp,
} from '../content/catalogIndex'

/** Search field appears only when a kind has more rows than this. */
export const SEARCH_ROW_THRESHOLD = 12

/**
 * Rows rendered at once. The spell kind alone is 649 rows, and rendering all
 * of them builds ~650 buttons on every open and on every keystroke, which is
 * both a visible hitch and a list no player can scroll usefully. Narrowing by
 * name is the only practical way to find a row in a list that long, so the
 * list shows a first page and tells the player how many rows it is holding
 * back rather than silently truncating.
 */
export const VISIBLE_ROW_LIMIT = 60

export function matchesName(name: string, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return name.toLowerCase().includes(needle)
}

export interface VisibleCatalog {
  groups: CatalogGroup[]
  /** Rows that matched but are not rendered. 0 when everything matching fits. */
  hidden: number
  /** True when nothing matched the query at all. */
  empty: boolean
}

/**
 * Filter by name, then keep at most `limit` rows across all groups in order.
 * The currently selected row is always kept, so a picked row never disappears
 * from its own list just because it sorts past the cap.
 */
export function visibleCatalog(
  source: CatalogGroup[],
  query: string,
  selectedId: string | null,
  limit: number = VISIBLE_ROW_LIMIT,
): VisibleCatalog {
  const matched = source.map((group) => ({
    ...group,
    rows: group.rows.filter((row) => matchesName(row.name, query)),
  }))
  const total = matched.reduce((sum, group) => sum + group.rows.length, 0)

  let budget = limit
  const capped: CatalogGroup[] = []
  let shown = 0
  for (const group of matched) {
    const rows: CatalogOption[] = []
    for (const row of group.rows) {
      if (budget > 0 || row.id === selectedId) {
        rows.push(row)
        shown += 1
        if (budget > 0) budget -= 1
      }
    }
    if (rows.length > 0) capped.push({ ...group, rows })
  }

  return {
    groups: capped,
    hidden: Math.max(0, total - shown),
    empty: total === 0,
  }
}

export function groupsFor(kind: CatalogKind): CatalogGroup[] {
  return groups(kind)
}

export function rowCount(kind: CatalogKind): number {
  return groupsFor(kind).reduce((sum, group) => sum + group.rows.length, 0)
}

export function showsSearch(kind: CatalogKind): boolean {
  return rowCount(kind) > SEARCH_ROW_THRESHOLD
}
