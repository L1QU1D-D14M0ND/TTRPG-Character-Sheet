import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Companion Smoke: Ranger 5 with Animal Companion and Familiar', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/ranger-5-companion.json'),
  )
  const view = compute(character)

  it('loads with animalCompanion and familiar entries and derived level 5', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.classes[0]?.class.id).toBe('class.ranger')
    expect(view.level).toBe(5)
    expect(character.companions.length).toBe(2)
    expect(character.companions[0]?.kind).toBe('animalCompanion')
    expect(character.companions[0]?.name).toBe('Fang')
    expect(character.companions[1]?.kind).toBe('familiar')
    expect(character.companions[1]?.name).toBe('Aero')
  })

  it('round-trips Save then Load preserving companion stubs', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Golden Ranger')
    expect(reloaded.companions.map((c) => ({ kind: c.kind, name: c.name }))).toEqual([
      { kind: 'animalCompanion', name: 'Fang' },
      { kind: 'familiar', name: 'Aero' },
    ])
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.system).toBe('pf1e')
  })

  it('keeps pilot scores and HP untouched when companions are not fused', () => {
    expect(view.fusedActive).toBe(false)
    expect(view.abilityModifiers).toEqual({
      str: 2,
      dex: 4,
      con: 2,
      int: 1,
      wis: 2,
      cha: -1,
    })
    expect(view.maxHp).toBe(49)
  })

  it('computes full BAB, good Fort/Ref saves, and AC with chain shirt', () => {
    expect(view.bab).toBe(5)
    expect(view.babIteratives).toEqual([5])
    expect(view.fortitude).toBe(6) // Fort good 4 + Con 2
    expect(view.reflex).toBe(8) // Ref good 4 + Dex 4
    expect(view.will).toBe(3) // Will poor 1 + Wis 2
    expect(view.ac).toBe(18) // 10 + 4 armor + 4 Dex
    expect(view.touchAc).toBe(14)
    expect(view.flatFootedAc).toBe(14)
  })

  it('computes WIS ranger spellcasting with 1st-level slots', () => {
    const casting = view.spellcasting['cast-ranger']
    expect(casting.casterLevel).toBe(2) // Ranger CL = level - 3 (CRB p. 66)
    expect(casting.abilityMod).toBe(2)
    expect(casting.slotMaxByLevel[1]).toBe(2) // 1 base + 1 bonus
    expect(character.spellcasting[0]?.slots).toEqual([
      { spellLevel: 1, max: 2, remaining: 2 },
    ])
  })

  it('computes longbow ranged attack with Dex modifier', () => {
    expect(view.attacks['atk-longbow']).toEqual({
      attack: 9, // BAB 5 + Dex 4
      damage: '1d8',
      iteratives: [9],
    })
    expect(signed(view.attacks['atk-longbow'].attack)).toBe('+9')
  })
})
