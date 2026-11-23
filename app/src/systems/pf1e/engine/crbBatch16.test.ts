import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const SIMPLE_MELEE = [
  {
    id: 'weapon.gauntlet',
    name: 'Gauntlet',
    pounds: 1,
    weapon: {
      damageDice: '1d3',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.punching-dagger',
    name: 'Punching dagger',
    pounds: 1,
    weapon: {
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 3,
    },
  },
  {
    id: 'weapon.spiked-gauntlet',
    name: 'Spiked gauntlet',
    pounds: 1,
    weapon: {
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.light-mace',
    name: 'Light mace',
    pounds: 4,
    weapon: {
      damageDice: '1d6',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.sickle',
    name: 'Sickle',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 2,
      properties: ['trip'],
    },
  },
  {
    id: 'weapon.club',
    name: 'Club',
    pounds: 3,
    weapon: {
      damageDice: '1d6',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 10,
    },
  },
  {
    id: 'weapon.heavy-mace',
    name: 'Heavy mace',
    pounds: 8,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.morningstar',
    name: 'Morningstar',
    pounds: 6,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning and piercing',
      critRange: 20,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.shortspear',
    name: 'Shortspear',
    pounds: 3,
    weapon: {
      damageDice: '1d6',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 20,
    },
  },
  {
    id: 'weapon.longspear',
    name: 'Longspear',
    pounds: 9,
    weapon: {
      damageDice: '1d8',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 3,
      properties: ['reach', 'brace'],
    },
  },
  {
    id: 'weapon.spear',
    name: 'Spear',
    pounds: 6,
    weapon: {
      damageDice: '1d8',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 3,
      rangeFeet: 20,
      properties: ['brace'],
    },
  },
] as const

const SIMPLE_RANGED = [
  {
    id: 'weapon.blowgun',
    name: 'Blowgun',
    pounds: 1,
    weapon: {
      damageDice: '1d2',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 20,
    },
  },
  {
    id: 'weapon.heavy-crossbow',
    name: 'Heavy crossbow',
    pounds: 8,
    weapon: {
      damageDice: '1d10',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
      rangeFeet: 120,
    },
  },
  {
    id: 'weapon.light-crossbow',
    name: 'Light crossbow',
    pounds: 4,
    weapon: {
      damageDice: '1d8',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
      rangeFeet: 80,
    },
  },
  {
    id: 'weapon.dart',
    name: 'Dart',
    pounds: 0.5,
    weapon: {
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 20,
    },
  },
  {
    id: 'weapon.javelin',
    name: 'Javelin',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 30,
    },
  },
  {
    id: 'weapon.sling',
    name: 'Sling',
    pounds: 0,
    weapon: {
      damageDice: '1d4',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 50,
    },
  },
] as const

const SIMPLE_AMMO = [
  { id: 'item.blowgun-darts', name: 'Blowgun darts', pounds: 1 },
  { id: 'item.crossbow-bolts', name: 'Crossbow bolts', pounds: 1 },
  { id: 'item.sling-bullets', name: 'Sling bullets', pounds: 5 },
] as const

describe('CRB batch 16: remaining simple melee', () => {
  it('stamps Medium CRB table numbers for the remaining simple melee weapons', () => {
    for (const row of SIMPLE_MELEE) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.id).toBe(row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.weapon).toEqual(row.weapon)
      expect(stamped.armor).toBeUndefined()
    }
  })

  it('does not add unarmed strike or packed dagger/quarterstaff as new ids', () => {
    expect(resolve('item', 'weapon.unarmed-strike')).toBeUndefined()
    expect(resolve('item', 'weapon.dagger')?.weapon?.damageDice).toBe('1d4')
    expect(resolve('item', 'weapon.quarterstaff')?.weapon).toEqual({
      damageDice: '1d6',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      properties: ['monk', 'double'],
      secondHead: {
        damageDice: '1d6',
        damageType: 'bludgeoning',
        critRange: 20,
        critMultiplier: 2,
      },
    })
  })
})

describe('CRB batch 16: simple ranged and ammo', () => {
  it('stamps Medium CRB table numbers for simple ranged weapons', () => {
    for (const row of SIMPLE_RANGED) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.weapon).toEqual(row.weapon)
      expect(stamped.pounds).toBe(row.pounds)
    }
  })

  it('stamps ammo as gear with the published bundle weight', () => {
    for (const row of SIMPLE_AMMO) {
      expect(resolve('item', row.id)).toMatchObject({
        id: row.id,
        name: row.name,
        kind: 'item',
        pounds: row.pounds,
      })
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.id).toBe(row.id)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.weapon).toBeUndefined()
      expect(stamped.armor).toBeUndefined()
    }
  })

  it('leaves later gear unknown', () => {
    expect(resolve('item', 'item.bedroll')).toBeUndefined()
  })
})

describe('CRB batch 16: Combat stays typed', () => {
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
    expect(row.weapon?.damageDice).toBe('1d8')
    expect(row.weapon?.critMultiplier).toBe(3)
    expect(row.weapon?.rangeFeet).toBe(20)
  })
})
