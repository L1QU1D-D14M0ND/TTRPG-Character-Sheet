import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptyFeat,
  createEmptyFeature,
  createEmptyItem,
} from '../character/createRows'
import { catalogId, groups, stamp, type CatalogKind } from './catalogIndex'
import { registerPack } from './packRegistry'

/**
 * Regression: `groups` lists rows from every registered pack, but `stamp` used
 * to route feat, feature, item, and race through CRB-only apply functions. A
 * non-CRB row showed in the picker and silently failed to stamp. Every row the
 * picker lists must stamp, whatever pack it came from.
 */
const PROBE = { book: 'PROBE' }

registerPack({
  feat: [
    { id: 'feat.probe-pack', name: 'Probe Feat', category: 'general', source: PROBE },
  ],
  feature: [{ id: 'feature.probe-pack', name: 'Probe Feature', source: PROBE }],
  item: [
    {
      id: 'weapon.probe-pack',
      name: 'Probe Blade',
      kind: 'weapon',
      pounds: 3,
      baseItemId: 'weapon.longsword',
      source: PROBE,
    },
  ],
  race: [{ id: 'race.probe-pack', name: 'Probe Folk', size: 'small', source: PROBE }],
})

function listed(kind: CatalogKind, id: string): boolean {
  return groups(kind).some((group) => group.rows.some((row) => row.id === id))
}

describe('catalog index stamps rows from any registered pack', () => {
  it('stamps a non-CRB feat the picker lists', () => {
    expect(listed('feat', 'feat.probe-pack')).toBe(true)
    const row = stamp('feat', createEmptyFeat(), 'feat.probe-pack')
    expect(catalogId('feat', row)).toBe('feat.probe-pack')
    expect(row.feat).toEqual({ id: 'feat.probe-pack', name: 'Probe Feat', source: PROBE })
  })

  it('stamps a non-CRB feature the picker lists', () => {
    expect(listed('feature', 'feature.probe-pack')).toBe(true)
    const row = stamp('feature', createEmptyFeature(), 'feature.probe-pack')
    expect(row.feature.id).toBe('feature.probe-pack')
  })

  it('stamps a non-CRB item and merges its base item from another pack', () => {
    expect(listed('item', 'weapon.probe-pack')).toBe(true)
    const row = stamp('item', createEmptyItem(), 'weapon.probe-pack')
    expect(row.item.id).toBe('weapon.probe-pack')
    expect(row.pounds).toBe(3)
    // Weapon stats come from the CRB longsword base row.
    expect(row.weapon?.damageDice).toBe('1d8')
  })

  it('stamps a non-CRB race and its size', () => {
    expect(listed('race', 'race.probe-pack')).toBe(true)
    const identity = stamp('race', createEmptyCharacter().identity, 'race.probe-pack')
    expect(identity.race.id).toBe('race.probe-pack')
    expect(identity.size).toBe('small')
  })
})
