import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptyClass,
  createEmptyEidolon,
  createEmptyEvolution,
  createEmptySpellListEntry,
} from '../character/createRows'
import { STANDARD_SKILLS } from '../character/standardSkills'
import { parseCharacterJson } from '../character/saveLoad'
import { readRepoFile } from '../../../test/readRepoFile'
import {
  applyApgArchetype,
  applyApgEvolution,
  applyApgSpell,
  applyClassProgression,
  applySpell,
  classSkillKeySet,
  classSpellsPerDayRow,
  lookupApgArchetype,
  lookupApgClass,
  lookupApgEvolution,
  lookupApgSpell,
  lookupCrbClass,
  lookupCrbFeat,
  lookupCrbSpell,
  lookupSpell,
  stampClassSkills,
  APG_ARCHETYPES,
  APG_CLASSES,
  APG_EVOLUTIONS,
  APG_SPELLS,
} from './index'
import { compute } from '../engine/compute'
import {
  babFromProgression,
  saveFromProgression,
  stackedBab,
  stackedSave,
} from '../engine/progressions'

const STANDARD_SKILL_KEY_SET = new Set(STANDARD_SKILLS.map((row) => row.key))

describe('APG slice 1: Summoner catalog + Synthesist name', () => {
  it('keeps Summoner out of the CRB class lookup', () => {
    expect(lookupCrbClass('class.summoner')).toBeNull()
    expect(lookupApgClass('class.summoner')?.name).toBe('Summoner')
    expect(APG_CLASSES.map((row) => row.id)).toEqual(['class.summoner'])
  })

  it('stamps Summoner HD / BAB / saves / skill points through the existing apply path', () => {
    const row = createEmptyClass()
    row.levels = 5
    row.favored = { hp: 2, skillRanks: 1 }
    const summoner = applyClassProgression(row, 'class.summoner')
    expect(summoner.levels).toBe(5)
    expect(summoner.favored).toEqual({ hp: 2, skillRanks: 1 })
    expect(summoner.hitDie).toBe(8)
    expect(summoner.babProgression).toBe('threeQuarter')
    expect(summoner.saves).toEqual({ fort: 'poor', ref: 'poor', will: 'good' })
    expect(summoner.skillPointsPerLevel).toBe(2)
    expect(summoner.class.id).toBe('class.summoner')
    expect(summoner.class.name).toBe('Summoner')
    expect(summoner.class.source).toEqual({ book: 'APG' })
    expect(summoner.archetype).toBeUndefined()
    expect(babFromProgression(summoner.babProgression, 5)).toBe(3)
    expect(saveFromProgression(summoner.saves.will, 5)).toBe(4)
    expect(saveFromProgression(summoner.saves.fort, 5)).toBe(1)
  })

  it('stamps Synthesist name without rewriting progressions or fused scores', () => {
    expect(APG_ARCHETYPES.map((row) => row.id)).toEqual(['archetype.synthesist'])
    expect(lookupApgArchetype('archetype.synthesist')?.classId).toBe(
      'class.summoner',
    )
    const summoner = applyClassProgression(
      createEmptyClass(),
      'class.summoner',
    )
    summoner.hitDie = 8
    const fused = applyApgArchetype(summoner, 'archetype.synthesist')
    expect(fused.archetype).toEqual({
      id: 'archetype.synthesist',
      name: 'Synthesist',
      source: { book: 'APG' },
    })
    expect(fused.hitDie).toBe(8)
    expect(fused.babProgression).toBe('threeQuarter')
    expect(fused.saves).toEqual({ fort: 'poor', ref: 'poor', will: 'good' })
    expect(fused.skillPointsPerLevel).toBe(2)
  })

  it('clears Synthesist when the class leaves Summoner', () => {
    const summoner = applyApgArchetype(
      applyClassProgression(createEmptyClass(), 'class.summoner'),
      'archetype.synthesist',
    )
    const fighter = applyClassProgression(summoner, 'class.fighter')
    expect(fighter.class.id).toBe('class.fighter')
    expect(fighter.archetype).toBeUndefined()
  })

  it('stamps Summoner class skills without spending ranks or adding spellcasting', () => {
    const character = createEmptyCharacter()
    const row = applyClassProgression(createEmptyClass(), 'class.summoner')
    const skills = stampClassSkills(character.skills, [row])
    const flagged = skills
      .filter((skill) => skill.classSkill)
      .map((skill) => skill.key)
    expect(flagged).toContain('fly')
    expect(flagged).toContain('spellcraft')
    expect(flagged).toContain('use-magic-device')
    expect(flagged).toContain('knowledge-planes')
    expect(flagged).not.toContain('climb')
    expect(flagged).not.toContain('perception')
    expect(skills.every((skill) => skill.ranks === 0)).toBe(true)
    const catalog = lookupApgClass('class.summoner')
    expect(catalog).not.toBeNull()
    for (const key of catalog!.classSkills) {
      expect(STANDARD_SKILL_KEY_SET.has(key)).toBe(true)
    }
    expect(character.spellcasting).toEqual([])
    expect(character.features).toEqual([])
  })

  it('unions Summoner with Fighter on the existing checkbox stamp', () => {
    const fighter = applyClassProgression(createEmptyClass(), 'class.fighter')
    const summoner = applyClassProgression(
      createEmptyClass(),
      'class.summoner',
    )
    const keys = classSkillKeySet([fighter, summoner])
    expect(keys.has('climb')).toBe(true)
    expect(keys.has('spellcraft')).toBe(true)
    expect(keys.has('disable-device')).toBe(false)
  })

  it('reuses stacked BAB/saves and the skill-rank pool for Summoner 5 Human', () => {
    const character = createEmptyCharacter()
    character.identity.race = { id: 'race.human', name: 'Human' }
    character.abilities.int.score = 10
    const summoner = applyClassProgression(
      createEmptyClass(),
      'class.summoner',
    )
    summoner.levels = 5
    character.classes = [applyApgArchetype(summoner, 'archetype.synthesist')]
    character.skills = stampClassSkills(character.skills, character.classes)
    const view = compute(character)
    expect(view.skillRanksBudget).toBe(15)
    expect(view.skillRanksSpent).toBe(0)
    expect(view.bab).toBe(3)
    expect(stackedBab(character.classes)).toBe(3)
    expect(stackedSave(character.classes, 'will')).toBe(4)
    expect(stackedSave(character.classes, 'fort')).toBe(1)
    expect(character.abilities.str.score).toBe(10)
    expect(character.abilities.dex.score).toBe(10)
    expect(character.abilities.con.score).toBe(10)
    expect(view.fusedActive).toBe(false)
    expect(character.feats).toEqual([])
    expect(character.features).toEqual([])
    expect(character.spellcasting).toEqual([])
  })

  it('still loads CRB goldens without an APG class id', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    expect(lookupCrbClass(fighter.classes[0]?.class.id)).not.toBeNull()
    expect(fighter.classes[0]?.class.id).not.toBe('class.summoner')
  })

  it('loads the Synthesist golden from the APG pack, not CRB', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/synthesist-5.json'),
    )
    expect(lookupCrbClass(character.classes[0]?.class.id)).toBeNull()
    expect(lookupApgClass(character.classes[0]?.class.id)?.id).toBe(
      'class.summoner',
    )
    expect(lookupApgArchetype(character.classes[0]?.archetype?.id)?.id).toBe(
      'archetype.synthesist',
    )
    expect(character.companions[0]?.kind).toBe('eidolon')
    expect(character.companions[0]?.fused?.active).toBe(true)
  })
})

