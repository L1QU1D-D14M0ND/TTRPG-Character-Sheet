import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyClass } from '../character/createRows'
import { STANDARD_SKILLS } from '../character/standardSkills'
import { parseCharacterJson } from '../character/saveLoad'
import { compute } from './compute'
import {
  classSkillBonus,
  ranksExceedLevel,
  skillTotal,
} from './vitals'
import { readRepoFile } from '../../../test/readRepoFile'

/** CRB skills that apply armor check penalty. */
const CRB_ACP_SKILLS = [
  'acrobatics',
  'climb',
  'disable-device',
  'escape-artist',
  'fly',
  'ride',
  'sleight-of-hand',
  'stealth',
  'swim',
]

describe('CRB batch 4: skill totals', () => {
  it('is ranks + ability, with +3 only when trained and a class skill', () => {
    expect(
      skillTotal({
        ranks: 5,
        abilityMod: 4,
        classSkill: true,
        armorPenaltyApplies: false,
        armorCheckPenalty: -5,
        misc: 0,
      }),
    ).toBe(12)
    expect(classSkillBonus(true, true)).toBe(3)
    expect(classSkillBonus(false, true)).toBe(0)
    expect(classSkillBonus(true, false)).toBe(0)
    expect(classSkillBonus(false, false)).toBe(0)
  })

  it('does not grant class-skill +3 at 0 ranks', () => {
    expect(
      skillTotal({
        ranks: 0,
        abilityMod: 4,
        classSkill: true,
        armorPenaltyApplies: true,
        armorCheckPenalty: -5,
        misc: 0,
      }),
    ).toBe(-1)
  })

  it('applies ACP only when the skill flags it (Climb, not Diplomacy)', () => {
    const climb = skillTotal({
      ranks: 0,
      abilityMod: 4,
      classSkill: false,
      armorPenaltyApplies: true,
      armorCheckPenalty: -5,
      misc: 0,
    })
    const diplomacy = skillTotal({
      ranks: 0,
      abilityMod: -1,
      classSkill: false,
      armorPenaltyApplies: false,
      armorCheckPenalty: -5,
      misc: 0,
    })
    expect(climb).toBe(-1)
    expect(diplomacy).toBe(-1)
  })

  it('seeds ACP on the CRB armor-check skills only', () => {
    const acpKeys = STANDARD_SKILLS.filter((row) => row.armorPenaltyApplies).map(
      (row) => row.key,
    )
    expect(acpKeys).toEqual(CRB_ACP_SKILLS)
    expect(STANDARD_SKILLS.find((row) => row.key === 'diplomacy')?.armorPenaltyApplies).toBe(
      false,
    )
    expect(STANDARD_SKILLS.find((row) => row.key === 'perception')?.armorPenaltyApplies).toBe(
      false,
    )
  })

  it('matches Fighter 5 Climb +7 (5 ranks + Str +4 + class +3 + ACP −5)', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const view = compute(character)
    expect(view.abilityModifiers.str).toBe(4)
    expect(character.armorClass.armorCheckPenalty).toBe(-5)
    expect(view.skillTotals.climb).toBe(7)
    expect(view.skillTotals.intimidate).toBe(7)
    expect(view.skillTotals.perception).toBe(6)
    expect(view.skillTotals.swim).toBe(-6)
    expect(view.skillTotals.stealth).toBe(-3)
    expect(view.skillTotals.acrobatics).toBe(-3)
    expect(view.skillTotals.diplomacy).toBe(-1)
  })

  it('matches Wizard 5 Spellcraft +12 with no ACP', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const view = compute(character)
    expect(view.skillTotals.spellcraft).toBe(12)
    expect(view.skillTotals['knowledge-arcana']).toBe(12)
    expect(view.skillTotals.perception).toBe(5)
    expect(view.skillTotals.climb).toBe(-1)
  })
})

describe('CRB batch 4: max ranks = character level', () => {
  it('warns when ranks exceed level and does not warn at the cap', () => {
    expect(ranksExceedLevel(6, 5)).toBe(true)
    expect(ranksExceedLevel(5, 5)).toBe(false)
    expect(ranksExceedLevel(1, 1)).toBe(false)
    expect(ranksExceedLevel(1, 0)).toBe(false)
  })

  it('does not clamp an over-cap total', () => {
    const character = createEmptyCharacter()
    const fighter = createEmptyClass()
    fighter.levels = 5
    fighter.babProgression = 'full'
    character.classes = [fighter]
    character.abilities.str.score = 10
    const climb = character.skills.find((row) => row.key === 'climb')
    expect(climb).toBeDefined()
    climb!.ranks = 6
    climb!.classSkill = true
    const view = compute(character)
    expect(view.level).toBe(5)
    expect(ranksExceedLevel(6, view.level)).toBe(true)
    expect(view.skillTotals.climb).toBe(9)
  })
})
