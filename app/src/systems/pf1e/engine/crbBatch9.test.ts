import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyClass } from '../character/createRows'
import { parseCharacterJson } from '../character/saveLoad'
import { stamp } from '../content'
import { compute } from './compute'
import {
  skillRanksBudget,
  skillRanksFromClassLevel,
  skillRanksSpent,
} from './vitals'
import { readRepoFile } from '../../../test/readRepoFile'

describe('CRB batch 9: skill points per level', () => {
  it('grants max(1, table + Int) ranks per class level', () => {
    expect(skillRanksFromClassLevel(5, 2, 0)).toBe(10)
    expect(skillRanksFromClassLevel(5, 2, 4)).toBe(30)
    expect(skillRanksFromClassLevel(1, 2, -1)).toBe(1)
    expect(skillRanksFromClassLevel(2, 2, 3)).toBe(10)
  })

  it('adds Human +1 per level and favored ranks without spending them', () => {
    expect(
      skillRanksBudget({
        classes: [
          { levels: 5, skillPointsPerLevel: 2, favoredSkillRanks: 0 },
        ],
        intMod: 0,
        humanBonusLevels: 5,
      }),
    ).toBe(15)
    expect(
      skillRanksBudget({
        classes: [
          { levels: 5, skillPointsPerLevel: 2, favoredSkillRanks: 3 },
        ],
        intMod: 0,
        humanBonusLevels: 0,
      }),
    ).toBe(13)
    const empty = createEmptyCharacter()
    expect(skillRanksSpent(empty.skills)).toBe(0)
  })

  it('matches Fighter 5 (Human, Int 10) 15 / 15', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const view = compute(character)
    expect(view.skillRanksSpent).toBe(15)
    expect(view.skillRanksBudget).toBe(15)
  })

  it('matches Wizard 5 (Human, Int 18) 35 / 35', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const view = compute(character)
    expect(view.skillRanksSpent).toBe(35)
    expect(view.skillRanksBudget).toBe(35)
  })

  it('matches Fighter 2 / Wizard 3 (Human, Int 16) 30 / 30', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    const view = compute(character)
    expect(view.skillRanksSpent).toBe(30)
    expect(view.skillRanksBudget).toBe(30)
  })

  it('does not auto-spend ranks when stamping a class', () => {
    const character = createEmptyCharacter()
    character.identity.race = { id: 'race.human', name: 'Human' }
    character.abilities.int.score = 10
    const fighter = stamp('class', createEmptyClass(), 'class.fighter')
    fighter.levels = 5
    character.classes = [fighter]
    const view = compute(character)
    expect(view.skillRanksBudget).toBe(15)
    expect(view.skillRanksSpent).toBe(0)
    expect(view.skillTotals.climb).toBe(0)
  })
})
