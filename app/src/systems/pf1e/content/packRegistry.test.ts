import { describe, expect, it } from 'vitest'
import { listRepoFiles, readRepoJson } from '../../../test/readRepoFile'
import {
  lookupClassProgression,
  lookupEvolution,
  lookupItem,
  registerClassPack,
  registerItemPack,
  type ClassProgression,
  type ItemCatalogRow,
} from './packRegistry'
// Importing the packs registers CRB + APG as a side effect.
import '.'

/**
 * Ids are one shared namespace per entity kind. Lookup previously scanned packs
 * in registration order and returned the first hit, so a second pack reusing an
 * id was silently shadowed instead of reported.
 */
describe('pack registry id namespace', () => {
  it('rejects a second pack that reuses a registered class id', () => {
    const shadow: ClassProgression = {
      id: 'class.wizard',
      name: 'Not the CRB wizard',
      hitDie: 12,
      babProgression: 'full',
      saves: { fortitude: 'good', reflex: 'good', will: 'good' },
      skillPointsPerLevel: 99,
      classSkills: [],
    }

    expect(() => registerClassPack([shadow])).toThrow(/class\.wizard/)
    // The real CRB row is still what lookup returns.
    expect(lookupClassProgression('class.wizard')?.hitDie).toBe(6)
  })

  it('rejects a second pack that reuses a registered item id', () => {
    const shadow: ItemCatalogRow = {
      id: 'weapon.longsword',
      name: 'Not the CRB longsword',
      kind: 'weapon',
      pounds: 999,
    }

    expect(() => registerItemPack([shadow])).toThrow(/weapon\.longsword/)
    expect(lookupItem('weapon.longsword')?.pounds).not.toBe(999)
  })

  it('treats a re-imported pack as a no-op even with fresh objects', () => {
    // A module re-evaluated under HMR rebuilds rows into new objects that are
    // equal but not identical, so an identity check would wrongly throw here.
    const build = (): ItemCatalogRow[] => [
      {
        id: 'item.registry-idempotency-probe',
        name: 'Probe',
        kind: 'item',
        pounds: 1,
      },
    ]

    registerItemPack(build())
    expect(() => registerItemPack(build())).not.toThrow()
    expect(lookupItem('item.registry-idempotency-probe')?.name).toBe('Probe')
  })

  it('still rejects a same-id row whose contents actually disagree', () => {
    const id = 'item.registry-conflict-probe'
    registerItemPack([{ id, name: 'Probe', kind: 'item', pounds: 1 }])
    // Same id, different weight: a genuine conflict, not a re-import.
    expect(() =>
      registerItemPack([{ id, name: 'Probe', kind: 'item', pounds: 99 }]),
    ).toThrow(new RegExp(id.replace('.', '\\.')))
    expect(lookupItem(id)?.pounds).toBe(1)
  })

  it('keeps every shipped pack id unique within its entity kind', () => {
    const seen = new Map<string, string>()
    const collisions: string[] = []

    for (const file of listRepoFiles('content/pf1e')) {
      const kind = file.split('/').pop()!
      if (kind === 'pack.json') continue
      const rows = readRepoJson(file) as Array<{ id: string }>
      for (const row of rows) {
        const key = `${kind}:${row.id}`
        const previous = seen.get(key)
        if (previous) collisions.push(`${row.id} in ${previous} and ${file}`)
        else seen.set(key, file)
      }
    }

    expect(seen.size).toBeGreaterThan(100)
    expect(collisions).toEqual([])
  })

  it('resolves APG rows that no golden or batch test references', () => {
    // These shipped without a user, so nothing caught a bad id until now.
    for (const id of [
      'evolution.improved-damage',
      'evolution.limbs-arms',
      'evolution.weapon-training',
    ]) {
      const found = lookupEvolution(id)
      expect(found, id).not.toBeNull()
      expect(found!.id).toBe(id)
      expect(found!.name.length).toBeGreaterThan(0)
    }
  })
})
