import { describe, expect, it } from 'vitest'
import { parseCharacterJson } from '../character/saveLoad'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Fighter 5', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
  )
  const view = compute(character)

  it('loads as schemaVersion 1 with derived level 5', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.classes[0]?.class.id).toBe('class.fighter')
    expect(view.level).toBe(5)
  })

  it('computes ability modifiers from scores', () => {
    expect(view.abilityModifiers).toEqual({
      str: 4,
      dex: 2,
      con: 2,
      int: 0,
      wis: 1,
      cha: -1,
    })
  })

  it('computes BAB, iteratives, saves, HP, and dead threshold', () => {
    expect(view.bab).toBe(5)
    expect(view.babIteratives).toEqual([5])
    expect(view.fortitude).toBe(6)
    expect(view.reflex).toBe(3)
    expect(view.will).toBe(2)
    expect(view.maxHp).toBe(49)
    expect(view.deadAt).toBe(-14)
  })

  it('computes AC trio, CMB, and CMD', () => {
    expect(view.ac).toBe(18)
    expect(view.touchAc).toBe(12)
    expect(view.flatFootedAc).toBe(16)
    expect(view.cmb).toBe(9)
    expect(view.cmd).toBe(21)
    expect(view.initiative).toBe(2)
    expect(view.meleeAttack).toBe(9)
    expect(view.rangedAttack).toBe(7)
  })

  it('computes skills including class +3 and ACP', () => {
    expect(view.skillTotals.climb).toBe(7)
    expect(view.skillTotals.intimidate).toBe(7)
    expect(view.skillTotals.perception).toBe(6)
    expect(view.skillTotals.swim).toBe(-1)
    expect(view.skillTotals.stealth).toBe(-3)
    expect(view.skillTotals.acrobatics).toBe(-3)
  })

  it('computes the longsword snapshot and pounds/load', () => {
    expect(view.attacks['atk-longsword']).toEqual({
      attack: 9,
      damage: '1d8+4',
      iteratives: [9],
    })
    expect(signed(view.attacks['atk-longsword'].attack)).toBe('+9')
    expect(view.weightUsed).toBe(45)
    expect(view.lightLoad).toBe(100)
    expect(view.heavyLoad).toBe(300)
    expect(view.loadCategory).toBe('light')
  })

  it('stamps catalog weapon numbers on the carried dagger', () => {
    const dagger = character.inventory.items.find(
      (row) => row.item.id === 'weapon.dagger',
    )
    expect(dagger?.weapon).toEqual({
      damageDice: '1d4',
      damageType: 'piercing',
      critRange: 19,
      critMultiplier: 2,
      rangeFeet: 10,
    })
  })
})
