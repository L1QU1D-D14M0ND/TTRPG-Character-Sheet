import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const NONLETHAL_IDS = ['weapon.sap', 'weapon.whip', 'weapon.bolas'] as const

describe('CRB W6: nonlethal', () => {
  it('appends nonlethal on matching weapons', () => {
    for (const id of NONLETHAL_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toContain('nonlethal')
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toContain('nonlethal')
    }
  })

  it('stamps nonlethal as a one-tag list on the sap', () => {
    expect(resolve('item', 'weapon.sap')?.weapon?.properties).toEqual([
      'nonlethal',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.sap')
    expect(stamped.weapon?.properties).toEqual(['nonlethal'])
  })

  it('appends nonlethal without replacing trip on the bolas', () => {
    expect(resolve('item', 'weapon.bolas')?.weapon?.properties).toEqual([
      'trip',
      'nonlethal',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.bolas')
    expect(stamped.weapon?.properties).toEqual(['trip', 'nonlethal'])
  })

  it('appends nonlethal without replacing reach, trip, or disarm on the whip', () => {
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toEqual([
      'reach',
      'trip',
      'disarm',
      'nonlethal',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.whip')
    expect(stamped.weapon?.properties).toEqual([
      'reach',
      'trip',
      'disarm',
      'nonlethal',
    ])
  })

  it('does not tag nonlethal weapons with double', () => {
    for (const id of NONLETHAL_IDS) {
      const tags = resolve('item', id)?.weapon?.properties ?? []
      expect(tags).not.toContain('double')
    }
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })
})

describe('CRB W6: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped sap', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.sap')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toEqual(['nonlethal'])
    expect(row.pounds).toBe(2)
  })
})
