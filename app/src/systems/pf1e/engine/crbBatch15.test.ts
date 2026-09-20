import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptyClass,
  createEmptySpellcasting,
} from '../character/createRows'
import { classSpellsPerDayRow, lookupCrbClass } from '../content'
import { compute } from './compute'
import { defaultSlotMax } from './spellcasting'

/** CRB Wizard spells per day (also Druid, and Cleric without domain +1). */
const WIZARD_TABLE: Array<Array<number | null>> = [
  [3, 1, null, null, null, null, null, null, null, null],
  [4, 2, null, null, null, null, null, null, null, null],
  [4, 2, 1, null, null, null, null, null, null, null],
  [4, 3, 2, null, null, null, null, null, null, null],
  [4, 3, 2, 1, null, null, null, null, null, null],
  [4, 3, 3, 2, null, null, null, null, null, null],
  [4, 4, 3, 2, 1, null, null, null, null, null],
  [4, 4, 3, 3, 2, null, null, null, null, null],
  [4, 4, 4, 3, 2, 1, null, null, null, null],
  [4, 4, 4, 3, 3, 2, null, null, null, null],
  [4, 4, 4, 4, 3, 2, 1, null, null, null],
  [4, 4, 4, 4, 3, 3, 2, null, null, null],
  [4, 4, 4, 4, 4, 3, 2, 1, null, null],
  [4, 4, 4, 4, 4, 3, 3, 2, null, null],
  [4, 4, 4, 4, 4, 4, 3, 2, 1, null],
  [4, 4, 4, 4, 4, 4, 3, 3, 2, null],
  [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
  [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
  [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
]

describe('CRB batch 15: class spells-per-day tables', () => {
  it('stores the Wizard 1–20 table and matches Cleric/Druid without domain extras', () => {
    for (let level = 1; level <= 20; level++) {
      const expected = WIZARD_TABLE[level - 1]
      expect(classSpellsPerDayRow('class.wizard', level), `wizard ${level}`).toEqual(
        expected,
      )
      expect(classSpellsPerDayRow('class.cleric', level), `cleric ${level}`).toEqual(
        expected,
      )
      expect(classSpellsPerDayRow('class.druid', level), `druid ${level}`).toEqual(
        expected,
      )
    }
  })

  it('matches published Bard, Sorcerer, Paladin, and Ranger snapshots', () => {
    expect(classSpellsPerDayRow('class.bard', 1)?.slice(0, 3)).toEqual([
      null,
      1,
      null,
    ])
    expect(classSpellsPerDayRow('class.bard', 5)?.slice(0, 4)).toEqual([
      null,
      4,
      2,
      null,
    ])
    expect(classSpellsPerDayRow('class.bard', 16)?.slice(0, 7)).toEqual([
      null,
      5,
      5,
      5,
      4,
      3,
      1,
    ])
    expect(classSpellsPerDayRow('class.sorcerer', 1)?.slice(0, 3)).toEqual([
      null,
      3,
      null,
    ])
    expect(classSpellsPerDayRow('class.sorcerer', 5)?.slice(0, 4)).toEqual([
      null,
      6,
      4,
      null,
    ])
    expect(classSpellsPerDayRow('class.paladin', 3)?.slice(0, 3)).toEqual([
      null,
      null,
      null,
    ])
    expect(classSpellsPerDayRow('class.paladin', 4)?.slice(0, 3)).toEqual([
      null,
      0,
      null,
    ])
    expect(classSpellsPerDayRow('class.ranger', 4)?.slice(0, 3)).toEqual([
      null,
      0,
      null,
    ])
    expect(classSpellsPerDayRow('class.ranger', 13)?.slice(0, 5)).toEqual([
      null,
      3,
      2,
      1,
      0,
    ])
  })

  it('omits spellsPerDay on non-casters and unknown ids', () => {
    expect(lookupCrbClass('class.fighter')?.spellsPerDay).toBeUndefined()
    expect(lookupCrbClass('class.summoner')).toBeNull()
    expect(classSpellsPerDayRow('class.fighter', 5)).toBeNull()
    expect(classSpellsPerDayRow('class.barbarian', 1)).toBeNull()
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
    expect(classSpellsPerDayRow('class.alchemist', 5)).toBeNull()
    expect(classSpellsPerDayRow('class.wizard', 0)).toBeNull()
  })
})

describe('CRB batch 15: hybrid slot max', () => {
  function wizardSheet(levels: number, intScore: number) {
    const character = createEmptyCharacter()
    const wizard = createEmptyClass()
    wizard.id = 'class-row-wizard'
    wizard.levels = levels
    character.classes = [wizard]
    character.classes[0] = {
      ...wizard,
      class: { id: 'class.wizard', name: 'Wizard' },
      babProgression: 'half',
      hitDie: 6,
      saves: { fort: 'poor', ref: 'poor', will: 'good' },
    }
    character.abilities.int.score = intScore
    const entry = createEmptySpellcasting()
    entry.id = 'cast-wizard'
    entry.classRowId = 'class-row-wizard'
    character.spellcasting = [entry]
    return character
  }

  it('defaults Wizard 5 INT 18 to class 4/3/2/1 plus bonus 0/1/1/1', () => {
    const character = wizardSheet(5, 18)
    const view = compute(character)
    expect(view.spellcasting['cast-wizard'].classSlotsByLevel.slice(0, 5)).toEqual(
      [4, 3, 2, 1, null],
    )
    expect(view.spellcasting['cast-wizard'].slotMaxByLevel.slice(0, 5)).toEqual([
      4, 4, 3, 2, 0,
    ])
    expect(character.spellcasting[0]?.slots.every((row) => row.max == null)).toBe(
      true,
    )
  })

  it('does not add Cleric domain extras at level 1', () => {
    const character = createEmptyCharacter()
    const cleric = createEmptyClass()
    cleric.id = 'class-row-cleric'
    cleric.levels = 1
    cleric.class = { id: 'class.cleric', name: 'Cleric' }
    character.classes = [cleric]
    character.abilities.wis.score = 18
    const entry = createEmptySpellcasting()
    entry.id = 'cast-cleric'
    entry.ability = 'wis'
    entry.classRowId = 'class-row-cleric'
    character.spellcasting = [entry]
    const view = compute(character)
    expect(view.spellcasting['cast-cleric'].classSlotsByLevel.slice(0, 3)).toEqual(
      [3, 1, null],
    )
    expect(view.spellcasting['cast-cleric'].slotMaxByLevel.slice(0, 3)).toEqual([
      3, 2, 0,
    ])
  })

  it('grants Paladin 4 CHA 18 a 0-table 1st plus the CHA bonus', () => {
    const character = createEmptyCharacter()
    const paladin = createEmptyClass()
    paladin.id = 'class-row-paladin'
    paladin.levels = 4
    paladin.class = { id: 'class.paladin', name: 'Paladin' }
    character.classes = [paladin]
    character.abilities.cha.score = 18
    const entry = createEmptySpellcasting()
    entry.id = 'cast-paladin'
    entry.ability = 'cha'
    entry.classRowId = 'class-row-paladin'
    character.spellcasting = [entry]
    const view = compute(character)
    expect(view.spellcasting['cast-paladin'].classSlotsByLevel[1]).toBe(0)
    expect(view.spellcasting['cast-paladin'].slotMaxByLevel[1]).toBe(1)
    expect(view.spellcasting['cast-paladin'].slotMaxByLevel[0]).toBe(0)
  })

  it('zeros slots the class or ability score cannot cast', () => {
    expect(defaultSlotMax(null, 18, 1)).toBe(0)
    expect(defaultSlotMax(3, 10, 1)).toBe(0)
    const tooLow = compute(wizardSheet(5, 10))
    expect(tooLow.spellcasting['cast-wizard'].slotMaxByLevel.slice(0, 4)).toEqual([
      4, 0, 0, 0,
    ])
    const paladin3 = createEmptyCharacter()
    const row = createEmptyClass()
    row.id = 'class-row-paladin'
    row.levels = 3
    row.class = { id: 'class.paladin', name: 'Paladin' }
    paladin3.classes = [row]
    paladin3.abilities.cha.score = 18
    const entry = createEmptySpellcasting()
    entry.id = 'cast-paladin'
    entry.ability = 'cha'
    entry.classRowId = 'class-row-paladin'
    paladin3.spellcasting = [entry]
    expect(compute(paladin3).spellcasting['cast-paladin'].slotMaxByLevel[1]).toBe(
      0,
    )
  })

  it('keeps a typed max as a custom override and does not rewrite the document', () => {
    const character = wizardSheet(5, 18)
    character.spellcasting[0]!.slots[1] = {
      spellLevel: 1,
      max: 7,
      remaining: 7,
    }
    const before = structuredClone(character.spellcasting[0]!.slots)
    const view = compute(character)
    expect(character.spellcasting[0]!.slots).toEqual(before)
    expect(view.spellcasting['cast-wizard'].slotMaxByLevel[1]).toBe(7)
    expect(view.spellcasting['cast-wizard'].slotMaxByLevel[0]).toBe(4)
  })
})
