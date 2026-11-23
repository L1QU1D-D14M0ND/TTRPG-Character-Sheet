import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const DISARM_IDS = [
  'weapon.flail',
  'weapon.heavy-flail',
  'weapon.ranseur',
  'weapon.nunchaku',
  'weapon.sai',
  'weapon.whip',
  'weapon.dire-flail',
] as const

describe('CRB W4: disarm', () => {
  it('appends disarm on matching weapons', () => {
    for (const id of DISARM_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toContain('disarm')
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toContain('disarm')
    }
  })

  it('keeps disarm on nunchaku and sai after later tags append', () => {
    expect(resolve('item', 'weapon.nunchaku')?.weapon?.properties).toContain(
      'disarm',
    )
    expect(resolve('item', 'weapon.sai')?.weapon?.properties).toContain('disarm')
  })

  it('appends disarm without replacing trip on the flail and heavy flail', () => {
    expect(resolve('item', 'weapon.flail')?.weapon?.properties).toEqual([
      'trip',
      'disarm',
    ])
    expect(resolve('item', 'weapon.heavy-flail')?.weapon?.properties).toEqual([
      'trip',
      'disarm',
    ])
  })

  it('appends disarm without replacing reach on the ranseur', () => {
    expect(resolve('item', 'weapon.ranseur')?.weapon?.properties).toEqual([
      'reach',
      'disarm',
    ])
  })

  it('appends disarm without replacing reach or trip on the whip', () => {
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toContain('reach')
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toContain('trip')
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toContain('disarm')
  })

  it('appends disarm without replacing trip on the dire flail', () => {
    expect(resolve('item', 'weapon.dire-flail')?.weapon?.properties).toContain(
      'trip',
    )
    expect(resolve('item', 'weapon.dire-flail')?.weapon?.properties).toContain(
      'disarm',
    )
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })
})

describe('CRB W4: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped nunchaku', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.nunchaku')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toContain('disarm')
    expect(row.pounds).toBe(2)
  })
})
