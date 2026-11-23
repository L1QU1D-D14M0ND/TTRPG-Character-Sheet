import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const DOUBLE_IDS = [
  'weapon.quarterstaff',
  'weapon.orc-double-axe',
  'weapon.dire-flail',
  'weapon.gnome-hooked-hammer',
  'weapon.two-bladed-sword',
  'weapon.dwarven-urgrosh',
] as const

const DOUBLE_ONLY_IDS = [
  'weapon.orc-double-axe',
  'weapon.two-bladed-sword',
] as const

const SECOND_HEADS = {
  'weapon.quarterstaff': {
    damageDice: '1d6',
    damageType: 'bludgeoning',
    critRange: 20,
    critMultiplier: 2,
  },
  'weapon.orc-double-axe': {
    damageDice: '1d8',
    damageType: 'slashing',
    critRange: 20,
    critMultiplier: 3,
  },
  'weapon.dire-flail': {
    damageDice: '1d8',
    damageType: 'bludgeoning',
    critRange: 20,
    critMultiplier: 2,
  },
  'weapon.gnome-hooked-hammer': {
    damageDice: '1d6',
    damageType: 'piercing',
    critRange: 20,
    critMultiplier: 4,
  },
  'weapon.two-bladed-sword': {
    damageDice: '1d8',
    damageType: 'slashing',
    critRange: 19,
    critMultiplier: 2,
  },
  'weapon.dwarven-urgrosh': {
    damageDice: '1d6',
    damageType: 'piercing',
    critRange: 20,
    critMultiplier: 3,
  },
} as const

describe('CRB W7: double', () => {
  it('appends double on matching weapons', () => {
    for (const id of DOUBLE_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toContain('double')
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toContain('double')
    }
  })

  it('stamps double as a one-tag list on weapons that only have double', () => {
    for (const id of DOUBLE_ONLY_IDS) {
      expect(resolve('item', id)?.weapon?.properties).toEqual(['double'])
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.properties).toEqual(['double'])
    }
  })

  it('appends double without replacing monk on the quarterstaff', () => {
    expect(resolve('item', 'weapon.quarterstaff')?.weapon?.properties).toEqual([
      'monk',
      'double',
    ])
  })

  it('appends double without replacing trip or disarm on the dire flail', () => {
    expect(resolve('item', 'weapon.dire-flail')?.weapon?.properties).toEqual([
      'trip',
      'disarm',
      'double',
    ])
  })

  it('appends double without replacing trip on the gnome hooked hammer', () => {
    expect(resolve('item', 'weapon.gnome-hooked-hammer')?.weapon?.properties).toEqual(
      ['trip', 'double'],
    )
  })

  it('appends double without replacing brace on the dwarven urgrosh', () => {
    expect(resolve('item', 'weapon.dwarven-urgrosh')?.weapon?.properties).toEqual([
      'brace',
      'double',
    ])
  })

  it('leaves unrelated weapons without a properties field', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'properties',
    )
  })
})

describe('CRB W7: second documentary head', () => {
  it('stamps Medium CRB second-head numbers without rewriting the primary dice string', () => {
    for (const id of DOUBLE_IDS) {
      const found = resolve('item', id)?.weapon
      expect(found?.damageDice).toBeDefined()
      expect(found?.damageDice).not.toContain('/')
      expect(found?.secondHead).toEqual(SECOND_HEADS[id])
      const stamped = stamp('item', createEmptyItem(), id)
      expect(stamped.weapon?.damageDice).not.toContain('/')
      expect(stamped.weapon?.secondHead).toEqual(SECOND_HEADS[id])
    }
  })

  it('does not add a second head on a single-headed weapon', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).not.toHaveProperty(
      'secondHead',
    )
    const stamped = stamp('item', createEmptyItem(), 'weapon.longsword')
    expect(stamped.weapon).not.toHaveProperty('secondHead')
  })
})

describe('CRB W7: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped two-bladed sword', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.two-bladed-sword')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.properties).toEqual(['double'])
    expect(row.weapon?.secondHead).toEqual({
      damageDice: '1d8',
      damageType: 'slashing',
      critRange: 19,
      critMultiplier: 2,
    })
    expect(row.pounds).toBe(10)
  })
})
