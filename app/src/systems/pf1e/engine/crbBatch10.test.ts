import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyItem } from '../character/createRows'
import { parseCharacterJson } from '../character/saveLoad'
import { stamp } from '../content'
import { compute } from './compute'
import { readRepoFile } from '../../../test/readRepoFile'

describe('CRB batch 10: equipped catalog items do not fill Combat', () => {
  it('keeps empty-sheet AC at 10 after applying equipped chainmail', () => {
    const character = createEmptyCharacter()
    expect(character.armorClass.armorBonus).toBe(0)
    const row = stamp('item', createEmptyItem(), 'armor.chainmail')
    row.location = 'equipped'
    character.inventory.items = [row]
    const before = structuredClone(character.armorClass)
    const view = compute(character)
    expect(character.armorClass).toEqual(before)
    expect(character.armorClass.armorBonus).toBe(0)
    expect(character.armorClass.maxDex).toBeNull()
    expect(character.armorClass.armorCheckPenalty).toBe(0)
    expect(view.ac).toBe(10)
    expect(view.touchAc).toBe(10)
    expect(view.flatFootedAc).toBe(10)
    expect(row.armor?.acBonus).toBe(6)
  })

  it('still uses typed Combat numbers on Fighter 5', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const view = compute(character)
    expect(character.inventory.items[0]?.item.id).toBe('armor.chainmail')
    expect(character.inventory.items[0]?.armor?.acBonus).toBe(6)
    expect(character.armorClass.armorBonus).toBe(6)
    expect(view.ac).toBe(18)
  })
})
