import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const REACH_IDS = [
  'weapon.longspear',
  'weapon.glaive',
  'weapon.guisarme',
  'weapon.lance',
  'weapon.ranseur',
  'weapon.whip',
] as const

describe('CRB W1: reach', () => {
  it('appends reach on matching weapons', () => {
    for (const id of REACH_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toContain('reach')
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toContain('reach')
    }
  })

  it('allows a reach-only row (N = 1) on weapons that are not also brace', () => {
    expect(resolve('item', 'weapon.glaive')?.weapon?.properties).toEqual(['reach'])
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })

  it('does not close the tag list to a seven-value enum', () => {
    const stamped = stamp('item', createEmptyItem(), 'weapon.longspear')
    stamped.weapon = {
      ...stamped.weapon,
      properties: ['reach', 'flaming'],
    }
    expect(stamped.weapon.properties).toEqual(['reach', 'flaming'])
  })
})

describe('CRB W1: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped longspear', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.longspear')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toContain('reach')
  })
})
