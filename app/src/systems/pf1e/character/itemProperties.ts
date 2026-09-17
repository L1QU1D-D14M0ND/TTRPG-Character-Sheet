/** Kebab-case item tags (weapon, armor, and shield properties). Length N is 0 (omit), 1, or many. */

export function toKebabTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Unique kebab tags. Empty list is omitted (`undefined`), not `[]`. */
export function normalizeItemProperties(
  tags: readonly string[],
): string[] | undefined {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const tag = toKebabTag(raw)
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    out.push(tag)
  }
  return out.length === 0 ? undefined : out
}

export function addItemProperty(
  tags: readonly string[] | undefined,
  raw: string,
): string[] | undefined {
  return normalizeItemProperties([...(tags ?? []), raw])
}

export function removeItemProperty(
  tags: readonly string[] | undefined,
  raw: string,
): string[] | undefined {
  const drop = toKebabTag(raw)
  return normalizeItemProperties((tags ?? []).filter((tag) => tag !== drop))
}
