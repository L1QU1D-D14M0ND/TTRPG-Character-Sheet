/**
 * Kind table for the PF1e catalog picker (ADR 0009).
 *
 * Callers pass a kind and a host object; stamping and name edits stay here so
 * the React picker does not switch on kind.
 */

import type {
  ClassEntry,
  EvolutionEntry,
  FeatEntry,
  FeatureEntry,
  Identity,
  ItemEntry,
  SpellListEntry,
} from '../character/types'
import {
  APG_ARCHETYPES,
  APG_CLASSES,
  APG_EVOLUTIONS,
  APG_SPELLS,
  applyApgArchetype,
  applyApgEvolution,
  applyClassProgression,
  applyCrbFeat,
  applyCrbFeature,
  applyCrbItem,
  applyCrbRace,
  applySpell,
  CRB_CLASSES,
  CRB_FEATS,
  CRB_FEATURES,
  CRB_ITEMS,
  CRB_RACES,
  CRB_SPELLS,
} from '../content'

export type CatalogKind =
  | 'feat'
  | 'feature'
  | 'spell'
  | 'item'
  | 'evolution'
  | 'race'
  | 'class'
  | 'archetype'

export interface CatalogHostMap {
  feat: FeatEntry
  feature: FeatureEntry
  spell: SpellListEntry
  item: ItemEntry
  evolution: EvolutionEntry
  race: Identity
  class: ClassEntry
  archetype: ClassEntry
}

export type HostFor<K extends CatalogKind> = CatalogHostMap[K]

export type CatalogOption = {
  id: string
  name: string
  detail?: string
}

export type CatalogGroup = {
  labelKey?: string
  rows: CatalogOption[]
}

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
  groups: CatalogGroup[],
  query: string,
  selectedId: string | null,
  limit: number = VISIBLE_ROW_LIMIT,
): VisibleCatalog {
  const matched = groups.map((group) => ({
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
  switch (kind) {
    case 'feat':
      return [
        {
          rows: CRB_FEATS.map((row) => ({
            id: row.id,
            name: row.name,
            detail: row.category,
          })),
        },
      ]
    case 'feature':
      return [
        { rows: CRB_FEATURES.map((row) => ({ id: row.id, name: row.name })) },
      ]
    case 'spell':
      return [
        {
          labelKey: 'pf1e.identity.optgroupCrb',
          rows: CRB_SPELLS.map((row) => ({
            id: row.id,
            name: row.name,
            detail: String(row.spellLevel),
          })),
        },
        {
          labelKey: 'pf1e.identity.optgroupApg',
          rows: APG_SPELLS.map((row) => ({
            id: row.id,
            name: row.name,
            detail: String(row.spellLevel),
          })),
        },
      ]
    case 'item':
      return [
        {
          rows: CRB_ITEMS.map((row) => ({
            id: row.id,
            name: row.name,
            detail: row.kind,
          })),
        },
      ]
    case 'evolution':
      return [
        {
          rows: APG_EVOLUTIONS.map((row) => ({ id: row.id, name: row.name })),
        },
      ]
    case 'race':
      return [
        { rows: CRB_RACES.map((row) => ({ id: row.id, name: row.name })) },
      ]
    case 'class':
      return [
        {
          labelKey: 'pf1e.identity.optgroupCrb',
          rows: CRB_CLASSES.map((row) => ({ id: row.id, name: row.name })),
        },
        {
          labelKey: 'pf1e.identity.optgroupApg',
          rows: APG_CLASSES.map((row) => ({ id: row.id, name: row.name })),
        },
      ]
    case 'archetype':
      return [
        {
          rows: APG_ARCHETYPES.map((row) => ({ id: row.id, name: row.name })),
        },
      ]
  }
}

export function rowCount(kind: CatalogKind): number {
  return groupsFor(kind).reduce((sum, group) => sum + group.rows.length, 0)
}

export function showsSearch(kind: CatalogKind): boolean {
  return rowCount(kind) > SEARCH_ROW_THRESHOLD
}

export function stamp<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
  id: string | null,
): HostFor<K> {
  switch (kind) {
    case 'feat':
      return applyCrbFeat(host as FeatEntry, id) as HostFor<K>
    case 'feature':
      return applyCrbFeature(host as FeatureEntry, id) as HostFor<K>
    case 'spell':
      return applySpell(host as SpellListEntry, id) as HostFor<K>
    case 'item':
      return applyCrbItem(host as ItemEntry, id) as HostFor<K>
    case 'evolution':
      return applyApgEvolution(host as EvolutionEntry, id) as HostFor<K>
    case 'race':
      return applyCrbRace(host as Identity, id) as HostFor<K>
    case 'class':
      return applyClassProgression(host as ClassEntry, id) as HostFor<K>
    case 'archetype':
      return applyApgArchetype(host as ClassEntry, id) as HostFor<K>
    default: {
      const _never: never = kind
      return _never
    }
  }
}

export function setCatalogName<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
  name: string,
): HostFor<K> {
  switch (kind) {
    case 'feat': {
      const row = host as FeatEntry
      return { ...row, feat: { ...row.feat, name } } as HostFor<K>
    }
    case 'feature': {
      const row = host as FeatureEntry
      return { ...row, feature: { ...row.feature, name } } as HostFor<K>
    }
    case 'spell': {
      const row = host as SpellListEntry
      return { ...row, spell: { ...row.spell, name } } as HostFor<K>
    }
    case 'item': {
      const row = host as ItemEntry
      return { ...row, item: { ...row.item, name } } as HostFor<K>
    }
    case 'evolution': {
      const row = host as EvolutionEntry
      return { ...row, evolution: { ...row.evolution, name } } as HostFor<K>
    }
    case 'race': {
      const identity = host as Identity
      return { ...identity, race: { ...identity.race, name } } as HostFor<K>
    }
    case 'class': {
      const row = host as ClassEntry
      return { ...row, class: { ...row.class, name } } as HostFor<K>
    }
    case 'archetype': {
      const row = host as ClassEntry
      return {
        ...row,
        archetype: {
          id: row.archetype?.id ?? null,
          name,
          source: row.archetype?.source,
        },
      } as HostFor<K>
    }
    default: {
      const _never: never = kind
      return _never
    }
  }
}

export function catalogId<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
): string | null {
  switch (kind) {
    case 'feat':
      return (host as FeatEntry).feat.id
    case 'feature':
      return (host as FeatureEntry).feature.id
    case 'spell':
      return (host as SpellListEntry).spell.id
    case 'item':
      return (host as ItemEntry).item.id
    case 'evolution':
      return (host as EvolutionEntry).evolution.id
    case 'race':
      return (host as Identity).race.id
    case 'class':
      return (host as ClassEntry).class.id
    case 'archetype':
      return (host as ClassEntry).archetype?.id ?? null
    default: {
      const _never: never = kind
      return _never
    }
  }
}

export function catalogName<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
): string {
  switch (kind) {
    case 'feat':
      return (host as FeatEntry).feat.name
    case 'feature':
      return (host as FeatureEntry).feature.name
    case 'spell':
      return (host as SpellListEntry).spell.name
    case 'item':
      return (host as ItemEntry).item.name
    case 'evolution':
      return (host as EvolutionEntry).evolution.name
    case 'race':
      return (host as Identity).race.name
    case 'class':
      return (host as ClassEntry).class.name
    case 'archetype':
      return (host as ClassEntry).archetype?.name ?? ''
    default: {
      const _never: never = kind
      return _never
    }
  }
}
