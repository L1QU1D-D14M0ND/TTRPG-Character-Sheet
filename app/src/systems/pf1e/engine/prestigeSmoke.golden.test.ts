import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Prestige Smoke: Fighter 5 / Duelist 2', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/fighter-5-duelist-2.json'),
  )
  const view = compute(character)

  it('loads with multiclass prestige row and derived level 7', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.classes.length).toBe(2)
    expect(character.classes[0]?.class.id).toBe('class.fighter')
    expect(character.classes[0]?.favored?.hp).toBe(5)
    expect(character.classes[1]?.class.id).toBeNull()
    expect(character.classes[1]?.class.name).toBe('Duelist')
    expect(character.classes[1]?.prestige).toBe(true)
    expect(character.classes[1]?.favored).toBeUndefined()
    expect(view.level).toBe(7)
  })

  it('round-trips Save then Load preserving prestige: true', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Golden Duelist')
    expect(reloaded.classes[1]?.prestige).toBe(true)
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.system).toBe('pf1e')
  })

  it('computes stacked full BAB with iteratives [7, 2]', () => {
    expect(view.bab).toBe(7)
    expect(view.babIteratives).toEqual([7, 2])
  })

  it('computes mixed stacked saves from base and prestige progressions', () => {
    // Fort: Fighter 5 good (4) + Duelist 2 poor (0) + Con mod (+2) = 6
    expect(view.fortitude).toBe(6)
    // Ref: Fighter 5 poor (1) + Duelist 2 good (3) + Dex mod (+4) = 8
    expect(view.reflex).toBe(8)
    // Will: Fighter 5 poor (1) + Duelist 2 poor (0) + Wis mod (0) = 1
    expect(view.will).toBe(1)
  })

  it('computes total HP from 7 d10s, Con, and Fighter-only favored HP', () => {
    expect(view.maxHp).toBe(65)
  })

  it('computes AC, touch AC, and flat-footed AC with Dodge and Canny Defense', () => {
    expect(view.ac).toBe(19)
    expect(view.touchAc).toBe(17)
    expect(view.flatFootedAc).toBe(14)
    expect(view.cmd).toBe(24)
  })

  it('computes Finesse rapier attack with iterative attacks', () => {
    expect(view.attacks['atk-rapier']).toEqual({
      attack: 12, // BAB 7 + Dex 4 + misc 1
      damage: '1d6+2',
      iteratives: [12, 7],
    })
    expect(signed(view.attacks['atk-rapier'].attack)).toBe('+12')
  })
})
