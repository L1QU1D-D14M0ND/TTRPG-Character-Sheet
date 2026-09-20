import { describe, expect, it } from 'vitest'
import { pf2eModule } from '../module'
import { buildPf2eActions } from './pf2eActionsList'

describe('pf2eActionsList', () => {
  it('generates single actions for standard character', () => {
    const char = pf2eModule.createEmpty()
    char.strikes = [
      {
        id: 'strike-fist',
        name: 'Fist',
        itemId: null,
        weaponCategory: 'unarmed',
        attackAttribute: 'str',
        damageAttribute: 'str',
        damageDice: '1d4',
        modifiers: [],
      },
    ]
    char.vitals.currentHp = 20

    const derived = pf2eModule.compute(char)
    const groups = buildPf2eActions(char, derived)
    expect(groups.length).toBeGreaterThan(0)

    const actions = groups.find((g) => g.id === 'actions')
    const strike = actions?.items.find((i) => i.id === 'strike-strike-fist')
    expect(strike?.availability).toBe('available')

    const stride = actions?.items.find((i) => i.id === 'stride-action')
    expect(stride?.availability).toBe('available')
  })

  it('restricts stride when immobilized or grabbed', () => {
    const char = pf2eModule.createEmpty()
    char.conditions = [
      {
        id: 'cond-grabbed',
        condition: { id: 'grabbed', name: 'Grabbed' },
        notes: '',
        value: null,
        duration: null,
      },
    ]
    char.vitals.currentHp = 20

    const derived = pf2eModule.compute(char)
    const groups = buildPf2eActions(char, derived)

    const actions = groups.find((g) => g.id === 'actions')
    const stride = actions?.items.find((i) => i.id === 'stride-action')
    expect(stride?.availability).toBe('unavailable')
    expect(stride?.reason).toBe('grabbed')
  })

  it('hinders actions when prone', () => {
    const char = pf2eModule.createEmpty()
    char.strikes = [
      {
        id: 'strike-longsword',
        name: 'Longsword',
        itemId: null,
        weaponCategory: 'martial',
        attackAttribute: 'str',
        damageAttribute: 'str',
        damageDice: '1d8',
        modifiers: [],
      },
    ]
    char.conditions = [
      {
        id: 'cond-prone',
        condition: { id: 'prone', name: 'Prone' },
        notes: '',
        value: null,
        duration: null,
      },
    ]
    char.vitals.currentHp = 20

    const derived = pf2eModule.compute(char)
    const groups = buildPf2eActions(char, derived)

    const actions = groups.find((g) => g.id === 'actions')
    const strike = actions?.items.find((i) => i.id === 'strike-strike-longsword')
    expect(strike?.availability).toBe('hindered')
    expect(strike?.reason).toContain('prone')

    const stride = actions?.items.find((i) => i.id === 'stride-action')
    expect(stride?.availability).toBe('unavailable')
  })
})
