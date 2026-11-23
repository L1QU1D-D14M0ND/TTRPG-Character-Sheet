/**
 * PF1e catalog index.
 *
 * The one module callers use to list, resolve, and stamp catalog rows. It owns
 * pack registration: importing it registers every bundled content pack, in a
 * fixed order, before anything can look a row up. Each catalog kind is one
 * descriptor in `KINDS`; adding a kind is one entry there plus its row type.
 *
 * Stamping is pack-agnostic: a row from any registered pack stamps the same
 * way, and the row's own `source.book` records where it came from.
 * Document writes and document-wide side effects (class skills, the eidolon
 * companion) stay with the caller (ADR 0009).
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
import { DEFAULT_LOCALE, type Locale } from '../../../shared/i18n'
import { APG_PACK } from './apgPack'
import { CRB_PACK } from './crbPack'
import { localizedName } from './namesPack'
import {
  listRows,
  lookupRow,
  registerPack,
  type CatalogKind,
  type MechanicsFor,
  type MechanicsMap,
} from './packRegistry'
import { stampItem } from './stampItem'

export type { CatalogKind, MechanicsFor, MechanicsMap } from './packRegistry'

registerPack(CRB_PACK)
registerPack(APG_PACK)

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
  /**
   * The other name this row is known by: the English pack name when `name`
   * is a curated translation. Undefined when the two are the same. The
   * picker searches it as well, so a player who knows a row by its English
   * name still finds it with the Spanish UI on, and vice versa.
   */
  altName?: string
  detail?: string
}

export type CatalogGroup = {
  labelKey?: string
  rows: CatalogOption[]
}

/** Everything the index knows about one catalog kind. */
interface KindDescriptor<K extends CatalogKind> {
  /** Picker splits rows into one group per pack (by `source.book`). */
  grouped?: boolean
  detail?: (row: MechanicsMap[K]) => string | undefined
  id: (host: HostFor<K>) => string | null
  name: (host: HostFor<K>) => string
  withName: (host: HostFor<K>, name: string) => HostFor<K>
  /** `found` is null for an unknown or cleared id. */
  stamp: (host: HostFor<K>, found: MechanicsMap[K] | null) => HostFor<K>
}

type KindTable = { [K in CatalogKind]: KindDescriptor<K> }

