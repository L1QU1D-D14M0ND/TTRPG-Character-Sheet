import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const LIGHT_ARMOR = [
  {
    id: 'armor.padded',
    name: 'Padded',
    pounds: 10,
    armor: {
      acBonus: 1,
      maxDex: 8,
      armorCheckPenalty: 0,
      spellFailurePercent: 5,
    },
  },
  {
    id: 'armor.leather',
    name: 'Leather',
    pounds: 15,
    armor: {
      acBonus: 2,
      maxDex: 6,
      armorCheckPenalty: 0,
      spellFailurePercent: 10,
    },
  },
  {
    id: 'armor.studded-leather',
    name: 'Studded leather',
    pounds: 20,
    armor: {
      acBonus: 3,
      maxDex: 5,
      armorCheckPenalty: -1,
      spellFailurePercent: 15,
    },
  },
] as const

const MEDIUM_ARMOR = [
  {
    id: 'armor.hide',
    name: 'Hide',
    pounds: 25,
    armor: {
      acBonus: 4,
      maxDex: 4,
      armorCheckPenalty: -3,
      spellFailurePercent: 20,
    },
  },
  {
    id: 'armor.scale-mail',
    name: 'Scale mail',
    pounds: 30,
    armor: {
      acBonus: 5,
      maxDex: 3,
      armorCheckPenalty: -4,
      spellFailurePercent: 25,
    },
  },
  {
    id: 'armor.breastplate',
    name: 'Breastplate',
    pounds: 30,
    armor: {
      acBonus: 6,
      maxDex: 3,
      armorCheckPenalty: -4,
      spellFailurePercent: 25,
    },
  },
] as const

describe('CRB batch 20: remaining light armor', () => {
  it('stamps Medium CRB table numbers for remaining light armor', () => {
    for (const row of LIGHT_ARMOR) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.id).toBe(row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.armor).toEqual(row.armor)
      expect(stamped.weapon).toBeUndefined()
    }
  })

  it('keeps packed chain shirt unchanged', () => {
    expect(resolve('item', 'armor.chain-shirt')).toMatchObject({
      name: 'Chain shirt',
      pounds: 25,
      armor: {
        acBonus: 4,
        maxDex: 4,
        armorCheckPenalty: -2,
        spellFailurePercent: 20,
      },
    })
  })
})

describe('CRB batch 20: remaining medium armor', () => {
  it('stamps Medium CRB table numbers for remaining medium armor', () => {
    for (const row of MEDIUM_ARMOR) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.id).toBe(row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.armor).toEqual(row.armor)
      expect(stamped.weapon).toBeUndefined()
    }
  })

  it('keeps packed chainmail unchanged', () => {
    expect(resolve('item', 'armor.chainmail')).toMatchObject({
      name: 'Chainmail',
      pounds: 40,
      armor: {
        acBonus: 6,
        maxDex: 2,
        armorCheckPenalty: -5,
        spellFailurePercent: 30,
      },
    })
  })

  it('leaves later gear unknown', () => {
    expect(resolve('item', 'item.bedroll')).toBeUndefined()
  })
})

describe('CRB batch 20: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying equipped breastplate', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = stamp('item', createEmptyItem(), 'armor.breastplate')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(character.armorClass.armorBonus).toBe(0)
    expect(view.ac).toBe(10)
    expect(view.touchAc).toBe(10)
    expect(view.flatFootedAc).toBe(10)
    expect(row.armor?.acBonus).toBe(6)
    expect(row.pounds).toBe(30)
  })
})
