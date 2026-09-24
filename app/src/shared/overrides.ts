export interface OverrideValue {
  value: unknown
  reason?: string
  updatedAt?: string
}

export interface OverrideHost {
  overriddenPaths: string[]
  ignoredOverridePaths: string[]
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Override paths come from a loaded document, so the segment naming a record
 * entry is untrusted text. Plain indexing resolves `__proto__`, `constructor`,
 * and `toString` to things inherited from `Object.prototype`, which made an
 * override like `derived.attacks.__proto__.attack` look like a real attack row
 * and then crash on its missing fields. Resolve entries by own key only, so an
 * unsafe segment is simply an unknown path and lands on ignoredOverridePaths.
 */
export function ownEntry<T>(
  record: Record<string, T>,
  key: string,
): T | undefined {
  return Object.prototype.hasOwnProperty.call(record, key)
    ? record[key]
    : undefined
}

/** True when `key` is safe to write as an own property of a plain record. */
export function isSafeKey(key: string): boolean {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype'
}

/**
 * Apply overrides last. `applyOne` is per-system (allow-list + Derived shape).
 * Unknown paths are recorded on ignoredOverridePaths.
 */
export function applyOverrides<T extends OverrideHost>(
  view: T,
  overrides: Record<string, OverrideValue>,
  applyOne: (view: T, path: string, value: unknown) => boolean,
): T {
  if (Object.keys(overrides).length === 0) return view
  const next: T = structuredClone(view)
  for (const [path, override] of Object.entries(overrides)) {
    if (applyOne(next, path, override.value)) {
      next.overriddenPaths.push(path)
    } else {
      next.ignoredOverridePaths.push(path)
    }
  }
  return next
}

export function isOverridden(view: OverrideHost, path: string): boolean {
  return view.overriddenPaths.includes(path)
}
