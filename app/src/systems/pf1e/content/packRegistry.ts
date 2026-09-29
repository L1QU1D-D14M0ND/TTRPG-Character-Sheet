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

/**
 * One id space per entity kind, shared across packs.
 *
 * Lookup used to scan packs in registration order and return the first hit, so
 * a later pack reusing an id (say APG shipping `class.wizard`) was silently
 * shadowed by CRB rather than reported. Ids are now unique per kind and a
 * collision throws at registration, which surfaces in CI via the pack tests.
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

class PackIndex<T extends { id: string }> {
  readonly #byId = new Map<string, T>()

  readonly #kind: string

  constructor(kind: string) {
    this.#kind = kind
  }

  /**
   * Re-registering an identical row is a no-op, because a module re-evaluated
   * under HMR rebuilds its rows into *new* objects that are equal but not
   * identical. Only a row that genuinely disagrees with the registered one is
   * a real collision worth failing on.
   */
  register(rows: readonly T[]): void {
    for (const row of rows) {
      const existing = this.#byId.get(row.id)
      if (existing && !deepEqual(existing, row)) {
        throw new Error(
          `Duplicate ${this.#kind} id '${row.id}' across PF1e content packs. ` +
            'Ids are one shared namespace per kind; rename the new row.',
        )
      }
    }
    for (const row of rows) this.#byId.set(row.id, row)
  }

  lookup(id: string | null | undefined): T | null {
    if (!id) return null
    return this.#byId.get(id) ?? null
  }

  /** Registration order. A re-registered id keeps its original position. */
  entries(): readonly T[] {
    return [...this.#byId.values()]
  }
}

const classIndex = new PackIndex<ClassProgression>('class')
const raceIndex = new PackIndex<RaceCatalogRow>('race')
const itemIndex = new PackIndex<ItemCatalogRow>('item')
const featIndex = new PackIndex<FeatCatalogRow>('feat')
const spellIndex = new PackIndex<SpellCatalogRow>('spell')
const archetypeIndex = new PackIndex<ArchetypeCatalogRow>('archetype')
const evolutionIndex = new PackIndex<EvolutionCatalogRow>('evolution')
const featureIndex = new PackIndex<FeatureCatalogRow>('feature')

export function registerClassPack(rows: readonly ClassProgression[]): void {
  classIndex.register(rows)
}

export function registerRacePack(rows: readonly RaceCatalogRow[]): void {
  raceIndex.register(rows)
}

export function registerItemPack(rows: readonly ItemCatalogRow[]): void {
  itemIndex.register(rows)
}

export function registerFeatPack(rows: readonly FeatCatalogRow[]): void {
  featIndex.register(rows)
}

export function registerSpellPack(rows: readonly SpellCatalogRow[]): void {
  spellIndex.register(rows)
}

export function registerArchetypePack(
  rows: readonly ArchetypeCatalogRow[],
): void {
  archetypeIndex.register(rows)
}

export function registerEvolutionPack(
  rows: readonly EvolutionCatalogRow[],
): void {
  evolutionIndex.register(rows)
}

export function registerFeaturePack(
  rows: readonly FeatureCatalogRow[],
): void {
  featureIndex.register(rows)
}

export function lookupClassProgression(
  id: string | null | undefined,
): ClassProgression | null {
  return classIndex.lookup(id)
}

export function lookupRace(
  id: string | null | undefined,
): RaceCatalogRow | null {
  return raceIndex.lookup(id)
}

export function lookupItem(
  id: string | null | undefined,
): ItemCatalogRow | null {
  return itemIndex.lookup(id)
}

export function lookupFeat(
  id: string | null | undefined,
): FeatCatalogRow | null {
  return featIndex.lookup(id)
}

export function lookupSpell(
  id: string | null | undefined,
): SpellCatalogRow | null {
  return spellIndex.lookup(id)
}

export function lookupArchetype(
  id: string | null | undefined,
): ArchetypeCatalogRow | null {
  return archetypeIndex.lookup(id)
}

export function lookupEvolution(
  id: string | null | undefined,
): EvolutionCatalogRow | null {
  return evolutionIndex.lookup(id)
}

export function lookupFeature(
  id: string | null | undefined,
): FeatureCatalogRow | null {
  return featureIndex.lookup(id)
}

export function listClassProgressions(): readonly ClassProgression[] {
  return classIndex.entries()
}

export function listRaces(): readonly RaceCatalogRow[] {
  return raceIndex.entries()
}

export function listItems(): readonly ItemCatalogRow[] {
  return itemIndex.entries()
}

export function listFeats(): readonly FeatCatalogRow[] {
  return featIndex.entries()
}

export function listSpells(): readonly SpellCatalogRow[] {
  return spellIndex.entries()
}

export function listArchetypes(): readonly ArchetypeCatalogRow[] {
  return archetypeIndex.entries()
}

export function listEvolutions(): readonly EvolutionCatalogRow[] {
  return evolutionIndex.entries()
}

export function listFeatures(): readonly FeatureCatalogRow[] {
  return featureIndex.entries()
}
