import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import {
  lookupApgArchetype,
  lookupApgClass,
  lookupApgEvolution,
  lookupCrbClass,
  lookupCrbFeat,
  lookupCrbItem,
  lookupCrbRace,
  lookupCrbSpell,
} from '../content'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Synthesist 5 (Radiant Striker)', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/synthesist-5.json'),
  )
  const view = compute(character)
  const eidolon = character.companions.find((row) => row.kind === 'eidolon')

  it('loads as a fused Summoner Synthesist with derived level 5', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.identity.characterName).toBe('Radiant Striker')
    expect(character.identity.race).toEqual({ id: null, name: 'Half-Elf' })
    expect(character.classes[0]?.class.id).toBe('class.summoner')
    expect(character.classes[0]?.archetype?.id).toBe('archetype.synthesist')
    expect(character.spellcasting[0]?.ability).toBe('cha')
    expect(view.level).toBe(5)
    expect(view.fusedActive).toBe(true)
  })

  it('keeps Summoner out of the CRB pack and resolves APG stamps', () => {
    expect(lookupCrbClass('class.summoner')).toBeNull()
    expect(lookupCrbRace(character.identity.race.id)).toBeNull()
    expect(lookupApgClass(character.classes[0]?.class.id)?.name).toBe(
      'Summoner',
    )
    expect(lookupApgArchetype(character.classes[0]?.archetype?.id)?.name).toBe(
      'Synthesist',
    )
    expect(lookupApgEvolution('evolution.claws')?.name).toBe('Claws')
    expect(lookupApgEvolution('evolution.pounce')).toBeNull()
    expect(lookupCrbFeat('feat.improved-initiative')?.name).toBe(
      'Improved Initiative',
    )
    expect(lookupCrbItem('weapon.dagger')?.name).toBe('Dagger')
    expect(lookupCrbSpell('spell.detect-magic')?.name).toBe('Detect Magic')
    expect(lookupCrbSpell('spell.rejuvenate-eidolon-lesser')).toBeNull()
  })

  it('round-trips Save then Load without derived', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Radiant Striker')
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.companions[0]?.fused?.active).toBe(true)
    expect(reloaded.system).toBe('pf1e')
  })

  it('uses fused physical mods and leaves the pilot array on the document', () => {
    expect(character.abilities).toEqual({
      str: { score: 7 },
      dex: { score: 10 },
      con: { score: 13 },
      int: { score: 14 },
      wis: { score: 14 },
      cha: { score: 20 },
    })
    expect(eidolon?.fused).toEqual({
      active: true,
      str: 18,
      dex: 16,
      con: 13,
      costumeHp: 39,
    })
    expect(view.abilityModifiers).toEqual({
      str: 4,
      dex: 3,
      con: 1,
      int: 2,
      wis: 2,
      cha: 5,
    })
  })

  it('computes ¾ BAB, fused saves, costume HP, and pilot HD max', () => {
    expect(view.bab).toBe(3)
    expect(view.babIteratives).toEqual([3])
    expect(view.fortitude).toBe(2)
    expect(view.reflex).toBe(4)
    expect(view.will).toBe(6)
    expect(view.maxHp).toBe(39)
    expect(view.pilotMaxHp).toBe(38)
    expect(view.deadAt).toBe(-13)
    expect(view.ac).toBe(21)
    expect(view.touchAc).toBe(13)
    expect(view.flatFootedAc).toBe(18)
    expect(view.cmb).toBe(7)
    expect(view.cmd).toBe(20)
    expect(view.initiative).toBe(3)
    expect(view.meleeAttack).toBe(7)
    expect(view.rangedAttack).toBe(6)
  })

  it('computes skills from fused physical mods and does not apply evolutions', () => {
    expect(view.skillRanksBudget).toBe(20)
    expect(view.skillRanksSpent).toBe(20)
    expect(view.skillTotals.spellcraft).toBe(10)
    expect(view.skillTotals['use-magic-device']).toBe(13)
    expect(view.skillTotals['knowledge-planes']).toBe(10)
    expect(view.skillTotals.fly).toBe(11)
    expect(view.skillTotals.climb).toBe(4)
    expect(view.skillTotals.perception).toBe(2)
    expect(eidolon?.evolutions?.map((row) => row.evolution.id)).toEqual([
      'evolution.claws',
      'evolution.bite',
      'evolution.ability-increase',
      'evolution.improved-natural-armor',
      'evolution.flight',
      null,
    ])
    expect(eidolon?.evolutions?.at(-1)?.evolution.name).toBe('Pounce')
  })

  it('computes CHA spontaneous DCs and bonus slots without a Summoner spell catalog', () => {
    const casting = view.spellcasting['cast-summoner']
    expect(casting.casterLevel).toBe(5)
    expect(casting.abilityMod).toBe(5)
    expect(casting.dcByLevel[0]).toBe(15)
    expect(casting.dcByLevel[1]).toBe(16)
    expect(casting.dcByLevel[2]).toBe(17)
    expect(casting.bonusSlotsByLevel.slice(0, 4)).toEqual([0, 2, 1, 1])
    expect(casting.slotMaxByLevel[1]).toBe(6)
    expect(casting.slotMaxByLevel[2]).toBe(3)
    expect(character.spellcasting[0]?.slots).toEqual([
      { spellLevel: 1, max: 6, remaining: 5 },
      { spellLevel: 2, max: 3, remaining: 3 },
    ])
    expect(
      character.spellcasting[0]?.spells.map((row) => row.spell.id),
    ).toEqual([null, null, null, null])
  })

  it('computes typed natural attacks and a light load from fused STR', () => {
    expect(view.attacks['atk-claws']).toEqual({
      attack: 7,
      damage: '1d4+4',
      iteratives: [7],
    })
    expect(view.attacks['atk-bite']).toEqual({
      attack: 7,
      damage: '1d6+4',
      iteratives: [7],
    })
    expect(signed(view.attacks['atk-claws'].attack)).toBe('+7')
    expect(view.weightUsed).toBe(1)
    expect(view.lightLoad).toBe(100)
    expect(view.loadCategory).toBe('light')
  })

  it('restores pilot physical scores when the overlay is turned off', () => {
    const unfused = structuredClone(character)
    unfused.companions[0]!.fused!.active = false
    const civilian = compute(unfused)
    expect(civilian.fusedActive).toBe(false)
    expect(civilian.abilityModifiers.str).toBe(-2)
    expect(civilian.abilityModifiers.dex).toBe(0)
    expect(civilian.abilityModifiers.con).toBe(1)
    expect(civilian.maxHp).toBe(38)
    expect(civilian.maxHp).toBe(civilian.pilotMaxHp)
    expect(civilian.deadAt).toBe(-13)
    expect(character.abilities.str.score).toBe(7)
  })
})
