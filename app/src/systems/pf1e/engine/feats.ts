import type { FeatEntry } from '../character/types'

/** Lower-case, trimmed, inner whitespace collapsed. */
function normalizeFeatName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Whether the character has a feat. A stamped row matches by catalog id only;
 * a Custom row (no id) matches by exact name, ignoring case and spacing.
 * Never a substring match: "Craft" must not match "Craft Wondrous Item".
 */
export function hasFeat(
  feats: readonly FeatEntry[] | undefined,
  feat: { id: string; name: string },
): boolean {
  const name = normalizeFeatName(feat.name)
  return (feats ?? []).some((row) =>
    row.feat.id
      ? row.feat.id === feat.id
      : normalizeFeatName(row.feat.name) === name,
  )
}

/**
 * Whether any feat row, stamped or Custom, carries exactly this name
 * (ignoring case and spacing). For free text the player typed, such as a
 * Budget Calculator item's required feat.
 */
export function hasFeatNamed(
  feats: readonly FeatEntry[] | undefined,
  name: string,
): boolean {
  const target = normalizeFeatName(name)
  if (!target) return false
  return (feats ?? []).some((row) => normalizeFeatName(row.feat.name) === target)
}
