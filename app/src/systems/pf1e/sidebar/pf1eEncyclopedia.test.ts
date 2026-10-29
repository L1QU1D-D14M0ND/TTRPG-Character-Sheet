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

describe('PF1e encyclopedia in a localized UI (Phase 5.2)', () => {
  it('labels entries with the curated name and keeps the English one', () => {
    const groups = buildPf1eEncyclopedia('es')
    const spells = groups.find((group) => group.kind === 'spell')!
    const fireball = spells.entries.find(
      (entry) => entry.id === 'spell.fireball',
    )!
    expect(fireball.name).toBe('Bola de fuego')
    expect(fireball.altName).toBe('Fireball')
  })

  it('leaves the prose body in English', () => {
    // `body` is Open Game Content under the notice in content/pf1e/ogc/.
    // Translating prose is a different slice with a different licence bar.
    for (const group of buildPf1eEncyclopedia('es')) {
      for (const entry of group.entries) {
        const packed = OGC_ENTRIES.find((row) => row.id === entry.id)!
        expect(entry.body).toBe(packed.body)
      }
    }
  })

  it('carries no altName when the UI is English', () => {
    for (const group of buildPf1eEncyclopedia('en')) {
      for (const entry of group.entries) {
        expect(entry.altName).toBeUndefined()
      }
    }
  })

  it('translates every entry it ships', () => {
    const untranslated = buildPf1eEncyclopedia('es')
      .flatMap((group) => group.entries)
      .filter((entry) => entry.altName === undefined)
      .map((entry) => entry.id)
    expect(untranslated).toEqual([])
  })
})
