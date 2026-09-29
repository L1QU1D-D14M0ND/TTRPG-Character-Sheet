import { describe, expect, it } from 'vitest'
import {
  magicBadge,
  masterworkChecked,
  setEnhancement,
  setMasterwork,
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
})