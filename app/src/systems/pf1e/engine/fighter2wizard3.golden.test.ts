import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Fighter 2 / Wizard 3', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
  )
  const view = compute(character)

  it('loads two class rows with derived level 5', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.classes.map((row) => row.class.id)).toEqual([
      'class.fighter',
      'class.wizard',
    ])
    expect(character.classes.map((row) => row.levels)).toEqual([2, 3])
    expect(view.level).toBe(5)
  })

  it('round-trips Save then Load', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Golden Multiclass')
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.system).toBe('pf1e')
    expect(reloaded.classes).toHaveLength(2)
  })

  it('computes ability modifiers from scores', () => {
    expect(view.abilityModifiers).toEqual({
      str: 3,
      dex: 1,
      con: 2,
      int: 3,
      wis: 0,
      cha: -1,
    })
  })

  it('stacks BAB, iteratives, saves, and HP', () => {
    expect(view.bab).toBe(3)
    expect(view.babIteratives).toEqual([3])
    expect(view.fortitude).toBe(6)
    expect(view.reflex).toBe(2)
    expect(view.will).toBe(3)
    expect(view.maxHp).toBe(40)
    expect(view.deadAt).toBe(-14)
  })

  it('computes AC trio, CMB, CMD, and attack bonuses', () => {
    expect(view.ac).toBe(15)
    expect(view.touchAc).toBe(11)
    expect(view.flatFootedAc).toBe(14)
    expect(view.cmb).toBe(6)
    expect(view.cmd).toBe(17)
    expect(view.initiative).toBe(1)
    expect(view.meleeAttack).toBe(6)
    expect(view.rangedAttack).toBe(4)
  })

  it('computes skills including class +3 and ACP', () => {
    expect(view.skillTotals.spellcraft).toBe(11)
    expect(view.skillTotals['knowledge-arcana']).toBe(11)
    expect(view.skillTotals.linguistics).toBe(11)
    expect(view.skillTotals['knowledge-planes']).toBe(11)
    expect(view.skillTotals.climb).toBe(7)
    expect(view.skillTotals.intimidate).toBe(4)
    expect(view.skillTotals.perception).toBe(5)
  })

  it('computes caster level, DCs, and INT bonus slots', () => {
    const casting = view.spellcasting['cast-wizard']
    expect(casting.casterLevel).toBe(3)
    expect(casting.abilityMod).toBe(3)
    expect(casting.dcByLevel[0]).toBe(13)
    expect(casting.dcByLevel[1]).toBe(14)
    expect(casting.dcByLevel[2]).toBe(15)
    expect(casting.bonusSlotsByLevel.slice(0, 4)).toEqual([0, 1, 1, 1])
    expect(casting.classSlotsByLevel.slice(0, 4)).toEqual([4, 2, 1, null])
    expect(casting.slotMaxByLevel.slice(0, 4)).toEqual([4, 3, 2, 0])
    expect(character.spellcasting[0]?.slots).toEqual([
      { spellLevel: 0, max: null, remaining: 4 },
      { spellLevel: 1, max: null, remaining: 2 },
      { spellLevel: 2, max: null, remaining: 2 },
    ])
  })

  it('computes the longsword snapshot and light load', () => {
    expect(view.attacks['atk-longsword']).toEqual({
      attack: 6,
      damage: '1d8+3',
      damageDice: '1d8',
      damageMod: 3,
      damageAbility: 'str',
      iteratives: [6],
    })
    expect(signed(view.attacks['atk-longsword'].attack)).toBe('+6')
    expect(view.weightUsed).toBe(32)
    expect(view.lightLoad).toBe(76)
    expect(view.heavyLoad).toBe(230)
    expect(view.loadCategory).toBe('light')
  })
})
