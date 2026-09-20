import type { SpellListEntry } from '../character/types'
import { lookupSpell } from './packRegistry'

/**
 * Stamp catalog id, name, source, and spell level from any registered spell pack (CRB, APG, …).
 * Does not rewrite prepared flags, summaries, slots, or DCs.
 * Unknown id clears `spell.id` and leaves the rest of the row.
 */
export function applySpell(
  row: SpellListEntry,
  id: string | null,
): SpellListEntry {
  const found = lookupSpell(id)
  if (!found) {
    return {
      ...row,
      spell: { ...row.spell, id: null },
    }
  }
  return {
    ...row,
    spell: {
      id: found.id,
      name: found.name,
      source: found.source,
    },
    spellLevel: found.spellLevel,
  }
}

export { lookupSpell }
