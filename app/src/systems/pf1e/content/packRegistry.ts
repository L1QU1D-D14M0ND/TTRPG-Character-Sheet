import type {
  BabProgression,
  ClassSaves,
  ContentRef,
  FeatEntry,
  ItemEntry,
  Size,
} from '../character/types'

export interface ClassProgression {
  id: string
  name: string
  hitDie: number
  babProgression: BabProgression
  saves: ClassSaves
  skillPointsPerLevel: number
  classSkills: string[]
  /**
   * 20 class-level rows × 10 spell levels (0–9).
   * null = cannot cast that level yet. 0 = table lists 0 (bonus still applies).
   */
  spellsPerDay?: Array<Array<number | null>>
  source?: ContentRef['source']
}

export interface RaceCatalogRow {
  id: string
  name: string
  size?: Size
  source?: ContentRef['source']
}

export type ItemKind = 'weapon' | 'armor' | 'shield' | 'item'

export interface ItemCatalogRow {
  id: string
  name: string
  baseItemId?: string
  kind: ItemKind
  pounds: number
  weapon?: ItemEntry['weapon']
  armor?: ItemEntry['armor']
  shield?: ItemEntry['shield']
  source?: ContentRef['source']
}

export interface FeatCatalogRow {
  id: string
  name: string
  category: FeatEntry['category']
  source?: ContentRef['source']
}

export interface SpellCatalogRow {
  id: string
  name: string
  spellLevel: number
  source?: ContentRef['source']
}

export interface ArchetypeCatalogRow {
  id: string
  name: string
  classId: string
  source?: ContentRef['source']
}

export interface EvolutionCatalogRow {
  id: string
  name: string
  source?: ContentRef['source']
}

export interface FeatureCatalogRow {
  id: string
  name: string
  source?: ContentRef['source']
}

export type CatalogKind =
  | 'feat'
  | 'feature'
  | 'spell'
  | 'item'
  | 'evolution'
  | 'race'
  | 'class'
  | 'archetype'

export const CATALOG_KINDS: readonly CatalogKind[] = [
  'feat',
  'feature',
  'spell',
  'item',
  'evolution',
  'race',
  'class',
  'archetype',
]

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

/** One content pack's rows, by catalog kind. A pack ships only the kinds it has. */
export type PackRows = { readonly [K in CatalogKind]?: readonly MechanicsMap[K][] }

/**
 * One id space per catalog kind, shared across packs.
 *
 * Lookup used to scan packs in registration order and return the first hit, so
 * a later pack reusing an id (say APG shipping `class.wizard`) was silently
 * shadowed by CRB rather than reported. Ids are now unique per kind and a
 * collision throws at registration, which surfaces in CI via the pack tests.
 *
 * Internal to `content/`: callers outside it go through the catalog index.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const left = a as Record<string, unknown>
  const right = b as Record<string, unknown>
  const keys = Object.keys(left)
  if (keys.length !== Object.keys(right).length) return false
  return keys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(right, key) &&
      deepEqual(left[key], right[key]),
  )
}

type AnyRow = MechanicsMap[CatalogKind]

const byKind = new Map<CatalogKind, Map<string, AnyRow>>(
  CATALOG_KINDS.map((kind) => [kind, new Map<string, AnyRow>()]),
)

function indexFor(kind: CatalogKind): Map<string, AnyRow> {
  return byKind.get(kind)!
}

/**
 * Register every row of one pack. All kinds are checked before any row is
 * written, so a collision leaves the registry unchanged.
 *
 * Re-registering an identical row is a no-op, because a module re-evaluated
 * under HMR rebuilds its rows into *new* objects that are equal but not
 * identical. Only a row that genuinely disagrees with the registered one is
 * a real collision worth failing on.
 */
export function registerPack(pack: PackRows): void {
  for (const kind of CATALOG_KINDS) {
    const index = indexFor(kind)
    for (const row of pack[kind] ?? []) {
      const existing = index.get(row.id)
      if (existing && !deepEqual(existing, row)) {
        throw new Error(
          `Duplicate ${kind} id '${row.id}' across PF1e content packs. ` +
            'Ids are one shared namespace per kind; rename the new row.',
        )
      }
    }
  }
  for (const kind of CATALOG_KINDS) {
    const index = indexFor(kind)
    for (const row of pack[kind] ?? []) index.set(row.id, row)
  }
}

/** Unknown or empty id → null. Never throws. Any registered pack. */
export function lookupRow<K extends CatalogKind>(
  kind: K,
  id: string | null | undefined,
): MechanicsMap[K] | null {
  if (!id) return null
  return (indexFor(kind).get(id) as MechanicsMap[K] | undefined) ?? null
}

/** Registration order. A re-registered id keeps its original position. */
export function listRows<K extends CatalogKind>(
  kind: K,
): readonly MechanicsMap[K][] {
  return [...indexFor(kind).values()] as MechanicsMap[K][]
}
