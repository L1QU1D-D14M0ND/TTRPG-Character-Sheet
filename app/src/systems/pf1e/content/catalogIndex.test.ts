import { describe, expect, it } from 'vitest'
import { createEmptyFeat, createEmptyItem } from '../character/createRows'
import { groups, resolve, stamp } from './catalogIndex'

describe('catalog index', () => {
  it('resolves a CRB weapon with its catalog properties', () => {
    const glaive = resolve('item', 'weapon.glaive')
    expect(glaive?.name).toBe('Glaive')
    expect(glaive?.weapon?.properties).toContain('reach')
    expect(resolve('item', 'weapon.no-such-blade')).toBeUndefined()
    expect(resolve('item', null)).toBeUndefined()
  })

  it('resolves an APG spell through the same lookup as a CRB class', () => {
    expect(resolve('spell', 'spell.summon-eidolon')?.spellLevel).toBe(2)
    expect(resolve('spell', 'spell.summon-eidolon')?.source?.book).toBe('APG')
    expect(resolve('class', 'class.fighter')?.hitDie).toBe(10)
    expect(resolve('class', 'class.summoner')?.name).toBe('Summoner')
  })

  it('lists spells as CRB then APG and evolutions as one unlabeled group', () => {
    const spells = groups('spell')
    expect(spells.map((group) => group.labelKey)).toEqual([
      'pf1e.identity.optgroupCrb',
      'pf1e.identity.optgroupApg',
    ])
    expect(spells[0]?.rows.some((row) => row.id === 'spell.mage-armor')).toBe(
      true,
    )
    expect(spells[0]?.rows[0]?.detail).toBe('0')

    const evolutions = groups('evolution')
    expect(evolutions).toHaveLength(1)
    expect(evolutions[0]?.labelKey).toBeUndefined()
    expect(evolutions[0]?.rows.length).toBeGreaterThan(0)
  })

  it('stamps item mechanics onto the host and clears a feat id', () => {
    const stamped = stamp('item', createEmptyItem(), 'weapon.glaive')
    expect(stamped.item.id).toBe('weapon.glaive')
    expect(stamped.weapon?.properties).toContain('reach')

    const feat = stamp('feat', createEmptyFeat(), 'feat.power-attack')
    expect(stamp('feat', feat, null).feat.id).toBeNull()
    expect(stamp('feat', feat, null).feat.name).toBe('Power Attack')
  })
})
