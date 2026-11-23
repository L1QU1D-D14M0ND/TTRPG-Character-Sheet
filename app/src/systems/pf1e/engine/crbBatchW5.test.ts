import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const MONK_IDS = [
  'weapon.quarterstaff',
  'weapon.kama',
  'weapon.nunchaku',
  'weapon.sai',
  'weapon.siangham',
  'weapon.shuriken',
] as const

const MONK_ONLY_IDS = ['weapon.siangham', 'weapon.shuriken'] as const

describe('CRB W5: monk', () => {
  it('appends monk on matching weapons', () => {
    for (const id of MONK_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toContain('monk')
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toContain('monk')
    }
  })

  it('stamps monk as a one-tag list on weapons that only have monk', () => {
    for (const id of MONK_ONLY_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toEqual(['monk'])
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toEqual(['monk'])
    }
  })

  it('appends monk without replacing trip on the kama', () => {
    expect(resolve('item', 'weapon.kama')?.weapon?.properties).toEqual([
      'trip',
      'monk',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.kama')
    expect(stamped.weapon?.properties).toEqual(['trip', 'monk'])
  })

  it('appends monk without replacing disarm on the nunchaku and sai', () => {
    expect(resolve('item', 'weapon.nunchaku')?.weapon?.properties).toEqual([
      'disarm',
      'monk',
    ])
    expect(resolve('item', 'weapon.sai')?.weapon?.properties).toEqual([
      'disarm',
      'monk',
    ])
    const nunchaku = stamp('item', createEmptyItem(), 'weapon.nunchaku')
    const sai = stamp('item', createEmptyItem(), 'weapon.sai')
    expect(nunchaku.weapon?.properties).toEqual(['disarm', 'monk'])
    expect(sai.weapon?.properties).toEqual(['disarm', 'monk'])
  })

  it('keeps monk on the quarterstaff after later tags append', () => {
    expect(resolve('item', 'weapon.quarterstaff')?.weapon?.properties).toContain(
      'monk',
    )
  })

  it('does not pack nonlethal yet', () => {
    for (const id of MONK_IDS) {
      const tags = resolve('item', id)?.weapon?.properties ?? []
      expect(tags).not.toContain('nonlethal')
    }
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })
})

describe('CRB W5: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped siangham', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.siangham')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toEqual(['monk'])
    expect(row.pounds).toBe(1)
  })
})
