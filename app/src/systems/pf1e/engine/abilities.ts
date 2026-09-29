import type { Abilities, AbilityKey, Size } from '../character/types'
import { abilityModifierFromScore } from '../../../shared/abilities'

export { abilityModifierFromScore }

export function effectiveAbilityScore(block: {
  score: number
  tempScore?: number
}): number {
  return block.score + (block.tempScore ?? 0)
}

export function abilityModifiers(
  abilities: Abilities,
): Record<AbilityKey, number> {
  const keys: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const result = {} as Record<AbilityKey, number>
  for (const key of keys) {
    const block = abilities[key]
    result[key] =
      abilityModifierFromScore(effectiveAbilityScore(block)) +
      (block.tempModifier ?? 0)
  }
  return result
}

/** Size modifier to AC and attack rolls (CRB). */
export function sizeAcAttackModifier(size: Size): number {
  switch (size) {
    case 'fine':
      return 8
    case 'diminutive':
      return 4
    case 'tiny':
      return 2
    case 'small':
      return 1
    case 'medium':
      return 0
    case 'large':
      return -1
    case 'huge':
      return -2
    case 'gargantuan':
      return -4
    case 'colossal':
      return -8
  }
}

/** Special size modifier to CMB and CMD (CRB). */
export function sizeCmbModifier(size: Size): number {
  return -sizeAcAttackModifier(size)
}

/** Tiny or smaller creatures use Dexterity in place of Strength for CMB (CRB). */
export function cmbAbilityModifier(
  size: Size,
  mods: Record<AbilityKey, number>,
): number {
  if (size === 'tiny' || size === 'diminutive' || size === 'fine') {
    return mods.dex
  }
  return mods.str
}

/** Carrying-capacity size multiplier for quadrupeds vs a Medium biped (CRB Table 7-5). */
export function quadrupedCarryMultiplier(size: Size): number {
  switch (size) {
    case 'fine':
      return 1 / 4
    case 'diminutive':
      return 1 / 2
    case 'tiny':
      return 3 / 4
    case 'small':
      return 1
    case 'medium':
      return 1.5
    case 'large':
      return 3
    case 'huge':
      return 6
    case 'gargantuan':
      return 12
    case 'colossal':
      return 24
  }
}

/** Carrying-capacity size multiplier vs a Medium biped (CRB Table 7-5). */
export function sizeCarryMultiplier(size: Size, isQuadruped = false): number {
  if (isQuadruped) {
    return quadrupedCarryMultiplier(size)
  }
  switch (size) {
    case 'fine':
      return 1 / 8
    case 'diminutive':
      return 1 / 4
    case 'tiny':
      return 1 / 2
    case 'small':
      return 3 / 4
    case 'medium':
      return 1
    case 'large':
      return 2
    case 'huge':
      return 4
    case 'gargantuan':
      return 8
    case 'colossal':
      return 16
  }
}
