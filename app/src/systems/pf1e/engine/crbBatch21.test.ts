import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import { resolve, stamp } from '../content'
import { compute } from './compute'

const HEAVY_ARMOR = [
  {
    id: 'armor.splint-mail',
    name: 'Splint mail',
    pounds: 45,
    armor: {
      acBonus: 7,
      maxDex: 0,
      armorCheckPenalty: -7,
      spellFailurePercent: 40,
    },
  },
  {
    id: 'armor.banded-mail',
    name: 'Banded mail',
    pounds: 35,
    armor: {
      acBonus: 7,
      maxDex: 1,
      armorCheckPenalty: -6,
      spellFailurePercent: 35,
    },
  },
  {
    id: 'armor.half-plate',
    name: 'Half-plate',
    pounds: 50,
    armor: {
      acBonus: 8,
      maxDex: 0,
      armorCheckPenalty: -7,
      spellFailurePercent: 40,
    },
  },
  {
    id: 'armor.full-plate',
    name: 'Full plate',
    pounds: 50,
    armor: {
      acBonus: 9,
      maxDex: 1,
      armorCheckPenalty: -6,
      spellFailurePercent: 35,
    },
  },
] as const

const SHIELDS = [
  {
    id: 'shield.buckler',
    name: 'Buckler',
    pounds: 5,
    shield: {
      acBonus: 1,
      maxDex: null,
      armorCheckPenalty: -1,
      spellFailurePercent: 5,
    },
  },
  {
    id: 'shield.light-wooden',
    name: 'Light wooden shield',
    pounds: 5,
    shield: {
      acBonus: 1,
      maxDex: null,
      armorCheckPenalty: -1,
      spellFailurePercent: 5,
    },
  },
  {
    id: 'shield.light-steel',
    name: 'Light steel shield',
    pounds: 6,
    shield: {
      acBonus: 1,
      maxDex: null,
      armorCheckPenalty: -1,
      spellFailurePercent: 5,
    },
  },
  {
    id: 'shield.heavy-wooden',
    name: 'Heavy wooden shield',
    pounds: 10,
    shield: {
      acBonus: 2,
      maxDex: null,
      armorCheckPenalty: -2,
      spellFailurePercent: 15,
    },
  },
  {
    id: 'shield.heavy-steel',
    name: 'Heavy steel shield',
    pounds: 15,
    shield: {
      acBonus: 2,
      maxDex: null,
      armorCheckPenalty: -2,
      spellFailurePercent: 15,
    },
  },
  {
    id: 'shield.tower',
    name: 'Tower shield',
    pounds: 45,
    shield: {
      acBonus: 4,
      maxDex: 2,
      armorCheckPenalty: -10,
      spellFailurePercent: 50,
    },
  },
] as const

describe('CRB batch 21: heavy armor', () => {
  it('stamps Medium CRB table numbers for heavy armor', () => {
    for (const row of HEAVY_ARMOR) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.id).toBe(row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.armor).toEqual(row.armor)
      expect(stamped.weapon).toBeUndefined()
      expect(stamped.shield).toBeUndefined()
    }
  })

  it('keeps packed chainmail and breastplate unchanged', () => {
    expect(resolve('item', 'armor.chainmail')?.armor?.acBonus).toBe(6)
    expect(resolve('item', 'armor.breastplate')?.armor).toMatchObject({
      acBonus: 6,
      maxDex: 3,
    })
  })
})

describe('CRB batch 21: shields', () => {
  it('stamps Medium CRB table numbers onto ItemEntry.shield', () => {
    for (const row of SHIELDS) {
      expect(resolve('item', row.id)).toMatchObject(row)
      const stamped = stamp('item', createEmptyItem(), row.id)
      expect(stamped.item.id).toBe(row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.shield).toEqual(row.shield)
      expect(stamped.armor).toBeUndefined()
      expect(stamped.weapon).toBeUndefined()
    }
  })

  it('gives the tower shield a Dex cap and 50% spell failure', () => {
    expect(resolve('item', 'shield.tower')?.shield).toEqual({
      acBonus: 4,
      maxDex: 2,
      armorCheckPenalty: -10,
      spellFailurePercent: 50,
    })
  })

  it('does not mint shield-bash weapon-table ids', () => {
    expect(resolve('item', 'weapon.light-shield')).toBeUndefined()
    expect(resolve('item', 'weapon.heavy-shield')).toBeUndefined()
  })

  it('clears armor when switching an equipped chainmail row to a buckler', () => {
    const chainmail = stamp('item', createEmptyItem(), 'armor.chainmail')
    const buckler = stamp('item', chainmail, 'shield.buckler')
    expect(buckler.shield?.acBonus).toBe(1)
    expect(buckler.armor).toBeUndefined()
    expect(buckler.weapon).toBeUndefined()
  })
})

describe('CRB batch 21: mundane extras', () => {
  it('stamps armor spikes and shield spikes as gear with published weight', () => {
    expect(resolve('item', 'item.armor-spikes')).toMatchObject({
      id: 'item.armor-spikes',
      name: 'Armor spikes',
      kind: 'item',
      pounds: 10,
    })
    expect(resolve('item', 'item.shield-spikes')).toMatchObject({
      id: 'item.shield-spikes',
      name: 'Shield spikes',
      kind: 'item',
      pounds: 5,
    })
    const spikes = stamp('item', createEmptyItem(), 'item.armor-spikes')
    expect(spikes.pounds).toBe(10)
    expect(spikes.weapon).toBeUndefined()
    expect(spikes.armor).toBeUndefined()
    expect(spikes.shield).toBeUndefined()
  })

  it('stamps a locked gauntlet as a 5 lb weapon with gauntlet dice', () => {
    expect(resolve('item', 'weapon.locked-gauntlet')).toMatchObject({
      id: 'weapon.locked-gauntlet',
      name: 'Locked gauntlet',
      pounds: 5,
      weapon: {
        damageDice: '1d3',
        damageType: 'bludgeoning',
        critRange: 20,
        critMultiplier: 2,
      },
    })
    expect(resolve('item', 'weapon.gauntlet')?.pounds).toBe(1)
  })
})

describe('CRB batch 21: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying equipped full plate and a tower shield', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const plate = stamp('item', createEmptyItem(), 'armor.full-plate')
    plate.location = 'equipped'
    const tower = stamp('item', createEmptyItem(), 'shield.tower')
    tower.location = 'equipped'
    character.inventory.items = [plate, tower]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(character.armorClass.armorBonus).toBe(0)
    expect(character.armorClass.shieldBonus).toBe(0)
    expect(view.ac).toBe(10)
    expect(plate.armor?.acBonus).toBe(9)
    expect(tower.shield?.acBonus).toBe(4)
    expect(tower.pounds).toBe(45)
  })

  it('round-trips a stamped tower shield through Save/Load', () => {
    const character = createEmptyCharacter()
    character.inventory.items = [
      stamp('item', createEmptyItem(), 'shield.tower'),
    ]
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.inventory.items[0]?.item.id).toBe('shield.tower')
    expect(reloaded.inventory.items[0]?.shield).toEqual({
      acBonus: 4,
      maxDex: 2,
      armorCheckPenalty: -10,
      spellFailurePercent: 50,
    })
  })
})