describe('APG slice 2: documentary evolutions + fused overlay', () => {
  it('stamps evolution names without writing fused scores', () => {
    expect(lookupCrbFeat('evolution.claws')).toBeNull()
    expect(lookupApgEvolution('evolution.claws')?.name).toBe('Claws')
    expect(APG_EVOLUTIONS.map((row) => row.id)).toContain('evolution.claws')
    const stamped = applyApgEvolution(createEmptyEvolution(), 'evolution.claws')
    expect(stamped.evolution).toEqual({
      id: 'evolution.claws',
      name: 'Claws',
      source: { book: 'APG' },
    })
    const unknown = applyApgEvolution(stamped, 'evolution.not-real')
    expect(unknown.evolution.id).toBeNull()
    expect(unknown.evolution.name).toBe('Claws')
  })

  it('uses fused STR/DEX/CON and costume HP without applying evolutions', () => {
    const character = createEmptyCharacter()
    character.abilities.str.score = 10
    character.abilities.dex.score = 10
    character.abilities.con.score = 10
    character.abilities.int.score = 14
    const summoner = applyClassProgression(createEmptyClass(), 'class.summoner')
    character.classes = [applyApgArchetype(summoner, 'archetype.synthesist')]
    const eidolon = createEmptyEidolon()
    eidolon.fused = {
      active: true,
      str: 18,
      dex: 14,
      con: 16,
      costumeHp: 42,
    }
    eidolon.evolutions = [
      applyApgEvolution(createEmptyEvolution(), 'evolution.ability-increase'),
    ]
    character.companions = [eidolon]

    const view = compute(character)
    expect(view.fusedActive).toBe(true)
    expect(view.abilityModifiers.str).toBe(4)
    expect(view.abilityModifiers.dex).toBe(2)
    expect(view.abilityModifiers.con).toBe(3)
    expect(view.abilityModifiers.int).toBe(2)
    expect(view.maxHp).toBe(42)
    expect(view.pilotMaxHp).toBe(0)
    expect(view.deadAt).toBe(-16)
    expect(view.fortitude).toBe(stackedSave(character.classes, 'fort') + 3)
    expect(character.abilities.str.score).toBe(10)
    expect(character.abilities.con.score).toBe(10)
    expect(eidolon.evolutions[0]?.evolution.id).toBe(
      'evolution.ability-increase',
    )
  })

  it('keeps pilot physical scores when fused is off', () => {
    const character = createEmptyCharacter()
    character.abilities.str.score = 8
    const eidolon = createEmptyEidolon()
    eidolon.fused = {
      active: false,
      str: 18,
      dex: 14,
      con: 16,
      costumeHp: 42,
    }
    character.companions = [eidolon]
    const view = compute(character)
    expect(view.fusedActive).toBe(false)
    expect(view.abilityModifiers.str).toBe(-1)
    expect(view.maxHp).toBe(0)
    expect(view.maxHp).toBe(view.pilotMaxHp)
  })
})

