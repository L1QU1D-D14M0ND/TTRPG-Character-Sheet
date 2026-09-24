import type { OverrideValue } from '../character/types'
import type { AbilityKey } from '../character/types'
import {
  applyOverrides as applyOverridesShared,
  isFiniteNumber,
  isOverridden,
  isSafeKey,
  ownEntry,
} from '../../../shared/overrides'
import type { DerivedView } from './types'

export { isOverridden }

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const SCALARS: Record<
  string,
  (view: DerivedView, value: number) => void
> = {
  level: (view, value) => {
    view.level = value
  },
  bab: (view, value) => {
    view.bab = value
  },
  maxHp: (view, value) => {
    view.maxHp = value
  },
  deadAt: (view, value) => {
    view.deadAt = value
  },
  ac: (view, value) => {
    view.ac = value
  },
  touchAc: (view, value) => {
    view.touchAc = value
  },
  flatFootedAc: (view, value) => {
    view.flatFootedAc = value
  },
  cmb: (view, value) => {
    view.cmb = value
  },
  cmd: (view, value) => {
    view.cmd = value
  },
  initiative: (view, value) => {
    view.initiative = value
  },
  fortitude: (view, value) => {
    view.fortitude = value
  },
  reflex: (view, value) => {
    view.reflex = value
  },
  will: (view, value) => {
    view.will = value
  },
  meleeAttack: (view, value) => {
    view.meleeAttack = value
  },
  rangedAttack: (view, value) => {
    view.rangedAttack = value
  },
  weightUsed: (view, value) => {
    view.weightUsed = value
  },
  lightLoad: (view, value) => {
    view.lightLoad = value
  },
  mediumLoad: (view, value) => {
    view.mediumLoad = value
  },
  heavyLoad: (view, value) => {
    view.heavyLoad = value
  },
  skillRanksSpent: (view, value) => {
    view.skillRanksSpent = value
  },
  skillRanksBudget: (view, value) => {
    view.skillRanksBudget = value
  },
  pilotMaxHp: (view, value) => {
    view.pilotMaxHp = value
  },
}

function applyOne(view: DerivedView, path: string, value: unknown): boolean {
  const parts = path.split('.')
  if (parts[0] !== 'derived' || parts.length < 2) return false

  const setScalar = parts.length === 2 ? SCALARS[parts[1]] : undefined
  if (setScalar) {
    if (!isFiniteNumber(value)) return false
    setScalar(view, value)
    return true
  }

  if (parts.length === 2 && parts[1] === 'babIteratives') {
    if (!Array.isArray(value) || !value.every(isFiniteNumber)) return false
    view.babIteratives = [...value]
    return true
  }

  if (
    parts.length === 3 &&
    parts[1] === 'abilityModifiers' &&
    ABILITY_KEYS.includes(parts[2] as AbilityKey)
  ) {
    if (!isFiniteNumber(value)) return false
    view.abilityModifiers[parts[2] as AbilityKey] = value
    return true
  }

  if (
    parts.length === 3 &&
    parts[1] === 'skillTotals' &&
    parts[2] &&
    isSafeKey(parts[2])
  ) {
    if (!isFiniteNumber(value)) return false
    view.skillTotals[parts[2]] = value
    return true
  }

  if (
    parts.length === 4 &&
    parts[1] === 'attacks' &&
    parts[3] === 'attack' &&
    parts[2]
  ) {
    if (!isFiniteNumber(value)) return false
    const existing = ownEntry(view.attacks, parts[2])
    if (!existing) return false
    const delta = value - existing.attack
    existing.attack = value
    existing.iteratives = existing.iteratives.map((step) => step + delta)
    return true
  }

  if (
    parts.length === 4 &&
    parts[1] === 'spellcasting' &&
    parts[3] === 'casterLevel' &&
    parts[2]
  ) {
    if (!isFiniteNumber(value)) return false
    const existing = ownEntry(view.spellcasting, parts[2])
    if (!existing) return false
    existing.casterLevel = value
    return true
  }

  if (
    parts.length === 5 &&
    parts[1] === 'spellcasting' &&
    (parts[3] === 'dcByLevel' ||
      parts[3] === 'bonusSlotsByLevel' ||
      parts[3] === 'slotMaxByLevel') &&
    parts[2]
  ) {
    if (!isFiniteNumber(value)) return false
    const existing = ownEntry(view.spellcasting, parts[2])
    if (!existing) return false
    const index = Number(parts[4])
    if (!Number.isInteger(index) || index < 0 || index > 9) return false
    if (parts[3] === 'dcByLevel') existing.dcByLevel[index] = value
    else if (parts[3] === 'bonusSlotsByLevel') {
      existing.bonusSlotsByLevel[index] = value
    } else existing.slotMaxByLevel[index] = value
    return true
  }

  return false
}

/**
 * Apply overrides last. Unknown paths are ignored (stored on ignoredOverridePaths).
 * Overriding BAB does not rewrite babIteratives or attack slash lines.
 */
export function applyOverrides(
  view: DerivedView,
  overrides: Record<string, OverrideValue>,
): DerivedView {
  return applyOverridesShared(view, overrides, applyOne)
}
