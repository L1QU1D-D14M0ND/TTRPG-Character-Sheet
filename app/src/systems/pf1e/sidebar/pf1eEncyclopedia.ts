import { lookupOgcName, OGC_ENTRIES } from '../content/ogcPack'
import { localizedName } from '../content/namesPack'
import { DEFAULT_LOCALE, type Locale } from '../../../shared/i18n'
import type { EncyclopediaGroup, EncyclopediaKind } from '../../../shell/sidebar/tools/encyclopedia/types'

const GROUP_KINDS: readonly EncyclopediaKind[] = [
  'spell',
  'feat',
  'feature',
  'affliction',
  'action',
]

/**
 * Encyclopedia rows for `locale`. Entries are labelled with the curated
 * catalog name when one exists, keeping the English name as `altName` so the
 * entry is still findable by it. The prose `body` stays English: it is Open
 * Game Content under the notice in `content/pf1e/ogc/`, and translating it
 * would be a prose slice, not a name slice.
 */
export function buildPf1eEncyclopedia(
  locale: Locale = DEFAULT_LOCALE,
): EncyclopediaGroup[] {
  const byKind = new Map<EncyclopediaKind, EncyclopediaGroup['entries']>(
    GROUP_KINDS.map((kind) => [kind, []]),
  )
  for (const entry of OGC_ENTRIES) {
    const name = lookupOgcName(entry)
    if (!name) continue
    const localized = localizedName(entry.id, locale)
    byKind.get(entry.kind)?.push(
      localized
        ? { id: entry.id, name: localized, altName: name, body: entry.body }
        : { id: entry.id, name, body: entry.body },
    )
  }
  return GROUP_KINDS.map((kind) => ({
    kind,
    entries: byKind.get(kind) ?? [],
  }))
}
