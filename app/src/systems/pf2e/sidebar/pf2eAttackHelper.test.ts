import { describe, expect, it } from 'vitest'
import { pf2eModule } from '../module'
import {
  computePf2eAttackHelper,
  getPf2eAttackOptions,
  getPf2eAvailableToggles,
} from './pf2eAttackHelper'

describe('pf2eAttackHelper', () => {
  it('computes strike with MAP progression and circumstance toggles', () => {
    const char = pf2eModule.createEmpty()
    char.identity.level = 1
    char.attributes.str.modifierOverride = 4
    char.proficiencies.weapons.simple = 'trained' // +1 level + 2 trained = +3
    char.strikes = [
      {
        id: 'strike-dagger',
        name: 'Dagger',
        itemId: null,
        weaponCategory: 'simple',
        attackAttribute: 'str',
        damageAttribute: 'str',
        damageDice: '1d4',
        modifiers: [],
      },
    ]

    const derived = pf2eModule.compute(char)
    const options = getPf2eAttackOptions(char)
    expect(options).toHaveLength(1)
    expect(options[0].name).toBe('Dagger')

    const toggles = getPf2eAvailableToggles(char, 'strike-dagger')
    expect(toggles.some((t) => t.id === 'off_guard')).toBe(true)

    // Base attack: Str 4 + trained 3 = +7. Dagger is agile (-4 / -8).
    const baseOutput = computePf2eAttackHelper(char, derived, 'strike-dagger', new Set())
    expect(baseOutput?.attackBonusString).toBe('+7')
    expect(baseOutput?.damageExpression).toBe('1d4+4')
    expect(baseOutput?.iterativeBonusStrings).toEqual(['1st: +7', '2nd (-4 agile): +3', '3rd (-8 agile): -1'])
    expect(baseOutput?.inflicts).toContain('Agile (reduced MAP: -4 / -8)')

    // With Bless (+1 status):
    const blessOutput = computePf2eAttackHelper(char, derived, 'strike-dagger', new Set(['status_bless']))
    expect(blessOutput?.attackBonusString).toBe('+8')
    expect(blessOutput?.iterativeBonusStrings).toEqual(['1st: +8', '2nd (-4 agile): +4', '3rd (-8 agile): +0'])
  })
})
