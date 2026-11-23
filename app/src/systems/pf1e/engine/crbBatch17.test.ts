import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const MARTIAL_LIGHT = [
  {
    id: 'weapon.throwing-axe',
    name: 'Throwing axe',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 10,
    },
  },
  {
    id: 'weapon.light-hammer',
    name: 'Light hammer',
    pounds: 2,
    weapon: {
      damageDice: '1d4',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 20,
    },
  },
  {
    id: 'weapon.handaxe',
    name: 'Handaxe',
    pounds: 3,
    weapon: {
      damageDice: '1d6',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 3,
    },
  },
  {
    id: 'weapon.kukri',
    name: 'Kukri',
    pounds: 2,
    weapon: {
      damageDice: '1d4',
      damageType: 'slashing',
      critRange: 18,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.light-pick',
    name: 'Light pick',
    pounds: 3,
    weapon: {
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 4,
    },
  },
  {
    id: 'weapon.sap',
    name: 'Sap',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      properties: ['nonlethal'],
    },
  },
  {
    id: 'weapon.starknife',
    name: 'Starknife',
    pounds: 3,
    weapon: {
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 3,
      rangeFeet: 20,
    },
  },
  {
    id: 'weapon.short-sword',
    name: 'Short sword',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
    },
  },
] as const

const MARTIAL_ONE_HANDED = [
  {
    id: 'weapon.battleaxe',
    name: 'Battleaxe',
    pounds: 6,
    weapon: {
      damageDice: '1d8',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 3,
    },
  },
  {
    id: 'weapon.flail',
    name: 'Flail',
    pounds: 5,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      properties: ['trip', 'disarm'],
    },
  },
  {
    id: 'weapon.heavy-pick',
    name: 'Heavy pick',
    pounds: 6,
    weapon: {
      damageDice: '1d6',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 4,
    },
  },
  {
    id: 'weapon.rapier',
    name: 'Rapier',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'piercing',
      critRange: 18,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.scimitar',
    name: 'Scimitar',
    pounds: 4,
    weapon: {
      damageDice: '1d6',
      damageType: 'slashing',
      critRange: 18,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.trident',
    name: 'Trident',
    pounds: 4,
    weapon: {
      damageDice: '1d8',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 10,
      properties: ['brace'],
    },
  },
  {
    id: 'weapon.warhammer',
    name: 'Warhammer',
    pounds: 5,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 3,
    },
  },
] as const

describe('CRB batch 17: martial light', () => {
  it('stamps Medium CRB table numbers for martial light weapons', () => {
    for (const row of MARTIAL_LIGHT) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.weapon).toEqual(row.weapon)
    }
  })

  it('does not pack shield-bash or spiked-armor weapon-table lines', () => {
    expect(resolve('item', 'weapon.light-shield')).toBeUndefined()
    expect(resolve('item', 'weapon.spiked-armor')).toBeUndefined()
    expect(resolve('item', 'weapon.light-spiked-shield')).toBeUndefined()
  })
})

describe('CRB batch 17: remaining martial one-handed', () => {
  it('stamps Medium CRB table numbers for the remaining martial one-handed weapons', () => {
    for (const row of MARTIAL_ONE_HANDED) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.weapon).toEqual(row.weapon)
      expect(stamped.pounds).toBe(row.pounds)
    }
  })

  it('keeps packed longsword and skips shield-bash ids', () => {
    expect(resolve('item', 'weapon.longsword')?.weapon).toMatchObject({
      damageDice: '1d8',
      critRange: 19,
      critMultiplier: 2,
    })
    expect(resolve('item', 'weapon.heavy-shield')).toBeUndefined()
    expect(resolve('item', 'weapon.heavy-spiked-shield')).toBeUndefined()
  })

  it('leaves later gear unknown', () => {
    expect(resolve('item', 'item.bedroll')).toBeUndefined()
  })
})

describe('CRB batch 17: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped rapier', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'weapon.rapier')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.damageDice).toBe('1d6')
    expect(row.weapon?.critRange).toBe(18)
    expect(row.pounds).toBe(2)
  })
})
