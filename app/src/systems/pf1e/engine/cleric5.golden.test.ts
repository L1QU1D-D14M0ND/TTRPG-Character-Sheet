import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Cleric 5', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/cleric-5.json'),
  )
  const view = compute(character)

  it('loads as a prepared divine cleric with derived level 5', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.classes[0]?.class.id).toBe('class.cleric')
    expect(character.spellcasting[0]?.ability).toBe('wis')
    expect(view.level).toBe(5)
  })

  it('round-trips Save then Load', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Golden Cleric')
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.system).toBe('pf1e')
  })

  it('computes ability modifiers from scores', () => {
    expect(view.abilityModifiers).toEqual({
      str: 2,
      dex: 0,
      con: 2,
      int: 0,
      wis: 4,
      cha: 2,
    })
  })

  it('computes ¾ BAB, good Fort/Will saves, HP, and armor/shield AC', () => {
    expect(view.bab).toBe(3)
    expect(view.babIteratives).toEqual([3])
    expect(view.fortitude).toBe(6)
    expect(view.reflex).toBe(1)
    expect(view.will).toBe(8)
    expect(view.maxHp).toBe(43)
    expect(view.ac).toBe(18)
    expect(view.touchAc).toBe(10)
    expect(view.flatFootedAc).toBe(18)
    expect(view.cmb).toBe(5)
    expect(view.cmd).toBe(15)
  })

  it('computes skills including class +3 and ACP on armor/shield', () => {
    expect(view.skillTotals.heal).toBe(12)
    expect(view.skillTotals.diplomacy).toBe(10)
    expect(view.skillTotals['knowledge-religion']).toBe(8)
    expect(view.skillTotals.climb).toBe(-4) // Str +2 + ACP -6 = -4
  })

  it('computes caster level, DCs, and WIS bonus slots for prepared spells', () => {
    const casting = view.spellcasting['cast-cleric']
    expect(casting.casterLevel).toBe(5)
    expect(casting.abilityMod).toBe(4)
    expect(casting.dcByLevel[0]).toBe(14)
    expect(casting.dcByLevel[1]).toBe(15)
    expect(casting.dcByLevel[2]).toBe(16)
    expect(casting.dcByLevel[3]).toBe(17)
    expect(casting.bonusSlotsByLevel.slice(0, 5)).toEqual([0, 1, 1, 1, 1])
    expect(casting.classSlotsByLevel.slice(0, 5)).toEqual([4, 3, 2, 1, null])
    expect(casting.slotMaxByLevel.slice(0, 5)).toEqual([4, 4, 3, 2, 0])
    expect(character.spellcasting[0]?.slots).toEqual([
      { spellLevel: 1, max: 4, remaining: 4 },
      { spellLevel: 2, max: 3, remaining: 3 },
      { spellLevel: 3, max: 2, remaining: 2 },
    ])
  })

  it('tracks channel energy and domain powers in play.dailyResources', () => {
    expect(character.play.dailyResources).toEqual([
      {
        id: 'res-channel-energy',
        name: 'Channel Energy',
        max: 7,
        remaining: 7,
        resetsOn: 'daily',
      },
      {
        id: 'res-rebuke-death',
        name: 'Rebuke Death (Healing Domain)',
        max: 7,
        remaining: 7,
        resetsOn: 'daily',
      },
    ])
  })

  it('computes heavy mace attack with Weapon Focus and light load', () => {
    expect(view.attacks['atk-heavy-mace']).toEqual({
      attack: 6, // BAB 3 + Str 2 + misc 1
      damage: '1d8+2',
      iteratives: [6],
    })
    expect(signed(view.attacks['atk-heavy-mace'].attack)).toBe('+6')
    expect(view.weightUsed).toBe(48)
    expect(view.loadCategory).toBe('light')
  })
})
