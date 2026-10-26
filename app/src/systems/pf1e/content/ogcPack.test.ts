import { describe, expect, it } from 'vitest'
import { lookupOgcName, OGC_ENTRIES } from './ogcPack'
import { groups } from './catalogIndex'

/**
 * The encyclopedia pack is complete: every feat, feature, and spell the PF1e
 * content packs register has a `body` summary.
 *
 * This file used to carry a copy of every packed row, one `const` per content
 * batch, because the batches landed one per change and the roster was how we
 * checked each one. That roster grew to ~1030 lines restating ids and names
 * the mechanic packs already own, and the batch sequence it served is now
 * finished. The assertions below cover the same ground structurally: taken
 * together, "no packed id is unjoinable", "no mechanic row is unpacked", and
 * "no id appears twice" pin the pack to exactly the catalog, which is what the
 * roster was spelling out by hand.
 *
 * Verified by mutation: dropping a row, adding an unknown row, adding a
 * duplicate, mislabelling a kind, or padding a body each fail here.
 */

const KINDS = ['feat', 'spell', 'feature'] as const

/** Every id the content packs register, by catalog kind. */
function catalogIds(kind: (typeof KINDS)[number]): Set<string> {
  return new Set(groups(kind).flatMap((group) => group.rows).map((row) => row.id))
}

describe('PF1e OGC encyclopedia pack', () => {
  it('joins every packed id to a mechanic catalog row', () => {
    // An unjoinable id is otherwise silent: the encyclopedia drops the row.
    const orphans = OGC_ENTRIES.filter((entry) => lookupOgcName(entry) === null)
    expect(orphans.map((entry) => entry.id)).toEqual([])
  })

  it('leaves no mechanic row without a summary', () => {
    const packed = new Set(OGC_ENTRIES.map((entry) => entry.id))
    for (const kind of KINDS) {
      const missing = groups(kind)
        .flatMap((group) => group.rows)
        .filter((row) => !packed.has(row.id))
        .map((row) => row.name)
      expect(missing).toEqual([])
    }
  })

  it('rejects duplicate ids', () => {
    const ids = OGC_ENTRIES.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('packs exactly the catalog, with nothing extra and nothing missing', () => {
    for (const kind of KINDS) {
      const packed = OGC_ENTRIES.filter((entry) => entry.kind === kind).map((e) => e.id)
      expect([...packed].sort()).toEqual([...catalogIds(kind)].sort())
    }
  })

  it('covers the whole CRB and APG player catalog', () => {
    expect(OGC_ENTRIES.filter((entry) => entry.kind === 'feat')).toHaveLength(177)
    expect(OGC_ENTRIES.filter((entry) => entry.kind === 'feature')).toHaveLength(3)
    // 622 CRB spells plus 27 APG spells.
    expect(OGC_ENTRIES.filter((entry) => entry.kind === 'spell')).toHaveLength(649)
    expect(OGC_ENTRIES).toHaveLength(829)
  })

  it('prefixes every id with its kind', () => {
    const mismatched = OGC_ENTRIES.filter(
      (entry) => !entry.id.startsWith(`${entry.kind}.`),
    )
    expect(mismatched.map((entry) => entry.id)).toEqual([])
  })

  it('keeps every body a trimmed, non-empty summary', () => {
    const malformed = OGC_ENTRIES.filter(
      (entry) => entry.body.trim().length === 0 || entry.body !== entry.body.trim(),
    )
    expect(malformed.map((entry) => entry.id)).toEqual([])
  })

  it('still carries the smoke set, so the join is really wired up', () => {
    const byId = new Map(OGC_ENTRIES.map((entry) => [entry.id, entry]))
    for (const [id, name] of [
      ['spell.fireball', 'Fireball'],
      ['feat.power-attack', 'Power Attack'],
      ['feature.arcane-bond', 'Arcane Bond'],
      ['spell.evolution-surge', 'Evolution Surge'],
    ] as const) {
      const entry = byId.get(id)
      expect(entry, id).toBeDefined()
      expect(lookupOgcName(entry!)).toBe(name)
      expect(entry!.body.length).toBeGreaterThan(0)
    }
  })

  /**
   * Why the coverage assertion above is worth having: a mechanic row with no
   * summary is not a visible error. The sheet still offers it, the
   * encyclopedia simply omits it, and search finds nothing. Nobody notices
   * until a player goes looking for a rule that is missing, so the check has
   * to live in CI rather than rely on someone spotting a shorter list.
   */
  it('builds the encyclopedia from the summaries, not from the catalog', () => {
    const packed = new Set(OGC_ENTRIES.map((entry) => entry.id))
    for (const kind of KINDS) {
      const rows = groups(kind).flatMap((group) => group.rows)
      expect(rows.length).toBeGreaterThan(0)
      // Today these coincide. The encyclopedia is driven by the summaries, so
      // if they ever diverge the omission is silent in the UI.
      expect(rows.every((row) => packed.has(row.id))).toBe(true)
    }
  })
})
