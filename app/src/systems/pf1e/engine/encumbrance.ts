import type { LoadCategory, Size } from '../character/types'
import { sizeCarryMultiplier } from './abilities'

const HEAVY_BY_STR = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const
const HEAVY_REMAINDER = [100, 115, 130, 150, 175] as const

/** Heavy load in pounds for a Medium biped (CRB Strength table). */
export function mediumBipedHeavyLoad(strength: number): number {
  if (strength <= 0) return 0
  if (strength <= 10) return HEAVY_BY_STR[strength] ?? 0
  const over = strength - 10
  const fives = Math.floor(over / 5)
  const rem = over % 5
  return HEAVY_REMAINDER[rem] * 2 ** fives
}

export function loadThresholds(
  strength: number,
  size: Size,
  isQuadruped = false,
): { light: number; medium: number; heavy: number } {
  const heavy = Math.floor(
    mediumBipedHeavyLoad(strength) * sizeCarryMultiplier(size, isQuadruped),
  )
  return {
    light: Math.floor(heavy / 3),
    medium: Math.floor((heavy * 2) / 3),
    heavy,
  }
}

export function loadCategory(
  weightUsed: number,
  thresholds: { light: number; medium: number; heavy: number },
): LoadCategory {
  if (weightUsed <= thresholds.light) return 'light'
  if (weightUsed <= thresholds.medium) return 'medium'
  if (weightUsed <= thresholds.heavy) return 'heavy'
  return 'overloaded'
}

/** Sheet opt-out of load category. Carried pounds still sum. */
export function effectiveLoadCategory(
  carried: number,
  thresholds: { light: number; medium: number; heavy: number },
  ignoreWeight: boolean,
): LoadCategory {
  if (ignoreWeight) return 'ignored'
  return loadCategory(carried, thresholds)
}

export function formatLoadSummary(
  carried: number,
  category: LoadCategory,
  thresholds: { light: number; medium: number; heavy: number },
): string {
  if (category === 'ignored') return `${carried} lb · ignored`
  return `${carried} lb · ${category} (L ${thresholds.light} / M ${thresholds.medium} / H ${thresholds.heavy})`
}

export function weightUsed(
  items: Array<{ quantity: number; pounds: number; location: string }>,
): number {
  return items.reduce((sum, item) => {
    if (item.location === 'dropped') return sum
    return sum + item.quantity * item.pounds
  }, 0)
}
