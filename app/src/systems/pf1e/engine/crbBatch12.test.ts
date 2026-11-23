import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { parseCharacterJson } from '../character/saveLoad'
import { stamp } from '../content'
import { compute } from './compute'
import { readRepoFile } from '../../../test/readRepoFile'

describe('CRB batch 12: catalog feats do not fill Combat', () => {
  it('keeps empty-sheet melee and initiative after applying Power Attack', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    character.feats = [stamp('feat', createEmptyFeat(), 'feat.power-attack')]
    const view = compute(character)
    expect(character.combat).toEqual(beforeCombat)
    expect(character.attacks).toEqual(beforeAttacks)
    expect(view.meleeAttack).toBe(0)
    expect(view.initiative).toBe(0)
    expect(character.feats[0]?.feat.id).toBe('feat.power-attack')
  })

  it('still uses typed initiative on Wizard 5', () => {
    const character = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const view = compute(character)
    expect(character.feats.some((row) => row.feat.id === 'feat.improved-initiative')).toBe(
      true,
    )
    expect(character.combat.initiativeMisc).toBe(0)
    expect(view.initiative).toBe(2)
  })
})
