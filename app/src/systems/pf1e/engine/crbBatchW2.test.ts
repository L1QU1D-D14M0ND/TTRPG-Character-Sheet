import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const BRACE_ONLY_IDS = ['weapon.spear', 'weapon.trident'] as const

describe('CRB W2: brace', () => {
  it('appends brace without replacing reach on the longspear', () => {
    expect(resolve('item', 'weapon.longspear')?.weapon?.properties).toEqual([
      'reach',
      'brace',
    ])
    const stamped = stamp('item', createEmptyItem(), 'weapon.longspear')
    expect(stamped.weapon?.properties).toEqual(['reach', 'brace'])
  })

  it('stamps brace as a one-tag list on weapons that only have brace', () => {
    for (const id of BRACE_ONLY_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toEqual(['brace'])
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toEqual(['brace'])
    }
  })

  it('keeps brace on the halberd after later tags append', () => {
    expect(resolve('item', 'weapon.halberd')?.weapon?.properties).toContain(
      'brace',
    )
  })

  it('keeps brace on the dwarven urgrosh after later tags append', () => {
    expect(resolve('item', 'weapon.dwarven-urgrosh')?.weapon?.properties).toContain(
      'brace',
    )
  })

  it('leaves non-brace reach weapons with reach still present', () => {
    expect(resolve('item', 'weapon.glaive')?.weapon?.properties).toEqual([
      'reach',
    ])
    expect(resolve('item', 'weapon.lance')?.weapon?.properties).toContain('reach')
    expect(resolve('item', 'weapon.whip')?.weapon?.properties).toContain('reach')
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })
})

describe('CRB W2: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped spear', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.spear')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toEqual(['brace'])
    expect(row.pounds).toBe(6)
  })
})
