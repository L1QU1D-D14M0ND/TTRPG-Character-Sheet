import { describe, expect, it } from 'vitest'
import { createEmptyFeat, createEmptyItem } from '../character/createRows'
import { applyCrbFeat } from '../content'
import {
  catalogId,
  matchesName,
  SEARCH_ROW_THRESHOLD,
  setCatalogName,
  showsSearch,
  stamp,
} from './catalogPicker'

describe('catalog picker kinds', () => {
  it('matches names case-insensitively and ignores surrounding space', () => {
    expect(matchesName('Fireball', 'fire')).toBe(true)
    expect(matchesName('Fireball', ' BALL ')).toBe(true)
    expect(matchesName('Fireball', 'missile')).toBe(false)
    expect(matchesName('Fireball', '')).toBe(true)
  })

  it('shows search only for kinds larger than the threshold', () => {
    expect(SEARCH_ROW_THRESHOLD).toBe(12)
    expect(showsSearch('feature')).toBe(false)
    expect(showsSearch('evolution')).toBe(false)
    expect(showsSearch('feat')).toBe(true)
    expect(showsSearch('item')).toBe(true)
    expect(showsSearch('spell')).toBe(true)
  })

  it('stamps a feat host and can rename it without changing id', () => {
    const stamped = stamp('feat', createEmptyFeat(), 'feat.power-attack')
    expect(stamped.feat.id).toBe('feat.power-attack')
    expect(stamped.feat.name).toBe('Power Attack')
    expect(stamped.category).toBe('combat')
    const renamed = setCatalogName('feat', stamped, 'Custom PA')
    expect(renamed.feat.id).toBe('feat.power-attack')
    expect(renamed.feat.name).toBe('Custom PA')
  })

  it('clears the catalog id on Custom without dropping the typed name', () => {
    const row = applyCrbFeat(createEmptyFeat(), 'feat.power-attack')
    const custom = stamp('feat', row, null)
    expect(catalogId('feat', custom)).toBeNull()
    expect(custom.feat.name).toBe('Power Attack')
  })

  it('stamps item overlay fields from the catalog', () => {
    const stamped = stamp('item', createEmptyItem(), 'weapon.kama')
    expect(stamped.item.name).toBe('Kama')
    expect(stamped.weapon?.properties).toEqual(['trip', 'monk'])
  })
})
