import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from '../character/createRows'
import { parseCharacterJson } from '../character/saveLoad'
import { stamp } from '../content'
import { compute } from './compute'
import { readRepoFile } from '../../../test/readRepoFile'

describe('CRB batch 13: catalog spells do not fill slots or DCs', () => {
  it('keeps empty-sheet slots and DCs after applying Fireball', () => {
    const character = createEmptyCharacter()
    const entry = createEmptySpellcasting()
    const beforeSlots = structuredClone(entry.slots)
    entry.spells = [stamp('spell', createEmptySpellListEntry(), 'spell.fireball')]
    character.spellcasting = [entry]
    const view = compute(character)
    expect(entry.slots).toEqual(beforeSlots)
    expect(entry.slots.every((row) => row.max == null && row.remaining === 0)).toBe(
      true,
    )
    expect(entry.spells[0]?.prepared).toBe(false)
    expect(entry.spells[0]?.summary).toBe('')
    expect(view.spellcasting[entry.id]?.dcByLevel[3]).toBe(13)
    expect(view.spellcasting[entry.id]?.bonusSlotsByLevel[3]).toBe(0)
  })

  it('still uses typed remaining and INT DC on Wizard 5', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const view = compute(character)
    const entry = character.spellcasting[0]
    expect(entry?.spells.some((row) => row.spell.id === 'spell.fireball')).toBe(
      true,
    )
    expect(entry?.slots.find((row) => row.spellLevel === 3)).toEqual({
      spellLevel: 3,
      max: null,
      remaining: 1,
    })
    expect(view.spellcasting[entry!.id]?.slotMaxByLevel[3]).toBe(2)
    expect(view.spellcasting[entry!.id]?.dcByLevel[3]).toBe(17)
  })
})
