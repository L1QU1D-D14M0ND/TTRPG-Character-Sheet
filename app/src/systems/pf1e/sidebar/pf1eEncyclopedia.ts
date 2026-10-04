import { lookupOgcName, OGC_ENTRIES } from '../content/ogcPack'
import type { EncyclopediaGroup, EncyclopediaKind } from '../../../shell/sidebar/tools/encyclopedia/types'

const GROUP_KINDS: readonly EncyclopediaKind[] = [
  'spell',
  'feat',
  'feature',
  'affliction',
  'action',
]

export function buildPf1eEncyclopedia(): EncyclopediaGroup[] {
  const byKind = new Map<EncyclopediaKind, EncyclopediaGroup['entries']>(
    GROUP_KINDS.map((kind) => [kind, []]),
  )
  for (const entry of OGC_ENTRIES) {
    const name = lookupOgcName(entry)
    if (!name) continue
    byKind.get(entry.kind)?.push({ id: entry.id, name, body: entry.body })
  }
  return GROUP_KINDS.map((kind) => ({
    kind,
    entries: byKind.get(kind) ?? [],
  }))
}
