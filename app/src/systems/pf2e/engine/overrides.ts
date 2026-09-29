import type { OverrideValue } from '../character/types'
import type { AttributeKey } from '../character/types'
import {
  applyOverrides as applyOverridesShared,
  isFiniteNumber,
  isOverridden,
  isSafeKey,
  ownEntry,
} from '../../../shared/overrides'
import type { DerivedView } from './types'

export { isOverridden }

const ATTRIBUTE_KEYS: AttributeKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const SCALARS: Record<
  string,
  (view: DerivedView, value: number) => void
> = {
  ac: (view, value) => {
    view.ac = value
  },
  maxHp: (view, value) => {
    view.maxHp = value
  },
  perception: (view, value) => {
    view.perception = value
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
  classDC: (view, value) => {
    view.classDC = value
  },
  bulkUsed: (view, value) => {
    view.bulkUsed = value
  },
  bulkCapacity: (view, value) => {
    view.bulkCapacity = value
  },
  investedCount: (view, value) => {
    view.investedCount = value
  },
  maxDying: (view, value) => {
    view.maxDying = value
  },
}

/**
 * Apply overrides last. Unknown paths are ignored (stored on ignoredOverridePaths).
 * Allowed: derived.ac, derived.maxHp, derived.perception, derived.fortitude,
 * derived.reflex, derived.will, derived.classDC, derived.bulkUsed,
 * derived.bulkCapacity, derived.investedCount,
 * derived.attributeModifiers.{str|dex|con|int|wis|cha},
 * derived.skillTotals.<key>, derived.strikes.<id>.attack,
 * derived.spellcasting.<id>.attack, derived.spellcasting.<id>.dc
 */
export function applyOverrides(
  view: DerivedView,
  overrides: Record<string, OverrideValue>,
): DerivedView {
  return applyOverridesShared(view, overrides, applyOne)
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

  if (
    parts.length === 3 &&
    parts[1] === 'attributeModifiers' &&
    ATTRIBUTE_KEYS.includes(parts[2] as AttributeKey)
  ) {
    if (!isFiniteNumber(value)) return false
    view.attributeModifiers[parts[2] as AttributeKey] = value
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
    parts[1] === 'strikes' &&
    parts[3] === 'attack' &&
    parts[2]
  ) {
    if (!isFiniteNumber(value)) return false
    const existing = ownEntry(view.strikes, parts[2])
    if (!existing) return false
    existing.attack = value
    return true
  }

  if (
    parts.length === 4 &&
    parts[1] === 'spellcasting' &&
    (parts[3] === 'attack' || parts[3] === 'dc') &&
    parts[2]
  ) {
    if (!isFiniteNumber(value)) return false
    const existing = ownEntry(view.spellcasting, parts[2])
    if (!existing) return false
    if (parts[3] === 'attack') existing.attack = value
    else existing.dc = value
    return true
  }

  return false
}
