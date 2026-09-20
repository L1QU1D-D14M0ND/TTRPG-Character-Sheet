import { describe, expect, it } from 'vitest'
import { pf1eModule } from '../module'
import {
  computePf1eAttackHelper,
  getPf1eAttackOptions,
  getPf1eAvailableToggles,
} from './pf1eAttackHelper'

describe('pf1eAttackHelper', () => {
  it('computes basic melee attack and toggles Power Attack with two-handed grip', () => {
    const char = pf1eModule.createEmpty()
    char.classes = [
      {
        id: 'c1',
        class: { id: 'class.fighter', name: 'Fighter' },
        levels: 5,
        babProgression: 'full',
        saves: { fort: 'good', ref: 'poor', will: 'poor' },
      },
    ]
    char.abilities.str.score = 16 // mod +3
    char.attacks = [
      {
        id: 'atk-greatsword',
        name: 'Greatsword',
        attackType: 'melee',
        itemId: null,
        damageDice: '2d6',
        damageType: 'slashing',
        critRange: 19,
        critMultiplier: 2,
        attackAbility: 'str',
        damageAbility: 'str',
      },
    ]
    char.feats = [
      {
        id: 'f1',
        category: 'combat',
        feat: { id: 'feat.power-attack', name: 'Power Attack' },
        levelGained: 1,
      },
    ]

    const derived = pf1eModule.compute(char)
    const options = getPf1eAttackOptions(char)
    expect(options).toHaveLength(1)
    expect(options[0].name).toBe('Greatsword')

    const toggles = getPf1eAvailableToggles(char, 'atk-greatsword')
    expect(toggles.some((t) => t.id === 'power_attack')).toBe(true)
    expect(toggles.some((t) => t.id === 'two_handed')).toBe(true)

    // Base: BAB 5, Str 3 -> Attack +8, Damage 2d6+3
    const baseOutput = computePf1eAttackHelper(char, derived, 'atk-greatsword', new Set())
    expect(baseOutput).not.toBeNull()
    expect(baseOutput?.attackBonusString).toBe('+8')
    expect(baseOutput?.damageExpression).toBe('2d6+3')
    expect(baseOutput?.critHint).toBe('19-20 / x2')

    // With Power Attack & Two-Handed:
    // BAB 5 -> penaltyStep = 1 + floor(5/4) = 2.
    // Attack mod: -2 -> +6 (iterative +6 / +1)
    // Two-handed Str mod: floor(3 * 1.5) = 4 (+1 extra).
    // Two-handed PA damage: 3 * 2 = +6.
    // Total damage: 2d6 + 3 + 1 + 6 = 2d6+10
    const activeToggles = new Set(['power_attack', 'two_handed'])
    const paOutput = computePf1eAttackHelper(char, derived, 'atk-greatsword', activeToggles)
    expect(paOutput?.attackBonusString).toBe('+6')
    expect(paOutput?.iterativeBonusStrings).toEqual(['+6'])
    expect(paOutput?.damageExpression).toBe('2d6+10')

    // At Fighter level 6, BAB is 6, producing an iterative at +1 (+7 / +2 base, -2 PA -> +5 / +0)
    char.classes[0].levels = 6
    const derived6 = pf1eModule.compute(char)
    const paOutput6 = computePf1eAttackHelper(char, derived6, 'atk-greatsword', activeToggles)
    expect(paOutput6?.attackBonusString).toBe('+7')
    expect(paOutput6?.iterativeBonusStrings).toEqual(['+7', '+2'])
  })

  it('computes ranged attack with Point-Blank Shot and Deadly Aim', () => {
    const char = pf1eModule.createEmpty()
    char.classes = [
      {
        id: 'c1',
        class: { id: 'class.fighter', name: 'Fighter' },
        levels: 4,
        babProgression: 'full',
        saves: { fort: 'good', ref: 'poor', will: 'poor' },
      },
    ]
    char.abilities.dex.score = 16 // mod +3
    char.attacks = [
      {
        id: 'atk-longbow',
        name: 'Longbow',
        attackType: 'ranged',
        itemId: null,
        damageDice: '1d8',
        damageType: 'piercing',
        critRange: 20,
        critMultiplier: 3,
        attackAbility: 'dex',
        damageAbility: null,
      },
    ]
    char.feats = [
      {
        id: 'f1',
        category: 'combat',
        feat: { id: 'feat.deadly-aim', name: 'Deadly Aim' },
        levelGained: 1,
      },
      {
        id: 'f2',
        category: 'combat',
        feat: { id: 'feat.point-blank-shot', name: 'Point-Blank Shot' },
        levelGained: 1,
      },
    ]

    const derived = pf1eModule.compute(char)

    // Base: BAB 4, Dex 3 -> Attack +7, Damage 1d8
    const baseOutput = computePf1eAttackHelper(char, derived, 'atk-longbow', new Set())
    expect(baseOutput?.attackBonusString).toBe('+7')
    expect(baseOutput?.damageExpression).toBe('1d8')
    expect(baseOutput?.critHint).toBe('20 / x3')
    expect(baseOutput?.triggers).toContain('Provokes Attack of Opportunity (ranged weapon in melee)')

    // With Point-Blank (+1 atk, +1 dmg) and Deadly Aim (-2 atk, +4 dmg)
    // BAB 4 -> penalty = 2, damage = 4
    // Net: Attack +7 - 2 + 1 = +6, Damage 1d8 + 4 + 1 = 1d8+5
    const toggles = new Set(['point_blank', 'deadly_aim'])
    const modOutput = computePf1eAttackHelper(char, derived, 'atk-longbow', toggles)
    expect(modOutput?.attackBonusString).toBe('+6')
    expect(modOutput?.damageExpression).toBe('1d8+5')
  })
})
