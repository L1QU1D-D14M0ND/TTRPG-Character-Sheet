import { describe, expect, it } from 'vitest'
import { createEmptyItem } from '../character/createRows'
import {
  itemMagicBadge,
  magicBadge,
  masterworkChecked,
  setEnhancement,
  setMasterwork,
  suggestedMagicPrice,
} from './magicOverlay'

describe('magic overlay', () => {
  const longsword = {
    damageDice: '1d8',
    damageType: 'slashing',
  }

  it('stores enhancement and forces masterwork, omitting both when cleared', () => {
    const enhanced = setEnhancement(longsword, 2)
    expect(enhanced).toEqual({
      damageDice: '1d8',
      damageType: 'slashing',
      enhancementBonus: 2,
      masterwork: true,
    })
    expect(masterworkChecked(enhanced)).toBe(true)
    expect(magicBadge(enhanced)).toBe('+2')

    const cleared = setEnhancement(enhanced, 0)
    expect(cleared).toEqual({ ...longsword, masterwork: true })
    expect(cleared).not.toHaveProperty('enhancementBonus')
    expect(magicBadge(cleared)).toBe('MWK')
  })

  it('leaves masterwork set while an enhancement remains', () => {
    const enhanced = setEnhancement(longsword, 1)
    const still = setMasterwork(enhanced, false)
    expect(still.masterwork).toBe(true)
    expect(still.enhancementBonus).toBe(1)
    expect(masterworkChecked(still)).toBe(true)
  })

  it('stores masterwork only as true and drops the field when unchecked', () => {
    const made = setMasterwork(longsword, true)
    expect(made.masterwork).toBe(true)
    expect(magicBadge(made)).toBe('MWK')
    const cleared = setMasterwork(made, false)
    expect(cleared).not.toHaveProperty('masterwork')
    expect(masterworkChecked({ enhancementBonus: 3 })).toBe(true)
  })

  describe('on an item row', () => {
    it('prices a +1 flaming longsword from base, masterwork, and bonus', () => {
      const item = {
        ...createEmptyItem(),
        priceGp: 15,
        weapon: { ...longsword, enhancementBonus: 1, properties: ['flaming'] },
      }
      // 15 + 300 masterwork + (+2)² × 2000
      expect(suggestedMagicPrice(item)).toBe(8315)
      expect(itemMagicBadge(item)).toBe('+1')
    })

    it('prices armor and shields with their own masterwork cost', () => {
      const armor = { ...createEmptyItem(), priceGp: 150, armor: { masterwork: true } }
      expect(suggestedMagicPrice(armor)).toBe(300)
      expect(itemMagicBadge(armor)).toBe('MWK')
      const shield = { ...createEmptyItem(), priceGp: 9, shield: { enhancementBonus: 2 } }
      expect(suggestedMagicPrice(shield)).toBe(9 + 150 + 4000)
    })

    it('has no price or badge for mundane or slotless rows', () => {
      expect(suggestedMagicPrice(createEmptyItem())).toBeNull()
      expect(itemMagicBadge(createEmptyItem())).toBeNull()
      const plain = { ...createEmptyItem(), priceGp: 15, weapon: { ...longsword } }
      expect(suggestedMagicPrice(plain)).toBeNull()
    })
  })
})
