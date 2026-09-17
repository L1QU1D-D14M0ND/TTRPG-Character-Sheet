import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyFeat } from '../character/createRows'
import { applyCrbFeat, lookupCrbFeat } from '../content'
import { compute } from './compute'

const F4_ITEM_CREATION_IDS = [
  'feat.brew-potion',
  'feat.craft-rod',
  'feat.craft-staff',
  'feat.craft-wand',
  'feat.forge-ring',
] as const

const F4_METAMAGIC_IDS = [
  'feat.empower-spell',
  'feat.enlarge-spell',
  'feat.extend-spell',
  'feat.maximize-spell',
  'feat.quicken-spell',
  'feat.silent-spell',
  'feat.still-spell',
  'feat.widen-spell',
] as const

const F4_IDS = [...F4_ITEM_CREATION_IDS, ...F4_METAMAGIC_IDS] as const

describe('CRB batch F4: Item creation and metamagic feats (finishes feats)', () => {
  it('resolves all 13 F4 item creation and metamagic feats in the CRB catalog', () => {
    for (const id of F4_ITEM_CREATION_IDS) {
      const feat = lookupCrbFeat(id)
      expect(feat, `Expected ${id} to exist in CRB catalog`).not.toBeNull()
      expect(feat?.id).toBe(id)
      expect(typeof feat?.name).toBe('string')
      expect(feat?.name.length).toBeGreaterThan(0)
      expect(feat?.category).toBe('itemCreation')
      expect(feat?.source?.book).toBe('CRB')
    }

    for (const id of F4_METAMAGIC_IDS) {
      const feat = lookupCrbFeat(id)
      expect(feat, `Expected ${id} to exist in CRB catalog`).not.toBeNull()
      expect(feat?.id).toBe(id)
      expect(typeof feat?.name).toBe('string')
      expect(feat?.name.length).toBeGreaterThan(0)
      expect(feat?.category).toBe('metamagic')
      expect(feat?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and respective category onto empty feat rows', () => {
    for (const id of F4_IDS) {
      const catalog = lookupCrbFeat(id)!
      const stamped = applyCrbFeat(createEmptyFeat(), id)
      expect(stamped.feat.id).toBe(id)
      expect(stamped.feat.name).toBe(catalog.name)
      expect(stamped.category).toBe(catalog.category)
      expect(stamped.feat.source?.book).toBe('CRB')
    }
  })

  it('leaves combat numbers untouched when adding an F4 feat to a character', () => {
    const character = createEmptyCharacter()
    const beforeCombat = structuredClone(character.combat)
    const beforeAttacks = structuredClone(character.attacks)
    const beforeAc = structuredClone(character.armorClass)

    character.feats = F4_IDS.map((id) => applyCrbFeat(createEmptyFeat(), id))
    const view = compute(character)

    expect(character.combat).toEqual(beforeCombat)
    expect(character.attacks).toEqual(beforeAttacks)
    expect(character.armorClass).toEqual(beforeAc)
    expect(view.meleeAttack).toBe(0)
    expect(view.rangedAttack).toBe(0)
    expect(view.cmb).toBe(0)
    expect(view.cmd).toBe(10)
    expect(view.ac).toBe(10)
    expect(character.feats).toHaveLength(13)
  })
})
