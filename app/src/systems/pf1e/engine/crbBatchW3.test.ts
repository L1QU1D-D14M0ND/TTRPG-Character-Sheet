import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const TRIP_IDS = [
  'weapon.sickle',
  'weapon.flail',
  'weapon.heavy-flail',
  'weapon.guisarme',
  'weapon.halberd',
  'weapon.scythe',
  'weapon.kama',
  'weapon.whip',
  'weapon.gnome-hooked-hammer',
  'weapon.dire-flail',
  'weapon.bolas',
] as const

const TRIP_ONLY_IDS = ['weapon.sickle', 'weapon.scythe'] as const

describe('CRB W3: trip', () => {
  it('appends trip on matching weapons', () => {
    for (const id of TRIP_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toContain('trip')
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toContain('trip')
    }
  })

  it('stamps trip as a one-tag list on weapons that only have trip', () => {
    for (const id of TRIP_ONLY_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toEqual(['trip'])
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toEqual(['trip'])
    }
  })

  it('appends trip without replacing reach on the guisarme', () => {
    expect(resolve('item', 'weapon.guisarme')?.weapon?.properties).toEqual([
      'reach',
      'trip',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.guisarme')
    expect(stamped.weapon?.properties).toEqual(['reach', 'trip'])
  })

  it('appends trip without replacing brace on the halberd', () => {
    expect(resolve('item', 'weapon.halberd')?.weapon?.properties).toEqual([
      'brace',
      'trip',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.halberd')
    expect(stamped.weapon?.properties).toEqual(['brace', 'trip'])
  })

  it('appends trip without replacing reach on the whip', () => {
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toContain('reach')
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toContain('trip')
  })

  it('keeps trip on flails after later tags append', () => {
    expect(resolve('item', 'weapon.flail')?.weapon?.properties).toContain('trip')
    expect(resolve('item', 'weapon.heavy-flail')?.weapon?.properties).toContain(
      'trip',
    )
    expect(resolve('item', 'weapon.dire-flail')?.weapon?.properties).toContain(
      'trip',
    )
  })

  it('keeps trip on the kama after later tags append', () => {
    expect(resolve('item', 'weapon.kama')?.weapon?.properties).toContain('trip')
  })

  it('keeps trip on the bolas after later tags append', () => {
    expect(resolve('item', 'weapon.bolas')?.weapon?.properties).toContain('trip')
  })

  it('keeps trip on the gnome hooked hammer after later tags append', () => {
    expect(
      resolve('item', 'weapon.gnome-hooked-hammer')?.weapon?.properties,
    ).toContain('trip')
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })
})

describe('CRB W3: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped kama', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.kama')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toContain('trip')
    expect(row.pounds).toBe(2)
  })
})
