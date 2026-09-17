import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyItem } from '../character/createRows'
import { applyCrbItem, lookupCrbItem } from '../content'
import { compute } from './compute'

const EXOTIC_MELEE = [
  {
    id: 'weapon.kama',
    name: 'Kama',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 2,
      properties: ['trip', 'monk'],
    },
  },
  {
    id: 'weapon.nunchaku',
    name: 'Nunchaku',
    pounds: 2,
    weapon: {
      damageDice: '1d6',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      properties: ['disarm', 'monk'],
    },
  },
  {
    id: 'weapon.sai',
    name: 'Sai',
    pounds: 1,
    weapon: {
      damageDice: '1d4',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      properties: ['disarm', 'monk'],
    },
  },
  {
    id: 'weapon.siangham',
    name: 'Siangham',
    pounds: 1,
    weapon: {
      damageDice: '1d6',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      properties: ['monk'],
    },
  },
  {
    id: 'weapon.bastard-sword',
    name: 'Bastard sword',
    pounds: 6,
    weapon: {
      damageDice: '1d10',
      damageType: 'slashing',
      critRange: 19,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.dwarven-waraxe',
    name: 'Dwarven waraxe',
    pounds: 8,
    weapon: {
      damageDice: '1d10',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 3,
    },
  },
  {
    id: 'weapon.whip',
    name: 'Whip',
    pounds: 2,
    weapon: {
      damageDice: '1d3',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 2,
      properties: ['reach', 'trip', 'disarm', 'nonlethal'],
    },
  },
  {
    id: 'weapon.orc-double-axe',
    name: 'Orc double axe',
    pounds: 15,
    weapon: {
      damageDice: '1d8',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 3,
      properties: ['double'],
      secondHead: {
        damageDice: '1d8',
        damageType: 'slashing',
        critRange: 20,
        critMultiplier: 3,
      },
    },
  },
  {
    id: 'weapon.elven-curve-blade',
    name: 'Elven curve blade',
    pounds: 7,
    weapon: {
      damageDice: '1d10',
      damageType: 'slashing',
      critRange: 18,
      critMultiplier: 2,
    },
  },
  {
    id: 'weapon.dire-flail',
    name: 'Dire flail',
    pounds: 10,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      properties: ['trip', 'disarm', 'double'],
      secondHead: {
        damageDice: '1d8',
        damageType: 'bludgeoning',
        critRange: 20,
        critMultiplier: 2,
      },
    },
  },
  {
    id: 'weapon.gnome-hooked-hammer',
    name: 'Gnome hooked hammer',
    pounds: 6,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 3,
      properties: ['trip', 'double'],
      secondHead: {
        damageDice: '1d6',
        damageType: 'piercing',
        critRange: 20,
        critMultiplier: 4,
      },
    },
  },
  {
    id: 'weapon.two-bladed-sword',
    name: 'Two-bladed sword',
    pounds: 10,
    weapon: {
      damageDice: '1d8',
      damageType: 'slashing',
      critRange: 19,
      critMultiplier: 2,
      properties: ['double'],
      secondHead: {
        damageDice: '1d8',
        damageType: 'slashing',
        critRange: 19,
        critMultiplier: 2,
      },
    },
  },
  {
    id: 'weapon.dwarven-urgrosh',
    name: 'Dwarven urgrosh',
    pounds: 12,
    weapon: {
      damageDice: '1d8',
      damageType: 'slashing',
      critRange: 20,
      critMultiplier: 3,
      properties: ['brace', 'double'],
      secondHead: {
        damageDice: '1d6',
        damageType: 'piercing',
        critRange: 20,
        critMultiplier: 3,
      },
    },
  },
] as const

const EXOTIC_RANGED = [
  {
    id: 'weapon.bolas',
    name: 'Bolas',
    pounds: 2,
    weapon: {
      damageDice: '1d4',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 10,
      properties: ['trip', 'nonlethal'],
    },
  },
  {
    id: 'weapon.hand-crossbow',
    name: 'Hand crossbow',
    pounds: 2,
    weapon: {
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
      rangeFeet: 30,
    },
  },
  {
    id: 'weapon.repeating-heavy-crossbow',
    name: 'Repeating heavy crossbow',
    pounds: 12,
    weapon: {
      damageDice: '1d10',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
      rangeFeet: 120,
    },
  },
  {
    id: 'weapon.repeating-light-crossbow',
    name: 'Repeating light crossbow',
    pounds: 6,
    weapon: {
      damageDice: '1d8',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
      rangeFeet: 80,
    },
  },
  {
    id: 'weapon.shuriken',
    name: 'Shuriken',
    pounds: 0.5,
    weapon: {
      damageDice: '1d2',
      damageType: 'piercing',
      critRange: 20,
      critMultiplier: 2,
      rangeFeet: 10,
      properties: ['monk'],
    },
  },
  {
    id: 'weapon.halfling-sling-staff',
    name: 'Halfling sling staff',
    pounds: 3,
    weapon: {
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 3,
      rangeFeet: 80,
    },
  },
] as const

