import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F3A_IDS = [
  'feat.acrobatic',
  'feat.acrobatic-steps',
  'feat.alertness',
  'feat.alignment-channel',
  'feat.animal-affinity',
  'feat.athletic',
  'feat.augment-summoning',
  'feat.combat-casting',
  'feat.command-undead',
  'feat.deceitful',
  'feat.deft-hands',
  'feat.diehard',
  'feat.elemental-channel',
  'feat.endurance',
  'feat.extra-channel',
  'feat.extra-ki',
] as const

describe('CRB batch F3a: General feats (part 1 of 3)', () => {
  it('resolves all 16 F3a general feats in the CRB catalog', () => {
    for (const id of F3A_IDS) {
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
    for (const id of F3A_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe('general')
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F3a feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F3A_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
    const view = compute(character)

    expect(character.combat).toEqual(beforeCombat)
    expect(character.attacks).toEqual(beforeAttacks)
    expect(character.armorClass).toEqual(beforeAc)
    expect(view.meleeAttack).toBe(0)
    expect(view.rangedAttack).toBe(0)
    expect(view.cmb).toBe(0)
    expect(view.cmd).toBe(10)
    expect(view.ac).toBe(10)
    expect(character.feats).toHaveLength(16)
  })
})
