import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyClass } from '../character/createRows'
import { stamp, stampClassSkills } from '../content'
import { compute } from './compute'
import { stackedBab, stackedSave } from './progressions'

describe('CRB batch 11: remaining classes reuse catalog apply and pool math', () => {
  it('grants a Rogue 5 Human Int-10 pool without spending ranks or adding features', () => {
    const character = createEmptyCharacter()
    character.identity.race = { id: 'race.human', name: 'Human' }
    character.abilities.int.score = 10
    const rogue = stamp('class', createEmptyClass(), 'class.rogue')
    rogue.levels = 5
    character.classes = [rogue]
    character.skills = stampClassSkills(character.skills, character.classes)
    const view = compute(character)
    expect(view.skillRanksBudget).toBe(45)
    expect(view.skillRanksSpent).toBe(0)
    expect(view.bab).toBe(3)
    expect(character.feats).toEqual([])
    expect(character.features).toEqual([])
    expect(character.spellcasting).toEqual([])
    expect(character.armorClass.armorBonus).toBe(0)
  })

  it('stacks Paladin 2 and Rogue 3 with the existing BAB/save helpers', () => {
    const paladin = stamp('class', createEmptyClass(), 'class.paladin')
    paladin.levels = 2
    const rogue = stamp('class', createEmptyClass(), 'class.rogue')
    rogue.levels = 3
    const classes = [paladin, rogue]
    expect(stackedBab(classes)).toBe(4)
    expect(stackedSave(classes, 'fort')).toBe(4)
    expect(stackedSave(classes, 'ref')).toBe(3)
    expect(stackedSave(classes, 'will')).toBe(4)
  })

  it('gives Monk 5 good Fort, Ref, and Will of +4', () => {
    const monk = stamp('class', createEmptyClass(), 'class.monk')
    monk.levels = 5
    expect(stackedSave([monk], 'fort')).toBe(4)
    expect(stackedSave([monk], 'ref')).toBe(4)
    expect(stackedSave([monk], 'will')).toBe(4)
  })
})
