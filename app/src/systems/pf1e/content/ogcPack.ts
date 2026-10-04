import entriesSchema from '../../../../../schemas/content/pf1e/entries.schema.json'
import entriesJson from '../../../../../content/pf1e/ogc/entries.json'
import { loadCatalog } from './loadCatalog'
import { lookupFeat, lookupFeature, lookupSpell } from './packRegistry'
import './crbPack'
import './apgPack'

export type OgcKind = 'spell' | 'feat' | 'feature'

export interface OgcEntry {
  id: string
  kind: OgcKind
  body: string
}

const rows = loadCatalog<OgcEntry[]>(
  entriesSchema,
  entriesJson,
  'content/pf1e/ogc/entries.json',
)

export const OGC_ENTRIES: readonly OgcEntry[] = rows

export function lookupOgcName(entry: OgcEntry): string | null {
  if (entry.kind === 'spell') return lookupSpell(entry.id)?.name ?? null
  if (entry.kind === 'feat') return lookupFeat(entry.id)?.name ?? null
  return lookupFeature(entry.id)?.name ?? null
}
