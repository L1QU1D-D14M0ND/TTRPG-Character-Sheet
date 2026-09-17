import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F1A_IDS = [
  'feat.agile-maneuvers',
  'feat.arcane-armor-mastery',
  'feat.arcane-armor-training',
  'feat.arcane-strike',
  'feat.armor-proficiency-heavy',
  'feat.armor-proficiency-light',
  'feat.armor-proficiency-medium',
  'feat.bleeding-critical',
  'feat.blind-fight',
  'feat.blinding-critical',
  'feat.catch-off-guard',
  'feat.channel-smite',
  'feat.cleave',
  'feat.combat-expertise',
  'feat.combat-reflexes',
  'feat.critical-focus',
  'feat.critical-mastery',
  'feat.dazzling-display',
] as const

describe('CRB batch F1a: Combat feats 1-18', () => {
  it('resolves all 18 F1a combat feats in the CRB catalog', () => {
    for (const id of F1A_IDS) {
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
    for (const id of F1A_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe('combat')
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F1a feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F1A_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
    const view = compute(character)

    expect(character.combat).toEqual(beforeCombat)
    expect(character.attacks).toEqual(beforeAttacks)
    expect(character.armorClass).toEqual(beforeAc)
    expect(view.meleeAttack).toBe(0)
    expect(view.rangedAttack).toBe(0)
    expect(view.cmb).toBe(0)
    expect(view.cmd).toBe(10)
    expect(view.ac).toBe(10)
    expect(character.feats).toHaveLength(18)
  })
})
