import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F2B_IDS = [
  'feat.rapid-reload',
  'feat.rapid-shot',
  'feat.ride-by-attack',
  'feat.scorpion-style',
  'feat.shatter-defenses',
  'feat.shield-focus',
  'feat.shield-master',
  'feat.shield-proficiency',
  'feat.shield-slam',
  'feat.shot-on-the-run',
  'feat.sickening-critical',
  'feat.simple-weapon-proficiency',
  'feat.snatch-arrows',
  'feat.spellbreaker',
  'feat.spirited-charge',
  'feat.spring-attack',
  'feat.staggering-critical',
] as const

describe('CRB batch F2b: Combat feats 72-88', () => {
  it('resolves all 17 F2b combat feats in the CRB catalog', () => {
    for (const id of F2B_IDS) {
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
    for (const id of F2B_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe('combat')
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F2b feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F2B_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
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