describe('APG slice 4: Summoner spellsPerDay + APG spells', () => {
  it('provides Table 2-8 spellsPerDay on class.summoner', () => {
    expect(classSpellsPerDayRow('class.summoner', 0)).toBeNull()
    expect(classSpellsPerDayRow('class.summoner', 1)).toEqual([
      null,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ])
    expect(classSpellsPerDayRow('class.summoner', 4)).toEqual([
      null,
      3,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ])
    expect(classSpellsPerDayRow('class.summoner', 5)).toEqual([
      null,
      4,
      2,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ])
    expect(classSpellsPerDayRow('class.summoner', 10)).toEqual([
      null,
      5,
      4,
      3,
      1,
      null,
      null,
      null,
      null,
      null,
    ])
    expect(classSpellsPerDayRow('class.summoner', 20)).toEqual([
      null,
      5,
      5,
      5,
      5,
      5,
      5,
      null,
      null,
      null,
    ])
  })

  it('keeps APG spells out of CRB lookup and resolves in APG', () => {
    expect(lookupCrbSpell('spell.rejuvenate-eidolon-lesser')).toBeNull()
    expect(lookupCrbSpell('spell.summon-eidolon')).toBeNull()
    expect(lookupApgSpell('spell.rejuvenate-eidolon-lesser')).toEqual({
      id: 'spell.rejuvenate-eidolon-lesser',
      name: 'Rejuvenate Eidolon, Lesser',
      spellLevel: 1,
      source: { book: 'APG' },
    })
    expect(lookupApgSpell('spell.summon-eidolon')).toEqual({
      id: 'spell.summon-eidolon',
      name: 'Summon Eidolon',
      spellLevel: 2,
      source: { book: 'APG' },
    })
    expect(lookupApgSpell('spell.mage-armor')).toBeNull()
    expect(APG_SPELLS.length).toBe(27)
  })

  it('resolves both CRB and APG spells through unified lookupSpell', () => {
    expect(lookupSpell('spell.mage-armor')?.name).toBe('Mage Armor')
    expect(lookupSpell('spell.rejuvenate-eidolon-lesser')?.name).toBe(
      'Rejuvenate Eidolon, Lesser',
    )
    expect(lookupSpell('spell.non-existent')).toBeNull()
  })

  it('stamps APG spell id, name, source, and level via applyApgSpell and applySpell', () => {
    const entry = createEmptySpellListEntry()
    const stampedApg = applyApgSpell(entry, 'spell.rejuvenate-eidolon-lesser')
    expect(stampedApg.spell).toEqual({
      id: 'spell.rejuvenate-eidolon-lesser',
      name: 'Rejuvenate Eidolon, Lesser',
      source: { book: 'APG' },
    })
    expect(stampedApg.spellLevel).toBe(1)

    const unknown = applyApgSpell(stampedApg, 'spell.unknown')
    expect(unknown.spell.id).toBeNull()
    expect(unknown.spell.name).toBe('Rejuvenate Eidolon, Lesser')

    const unifiedCrb = applySpell(entry, 'spell.mage-armor')
    expect(unifiedCrb.spell.id).toBe('spell.mage-armor')
    expect(unifiedCrb.spell.name).toBe('Mage Armor')

    const unifiedApg = applySpell(entry, 'spell.summon-eidolon')
    expect(unifiedApg.spell.id).toBe('spell.summon-eidolon')
    expect(unifiedApg.spell.name).toBe('Summon Eidolon')
    expect(unifiedApg.spellLevel).toBe(2)
  })
})

