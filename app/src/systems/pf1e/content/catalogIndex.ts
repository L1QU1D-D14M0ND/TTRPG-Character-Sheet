/**
 * PF1e catalog index.
 *
 * One kind table for listing, resolving, and stamping a host. Content packs
 * register into packRegistry at load; this module is the seam callers use.
 * Document writes and document-wide side effects stay in the panel (ADR 0009).
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
import { applyCrbFeat, applyCrbFeature, applyCrbItem, applyCrbRace } from './crbPack'
import { applyApgArchetype, applyApgEvolution } from './apgPack'
import { applyClassProgression } from './classLookup'
import {
  listArchetypes,
  listClassProgressions,
  listEvolutions,
  listFeats,
  listFeatures,
  listItems,
  listRaces,
  listSpells,
  lookupArchetype,
  lookupClassProgression,
  lookupEvolution,
  lookupFeat,
  lookupFeature,
  lookupItem,
  lookupRace,
  lookupSpell,
  type ArchetypeCatalogRow,
  type ClassProgression,
  type EvolutionCatalogRow,
  type FeatCatalogRow,
  type FeatureCatalogRow,
  type ItemCatalogRow,
  type RaceCatalogRow,
  type SpellCatalogRow,
} from './packRegistry'
import { applySpell } from './spellLookup'

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

export interface MechanicsMap {
  feat: FeatCatalogRow
  feature: FeatureCatalogRow
  spell: SpellCatalogRow
  item: ItemCatalogRow
  evolution: EvolutionCatalogRow
  race: RaceCatalogRow
  class: ClassProgression
  archetype: ArchetypeCatalogRow
}

export type MechanicsFor<K extends CatalogKind> = MechanicsMap[K]

export type CatalogOption = {
  id: string
  name: string
  detail?: string
}

export type CatalogGroup = {
  labelKey?: string
  rows: CatalogOption[]
}

const PACK_LABEL: Record<string, string> = {
  CRB: 'pf1e.identity.optgroupCrb',
  APG: 'pf1e.identity.optgroupApg',
}

const GROUPED_KINDS = new Set<CatalogKind>(['spell', 'class'])

type ListedRow = {
  id: string
  name: string
  source?: { book?: string }
}

function listRows(kind: CatalogKind): readonly ListedRow[] {
  switch (kind) {
    case 'feat':
      return listFeats()
    case 'feature':
      return listFeatures()
    case 'spell':
      return listSpells()
    case 'item':
      return listItems()
    case 'evolution':
      return listEvolutions()
    case 'race':
      return listRaces()
    case 'class':
      return listClassProgressions()
    case 'archetype':
      return listArchetypes()
    default: {
      const _never: never = kind
      return _never
    }
  }
}

function detailFor(kind: CatalogKind, row: ListedRow): string | undefined {
  if (kind === 'feat') return (row as FeatCatalogRow).category
  if (kind === 'spell') return String((row as SpellCatalogRow).spellLevel)
  if (kind === 'item') return (row as ItemCatalogRow).kind
  return undefined
}

function project(kind: CatalogKind, row: ListedRow): CatalogOption {
  const detail = detailFor(kind, row)
  return detail === undefined
    ? { id: row.id, name: row.name }
    : { id: row.id, name: row.name, detail }
}

/** Ordered picker rows. Spell and class split by pack in registration order. */
export function groups(kind: CatalogKind): CatalogGroup[] {
  const rows = listRows(kind)
  if (!GROUPED_KINDS.has(kind)) {
    return [{ rows: rows.map((row) => project(kind, row)) }]
  }

  const buckets = new Map<string, CatalogOption[]>()
  for (const row of rows) {
    const book = row.source?.book ?? ''
    const bucket = buckets.get(book)
    const option = project(kind, row)
    if (bucket) bucket.push(option)
    else buckets.set(book, [option])
  }

  return [...buckets.entries()].map(([book, groupRows]) => {
    const labelKey = PACK_LABEL[book]
    return labelKey ? { labelKey, rows: groupRows } : { rows: groupRows }
  })
}

/** Mechanics row for a catalog id, from any registered pack. Misses are undefined. */
export function resolve<K extends CatalogKind>(
  kind: K,
  id: string | null | undefined,
): MechanicsFor<K> | undefined {
  const found = lookupRow(kind, id)
  return found === null ? undefined : (found as MechanicsFor<K>)
}

function lookupRow(
  kind: CatalogKind,
  id: string | null | undefined,
): MechanicsFor<CatalogKind> | null {
  switch (kind) {
    case 'feat':
      return lookupFeat(id)
    case 'feature':
      return lookupFeature(id)
    case 'spell':
      return lookupSpell(id)
    case 'item':
      return lookupItem(id)
    case 'evolution':
      return lookupEvolution(id)
    case 'race':
      return lookupRace(id)
    case 'class':
      return lookupClassProgression(id)
    case 'archetype':
      return lookupArchetype(id)
    default: {
      const _never: never = kind
      return _never
    }
  }
}

/**
 * Stamp a catalog id onto a host. `null` clears the catalog id.
 * An unknown id clears it too, matching the existing apply functions.
 * Does not run stampClassSkills or ensureEidolonCompanion.
 */
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
