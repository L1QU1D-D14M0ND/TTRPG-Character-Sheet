import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F3B_IDS = [
  'feat.extra-lay-on-hands',
  'feat.extra-mercy',
  'feat.extra-performance',
  'feat.extra-rage',
  'feat.fleet',
  'feat.great-fortitude',
  'feat.greater-spell-focus',
  'feat.greater-spell-penetration',
  'feat.improved-channel',
  'feat.improved-counterspell',
  'feat.improved-familiar',
  'feat.improved-great-fortitude',
  'feat.improved-iron-will',
  'feat.improved-lightning-reflexes',
  'feat.iron-will',
  'feat.leadership',
] as const

describe('CRB batch F3b: General feats (part 2 of 3)', () => {
  it('resolves all 16 F3b general feats in the CRB catalog', () => {
    for (const id of F3B_IDS) {
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
    for (const id of F3B_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe('general')
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F3b feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F3B_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
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
