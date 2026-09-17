import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Wizard 5', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
  )
  const view = compute(character)

  it('loads as a prepared wizard with derived level 5', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.classes[0]?.class.id).toBe('class.wizard')
    expect(character.spellcasting[0]?.ability).toBe('int')
    expect(view.level).toBe(5)
  })

  it('round-trips Save then Load', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Golden Wizard')
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.system).toBe('pf1e')
  })

  it('computes ability modifiers from scores', () => {
    expect(view.abilityModifiers).toEqual({
      str: -1,
      dex: 2,
      con: 2,
      int: 4,
      wis: 0,
      cha: 1,
    })
  })

  it('computes half BAB, mixed saves, HP, and AC', () => {
    expect(view.bab).toBe(2)
    expect(view.babIteratives).toEqual([2])
    expect(view.fortitude).toBe(3)
    expect(view.reflex).toBe(3)
    expect(view.will).toBe(4)
    expect(view.maxHp).toBe(37)
    expect(view.ac).toBe(12)
    expect(view.touchAc).toBe(12)
    expect(view.flatFootedAc).toBe(10)
    expect(view.cmb).toBe(1)
    expect(view.cmd).toBe(13)
  })

  it('computes skills including class +3', () => {
    expect(view.skillTotals.spellcraft).toBe(12)
    expect(view.skillTotals['knowledge-arcana']).toBe(12)
    expect(view.skillTotals.perception).toBe(5)
    expect(view.skillTotals.climb).toBe(-1)
  })

  it('computes caster level, DCs, and INT bonus slots', () => {
    const casting = view.spellcasting['cast-wizard']
    expect(casting.casterLevel).toBe(5)
    expect(casting.abilityMod).toBe(4)
    expect(casting.dcByLevel[0]).toBe(14)
    expect(casting.dcByLevel[1]).toBe(15)
    expect(casting.dcByLevel[3]).toBe(17)
    expect(casting.bonusSlotsByLevel.slice(0, 5)).toEqual([0, 1, 1, 1, 1])
    expect(casting.classSlotsByLevel.slice(0, 5)).toEqual([4, 3, 2, 1, null])
    expect(casting.slotMaxByLevel.slice(0, 5)).toEqual([4, 4, 3, 2, 0])
    expect(character.spellcasting[0]?.slots).toEqual([
      { spellLevel: 0, max: null, remaining: 4 },
      { spellLevel: 1, max: null, remaining: 3 },
      { spellLevel: 2, max: null, remaining: 3 },
      { spellLevel: 3, max: null, remaining: 1 },
    ])
  })

  it('computes the quarterstaff snapshot and light load', () => {
    expect(view.attacks['atk-quarterstaff']).toEqual({
      attack: 1,
      damage: '1d6-1',
      iteratives: [1],
    })
    expect(signed(view.attacks['atk-quarterstaff'].attack)).toBe('+1')
    expect(view.weightUsed).toBe(7)
    expect(view.loadCategory).toBe('light')
  })

  it('stamps catalog properties and secondHead on the quarterstaff item', () => {
    const item = character.inventory.items.find(
      (row) => row.item.id === 'weapon.quarterstaff',
    )
    expect(item?.weapon?.properties).toEqual(['monk', 'double'])
    expect(item?.weapon?.secondHead).toEqual({
      damageDice: '1d6',
      damageType: 'bludgeoning',
      critRange: 20,
      critMultiplier: 2,
    })
  })
})