const DOUBLE_PRIMARY = [
  'weapon.orc-double-axe',
  'weapon.dire-flail',
  'weapon.gnome-hooked-hammer',
  'weapon.two-bladed-sword',
  'weapon.dwarven-urgrosh',
] as const

describe('CRB batch 19: exotic melee', () => {
  it('stamps Medium CRB table numbers for exotic melee weapons', () => {
    for (const row of EXOTIC_MELEE) {
      expect(lookupCrbItem(row.id)).toMatchObject(row)
      const stamped = applyCrbItem(createEmptyItem(), row.id)
      expect(stamped.item.name).toBe(row.name)
      expect(stamped.pounds).toBe(row.pounds)
      expect(stamped.weapon).toEqual(row.weapon)
    }
  })

  it('stamps only the primary head on double weapons', () => {
    for (const id of DOUBLE_PRIMARY) {
      const dice = lookupCrbItem(id)?.weapon?.damageDice
      expect(dice).toBeDefined()
      expect(dice).not.toContain('/')
    }
    expect(lookupCrbItem('weapon.gnome-hooked-hammer')?.weapon).toMatchObject({
      damageDice: '1d8',
      damageType: 'bludgeoning',
      critMultiplier: 3,
    })
    expect(lookupCrbItem('weapon.dwarven-urgrosh')?.weapon).toMatchObject({
      damageDice: '1d8',
      damageType: 'slashing',
      critMultiplier: 3,
    })
  })

  it('does not tag kama, whip, nunchaku, or siangham with double', () => {
    expect(lookupCrbItem('weapon.kama')?.weapon?.properties).toEqual([
      'trip',
      'monk',
    ])
    expect(lookupCrbItem('weapon.whip')?.weapon?.properties).toEqual([
      'reach',
      'trip',
      'disarm',
      'nonlethal',
    ])
    expect(lookupCrbItem('weapon.nunchaku')?.weapon?.properties).toEqual([
      'disarm',
      'monk',
    ])
    expect(lookupCrbItem('weapon.siangham')?.weapon?.properties).toEqual([
      'monk',
    ])
  })
})

describe('CRB batch 19: exotic ranged and repeating bolts', () => {
  it('stamps Medium CRB table numbers for exotic ranged weapons', () => {
    for (const row of EXOTIC_RANGED) {
      expect(lookupCrbItem(row.id)).toMatchObject(row)
      const stamped = applyCrbItem(createEmptyItem(), row.id)
      expect(stamped.weapon).toEqual(row.weapon)
      expect(stamped.pounds).toBe(row.pounds)
    }
  })

  it('stamps a net as range and weight only', () => {
    expect(lookupCrbItem('weapon.net')).toMatchObject({
      id: 'weapon.net',
      name: 'Net',
      pounds: 6,
      weapon: { rangeFeet: 10 },
    })
    const stamped = applyCrbItem(createEmptyItem(), 'weapon.net')
    expect(stamped.pounds).toBe(6)
    expect(stamped.weapon).toEqual({ rangeFeet: 10 })
    expect(stamped.weapon?.damageDice).toBeUndefined()
  })

  it('stamps repeating bolts as a bundle with the published weight', () => {
    expect(lookupCrbItem('item.repeating-crossbow-bolts')).toMatchObject({
      id: 'item.repeating-crossbow-bolts',
      name: 'Repeating crossbow bolts',
      kind: 'item',
      pounds: 1,
    })
    const stamped = applyCrbItem(createEmptyItem(), 'item.repeating-crossbow-bolts')
    expect(stamped.pounds).toBe(1)
    expect(stamped.weapon).toBeUndefined()
  })

  it('leaves later gear unknown', () => {
    expect(lookupCrbItem('item.bedroll')).toBeNull()
  })
})

describe('CRB batch 19: Combat stays typed', () => {
  it('does not rewrite AC or attacks after applying an equipped kama', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    character.attacks = [attack]
    const row = applyCrbItem(createEmptyItem(), 'weapon.kama')
    row.location = 'equipped'
    character.inventory.items = [row]
    const beforeAc = structuredClone(character.armorClass)
    const beforeAttack = structuredClone(character.attacks[0])
    const view = compute(character)
    expect(character.armorClass).toEqual(beforeAc)
    expect(character.attacks[0]).toEqual(beforeAttack)
    expect(view.ac).toBe(10)
    expect(row.weapon?.damageDice).toBe('1d6')
    expect(row.pounds).toBe(2)
  })
})
