import { describe, expect, it } from 'vitest'
import { pf1eModule } from '../module'
import { buildPf1eActions } from './pf1eActionsList'

describe('pf1eActionsList', () => {
  it('generates standard action groups for healthy character', () => {
    const char = pf1eModule.createEmpty()
    char.attacks = [
      {
        id: 'atk-longsword',
        name: 'Longsword',
        attackType: 'melee',
        itemId: null,
        damageDice: '1d8',
        damageType: 'slashing',
      },
    ]
    char.vitals.currentHp = 30
    const derived = pf1eModule.compute(char)

    const groups = buildPf1eActions(char, derived)
    expect(groups.length).toBeGreaterThan(0)

    const standard = groups.find((g) => g.id === 'standard')
    expect(standard).toBeDefined()
    const atk = standard?.items.find((i) => i.id === 'atk-atk-longsword')
    expect(atk?.availability).toBe('available')

    const move = groups.find((g) => g.id === 'move')
    const moveLand = move?.items.find((i) => i.id === 'move-land')
    expect(moveLand?.availability).toBe('available')
  })

  it('restricts actions when grappled or immobilized', () => {
    const char = pf1eModule.createEmpty()
    char.attacks = [
      {
        id: 'atk-greatsword',
        name: 'Greatsword',
        attackType: 'melee',
        itemId: null,
        damageDice: '2d6',
        damageType: 'slashing',
      },
    ]
    char.vitals.currentHp = 25
    char.conditions = [
      {
        id: 'cond-grappled',
        condition: { id: null, name: 'Grappled' },
        notes: '',
        value: null,
        duration: null,
      },
    ]

    const derived = pf1eModule.compute(char)
    const groups = buildPf1eActions(char, derived)

    // Move actions should be unavailable
    const move = groups.find((g) => g.id === 'move')
    const moveLand = move?.items.find((i) => i.id === 'move-land')
    expect(moveLand?.availability).toBe('unavailable')
    expect(moveLand?.reason).toContain('grappled')

    // Full-round actions should be unavailable
    const full = groups.find((g) => g.id === 'full')
    const fullAtk = full?.items.find((i) => i.id === 'full-attack')
    expect(fullAtk?.availability).toBe('unavailable')
  })

  it('greys out all actions when unconscious or dead', () => {
    const char = pf1eModule.createEmpty()
    char.vitals.currentHp = -15
    const derived = pf1eModule.compute(char)

    const groups = buildPf1eActions(char, derived)
    const standard = groups.find((g) => g.id === 'standard')
    for (const item of standard?.items ?? []) {
      expect(item.availability).toBe('unavailable')
    }
  })
})
