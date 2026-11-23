import type { AbilityKey, CharacterDocument, DerivedCache } from '../character/types'
import type { LoadCategory } from '../character/types'
import type { SpellcastingDerived } from './spellcasting'

export type { SpellcastingDerived } from './spellcasting'

export { signed } from '../../../shared/format'

export interface AttackDerived {
  attack: number
  /** Display form, built from `damageDice` and `damageMod` (e.g. `1d8+3`). */
  damage: string
  /** The row's damage dice exactly as typed (may be `1d8+1d6` or empty). */
  damageDice: string
  /** Ability modifier plus misc damage; the number after the dice. */
  damageMod: number
  /** Ability that adds to damage, or null when none does. */
  damageAbility: AbilityKey | null
  iteratives: number[]
}

export interface DerivedView {
  level: number
  abilityModifiers: Record<AbilityKey, number>
  bab: number
  babIteratives: number[]
  maxHp: number
  deadAt: number
  ac: number
  touchAc: number
  flatFootedAc: number
  cmb: number
  cmd: number
  flatFootedCmd: number
  initiative: number
  fortitude: number
  reflex: number
  will: number
  meleeAttack: number
  rangedAttack: number
  skillTotals: Record<string, number | null>
  weightUsed: number
  lightLoad: number
  mediumLoad: number
  heavyLoad: number
  loadCategory: LoadCategory
  skillRanksSpent: number
  skillRanksBudget: number
  attacks: Record<string, AttackDerived>
  spellcasting: Record<string, SpellcastingDerived>
  overriddenPaths: string[]
  ignoredOverridePaths: string[]
  fusedActive: boolean
  pilotMaxHp: number
}

export function toDerivedCache(view: DerivedView): DerivedCache {
  return {
    level: view.level,
    abilityModifiers: view.abilityModifiers,
    bab: view.bab,
    maxHp: view.maxHp,
    ac: view.ac,
    touchAc: view.touchAc,
    flatFootedAc: view.flatFootedAc,
    cmb: view.cmb,
    cmd: view.cmd,
    flatFootedCmd: view.flatFootedCmd,
    initiative: view.initiative,
    fortitude: view.fortitude,
    reflex: view.reflex,
    will: view.will,
    skillTotals: Object.fromEntries(
      Object.entries(view.skillTotals).filter(
        (entry): entry is [string, number] => entry[1] != null,
      ),
    ),
    weightUsed: view.weightUsed,
    computedAt: new Date().toISOString(),
  }
}

export function emptyAbilityModifiers(): Record<AbilityKey, number> {
  return { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
}

export type ComputeInput = Pick<
  CharacterDocument,
  | 'identity'
  | 'classes'
  | 'abilities'
  | 'vitals'
  | 'armorClass'
  | 'combat'
  | 'skills'
  | 'attacks'
  | 'spellcasting'
  | 'inventory'
  | 'companions'
  | 'overrides'
>
