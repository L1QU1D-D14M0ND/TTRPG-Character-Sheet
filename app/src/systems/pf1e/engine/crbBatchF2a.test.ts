import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F2A_IDS = [
  'feat.improved-two-weapon-fighting',
  'feat.improved-unarmed-strike',
  'feat.improved-vital-strike',
  'feat.improvised-weapon-mastery',
  'feat.intimidating-prowess',
  'feat.lightning-stance',
  'feat.lunge',
  'feat.manyshot',
  'feat.martial-weapon-proficiency',
  'feat.medusas-wrath',
  'feat.mobility',
  'feat.mounted-archery',
  'feat.mounted-combat',
  'feat.penetrating-strike',
  'feat.pinpoint-targeting',
  'feat.precise-shot',
  'feat.quick-draw',
] as const

describe('CRB batch F2a: Combat feats 55-71', () => {
  it('resolves all 17 F2a combat feats in the CRB catalog', () => {
    for (const id of F2A_IDS) {
      const feat = lookupCrbFeat(id)
      expect(feat, `Expected ${id} to exist in CRB catalog`).not.toBeNull()
      expect(feat?.id).toBe(id)
      expect(typeof feat?.name).toBe('string')
      expect(feat?.name.length).toBeGreaterThan(0)
      expect(feat?.category).toBe('combat')
      expect(feat?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and combat category onto empty feat rows', () => {
    for (const id of F2A_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe('combat')
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F2a feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F2A_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
    const view = compute(character)

    expect(character.combat).toEqual(beforeCombat)
    expect(character.attacks).toEqual(beforeAttacks)
    expect(character.armorClass).toEqual(beforeAc)
    expect(view.meleeAttack).toBe(0)
    expect(view.rangedAttack).toBe(0)
    expect(view.cmb).toBe(0)
    expect(view.cmd).toBe(10)
    expect(view.ac).toBe(10)
    expect(character.feats).toHaveLength(17)
  })
})
