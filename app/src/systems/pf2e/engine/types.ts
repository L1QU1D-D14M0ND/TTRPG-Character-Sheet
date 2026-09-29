import type { AttributeKey, CharacterDocument, DerivedCache } from '../character/types'

export { signed } from '../../../shared/format'

export interface StrikeDerived {
  attack: number
  damage: string
}

export interface SpellcastingDerived {
  attack: number
  dc: number
}

export interface DerivedView {
  attributeModifiers: Record<AttributeKey, number>
  maxHp: number
  ac: number
  perception: number
  fortitude: number
  reflex: number
  will: number
  /** Class DC value (10 + bonus), not the bonus alone. */
  classDC: number
  skillTotals: Record<string, number>
  bulkUsed: number
  bulkCapacity: number
  bulkMaximum: number
  investedCount: number
  maxDying: number
  strikes: Record<string, StrikeDerived>
  spellcasting: Record<string, SpellcastingDerived>
  overriddenPaths: string[]
  ignoredOverridePaths: string[]
}

export function toDerivedCache(view: DerivedView): DerivedCache {
  return {
    attributeModifiers: view.attributeModifiers,
    maxHp: view.maxHp,
    ac: view.ac,
    perception: view.perception,
    fortitude: view.fortitude,
    reflex: view.reflex,
    will: view.will,
    classDC: view.classDC,
    skillTotals: view.skillTotals,
    bulkUsed: view.bulkUsed,
    bulkCapacity: view.bulkCapacity,
    investedCount: view.investedCount,
    maxDying: view.maxDying,
    computedAt: new Date().toISOString(),
  }
}

export function emptyAttributeModifiers(): Record<AttributeKey, number> {
  return { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
}

export type ComputeInput = Pick<
  CharacterDocument,
  | 'identity'
  | 'attributes'
  | 'proficiencies'
  | 'vitals'
  | 'armorClass'
  | 'skills'
  | 'strikes'
  | 'spellcasting'
  | 'inventory'
  | 'overrides'
> &
  Partial<Pick<CharacterDocument, 'feats' | 'conditions'>>
