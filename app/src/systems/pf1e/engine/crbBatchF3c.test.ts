import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F3C_IDS = [
  'feat.lightning-reflexes',
  'feat.magical-aptitude',
  'feat.master-craftsman',
  'feat.natural-spell',
  'feat.nimble-moves',
  'feat.persuasive',
  'feat.run',
  'feat.selective-channeling',
  'feat.self-sufficient',
  'feat.skill-focus',
  'feat.spell-mastery',
  'feat.spell-penetration',
  'feat.stealthy',
  'feat.toughness',
  'feat.turn-undead',
] as const

describe('CRB batch F3c: General feats (part 3 of 3)', () => {
  it('resolves all 15 F3c general feats in the CRB catalog', () => {
    for (const id of F3C_IDS) {
      const feat = lookupCrbFeat(id)
      expect(feat, `Expected ${id} to exist in CRB catalog`).not.toBeNull()
      expect(feat?.id).toBe(id)
      expect(typeof feat?.name).toBe('string')
      expect(feat?.name.length).toBeGreaterThan(0)
      expect(feat?.category).toBe('general')
      expect(feat?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and general category onto empty feat rows', () => {
    for (const id of F3C_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe('general')
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F3c feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F3C_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
    const view = compute(character)

    expect(character.combat).toEqual(beforeCombat)
    expect(character.attacks).toEqual(beforeAttacks)
    expect(character.armorClass).toEqual(beforeAc)
    expect(view.meleeAttack).toBe(0)
    expect(view.rangedAttack).toBe(0)
    expect(view.cmb).toBe(0)
    expect(view.cmd).toBe(10)
    expect(view.ac).toBe(10)
    expect(character.feats).toHaveLength(15)
  })
})
