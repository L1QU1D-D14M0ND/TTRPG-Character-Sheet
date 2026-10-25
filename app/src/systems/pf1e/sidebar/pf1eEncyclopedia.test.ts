import { describe, expect, it } from 'vitest'
import { buildPf1eEncyclopedia } from './pf1eEncyclopedia'
import { lookupOgcName, OGC_ENTRIES } from '../content/ogcPack'

/**
 * The packed roster itself is owned by `content/ogcPack.test.ts`. Restating
 * every name here would mean each new content batch had to edit two long
 * lists, so these tests check what the builder does to the pack instead.
 */
describe('PF1e encyclopedia tool', () => {
  it('groups every packed entry under its own kind', () => {
    const groups = buildPf1eEncyclopedia()
    for (const kind of ['spell', 'feat', 'feature'] as const) {
      const expected = OGC_ENTRIES.filter((entry) => entry.kind === kind)
      const group = groups.find((candidate) => candidate.kind === kind)
      expect(group?.entries.map((entry) => entry.id).sort()).toEqual(
        expected.map((entry) => entry.id).sort(),
      )
    }
  })

  it('keeps the spell, feat, and feature groups non-empty and the rest empty', () => {
    const groups = buildPf1eEncyclopedia()
    const size = (kind: string) =>
      groups.find((group) => group.kind === kind)?.entries.length
    expect(size('spell')).toBeGreaterThan(0)
    expect(size('feat')).toBeGreaterThan(0)
    expect(size('feature')).toBeGreaterThan(0)
    // Afflictions and Actions have no packed batches yet, but still render.
    expect(size('affliction')).toBe(0)
    expect(size('action')).toBe(0)
  })

  it('exposes all five groups in a stable order', () => {
    expect(buildPf1eEncyclopedia().map((group) => group.kind)).toEqual([
      'spell',
      'feat',
      'feature',
      'affliction',
      'action',
    ])
  })

  it('carries the catalog name and body through to every entry', () => {
    for (const group of buildPf1eEncyclopedia()) {
      for (const entry of group.entries) {
        const packed = OGC_ENTRIES.find((row) => row.id === entry.id)
        expect(entry.name).toBe(lookupOgcName(packed!))
        expect(entry.body).toBe(packed!.body)
      }
    }
  })

  it('still carries the smoke set, so the join is really wired up', () => {
    const groups = buildPf1eEncyclopedia()
    const names = (kind: string) =>
      groups.find((group) => group.kind === kind)?.entries.map((entry) => entry.name)
    expect(names('spell')).toContain('Fireball')
    expect(names('feat')).toContain('Power Attack')
    expect(names('feature')).toContain('Arcane Bond')
  })
})