const KINDS: KindTable = {
  feat: {
    detail: (row) => row.category,
    id: (host) => host.feat.id,
    name: (host) => host.feat.name,
    withName: (host, name) => ({ ...host, feat: { ...host.feat, name } }),
    // Does not rewrite level gained, summary, combat math, or effects.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            feat: { id: found.id, name: found.name, source: found.source },
            category: found.category,
          }
        : { ...host, feat: { ...host.feat, id: null } },
  },
  feature: {
    id: (host) => host.feature.id,
    name: (host) => host.feature.name,
    withName: (host, name) => ({ ...host, feature: { ...host.feature, name } }),
    // Does not rewrite levelGained, summary, or notes.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            feature: { id: found.id, name: found.name, source: found.source },
          }
        : { ...host, feature: { ...host.feature, id: null } },
  },
  spell: {
    grouped: true,
    detail: (row) => String(row.spellLevel),
    id: (host) => host.spell.id,
    name: (host) => host.spell.name,
    withName: (host, name) => ({ ...host, spell: { ...host.spell, name } }),
    // Does not rewrite prepared flags, summaries, slots, or DCs.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            spell: { id: found.id, name: found.name, source: found.source },
            spellLevel: found.spellLevel,
          }
        : { ...host, spell: { ...host.spell, id: null } },
  },
  item: {
    detail: (row) => row.kind,
    id: (host) => host.item.id,
    name: (host) => host.item.name,
    withName: (host, name) => ({ ...host, item: { ...host.item, name } }),
    stamp: stampItem,
  },
  evolution: {
    id: (host) => host.evolution.id,
    name: (host) => host.evolution.name,
    withName: (host, name) => ({
      ...host,
      evolution: { ...host.evolution, name },
    }),
    // Does not rewrite fused scores, costume HP, notes, or effects.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            evolution: { id: found.id, name: found.name, source: found.source },
          }
        : { ...host, evolution: { ...host.evolution, id: null } },
  },
  race: {
    id: (host) => host.race.id,
    name: (host) => host.race.name,
    withName: (host, name) => ({ ...host, race: { ...host.race, name } }),
    // Stamps size too. Does not rewrite languages or ability scores. An
    // unknown id keeps the typed name and size.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            size: found.size ?? host.size,
            race: { id: found.id, name: found.name, source: found.source },
          }
        : { ...host, race: { ...host.race, id: null } },
  },
  class: {
    grouped: true,
    id: (host) => host.class.id,
    name: (host) => host.class.name,
    withName: (host, name) => ({ ...host, class: { ...host.class, name } }),
    // Stamps HD / BAB / saves / skill points; leaves levels and favored-class
    // totals. Leaving Summoner (or an unknown id) clears a stamped archetype.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            class: { id: found.id, name: found.name, source: found.source },
            hitDie: found.hitDie,
            babProgression: found.babProgression,
            saves: { ...found.saves },
            skillPointsPerLevel: found.skillPointsPerLevel,
            archetype:
              found.id === 'class.summoner' ? host.archetype : undefined,
          }
        : { ...host, class: { ...host.class, id: null }, archetype: undefined },
  },
  archetype: {
    id: (host) => host.archetype?.id ?? null,
    name: (host) => host.archetype?.name ?? '',
    withName: (host, name) => ({
      ...host,
      archetype: {
        id: host.archetype?.id ?? null,
        name,
        source: host.archetype?.source,
      },
    }),
    // Does not rewrite HD / BAB / saves, ability scores, HP, or evolutions.
    // Unknown or empty id clears the archetype.
    stamp: (host, found) =>
      found
        ? {
            ...host,
            archetype: { id: found.id, name: found.name, source: found.source },
          }
        : { ...host, archetype: undefined },
  },
}

function descriptor<K extends CatalogKind>(kind: K): KindDescriptor<K> {
  return KINDS[kind] as KindDescriptor<K>
}

const PACK_LABEL: Record<string, string> = {
  CRB: 'pf1e.identity.optgroupCrb',
  APG: 'pf1e.identity.optgroupApg',
}

function project<K extends CatalogKind>(
  kind: K,
  row: MechanicsMap[K],
  locale: Locale,
): CatalogOption {
  const detail = descriptor(kind).detail?.(row)
  const localized = localizedName(row.id, locale)
  const option: CatalogOption = { id: row.id, name: localized ?? row.name }
  if (localized) option.altName = row.name
  if (detail !== undefined) option.detail = detail
  return option
}

/**
 * Ordered picker rows from every registered pack. Grouped kinds (spell, class)
 * split by pack in registration order. Rows are labelled in `locale`, falling
 * back to the English pack name per row; ordering stays the pack's own so a
 * translated list does not reshuffle.
 */
export function groups(
  kind: CatalogKind,
  locale: Locale = DEFAULT_LOCALE,
): CatalogGroup[] {
  const rows = listRows(kind)
  if (!descriptor(kind).grouped) {
    return [{ rows: rows.map((row) => project(kind, row, locale)) }]
  }

  const buckets = new Map<string, CatalogOption[]>()
  for (const row of rows) {
    const book = row.source?.book ?? ''
    const bucket = buckets.get(book)
    const option = project(kind, row, locale)
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
  return lookupRow(kind, id) ?? undefined
}

/**
 * Stamp a catalog id onto a host. `null` clears the catalog id; an unknown id
 * clears it too. Any row `groups` lists stamps.
 * Does not run stampClassSkills or ensureEidolonCompanion.
 */
export function stamp<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
  id: string | null,
): HostFor<K> {
  return descriptor(kind).stamp(host, lookupRow(kind, id))
}

export function catalogId<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
): string | null {
  return descriptor(kind).id(host)
}

export function catalogName<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
): string {
  return descriptor(kind).name(host)
}

export function setCatalogName<K extends CatalogKind>(
  kind: K,
  host: HostFor<K>,
  name: string,
): HostFor<K> {
  return descriptor(kind).withName(host, name)
}
