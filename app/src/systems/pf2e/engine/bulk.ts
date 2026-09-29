import type { ItemEntry, Size } from '../character/types'

/** Persist decimals; compute in integer tenths to avoid float noise. */
export function bulkToTenths(bulk: number): number {
  return Math.round(bulk * 10)
}

export function tenthsToBulk(tenths: number): number {
  return tenths / 10
}

export function bulkUsedTenths(items: ItemEntry[]): number {
  return items.reduce((sum, item) => {
    return sum + item.quantity * bulkToTenths(item.bulk)
  }, 0)
}

/** Player Core p. 272 / CRB p. 272: bulk limit scaling by creature size. */
export function sizeBulkMultiplier(size: Size = 'medium'): number {
  switch (size) {
    case 'tiny':
      return 0.5
    case 'small':
    case 'medium':
      return 1
    case 'large':
      return 2
    case 'huge':
      return 4
    case 'gargantuan':
      return 8
    default:
      return 1
  }
}

export function bulkCapacityTenths(
  strModifier: number,
  bulkBonus: number,
  size: Size = 'medium',
): number {
  const base = (5 + strModifier + bulkBonus) * 10
  return Math.round(base * sizeBulkMultiplier(size))
}

export function bulkMaximumTenths(
  strModifier: number,
  bulkBonus: number,
  size: Size = 'medium',
): number {
  const base = (10 + strModifier + bulkBonus) * 10
  return Math.round(base * sizeBulkMultiplier(size))
}

export function investedCount(items: ItemEntry[]): number {
  return items.filter((item) => item.invested).length
}
