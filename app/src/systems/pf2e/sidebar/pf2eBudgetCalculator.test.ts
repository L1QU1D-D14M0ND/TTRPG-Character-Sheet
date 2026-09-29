import { describe, expect, it } from 'vitest'
import { pf2eModule } from '../module'
import { calculatePf2eBudget, getPf2eCurrentGold } from './pf2eBudgetCalculator'

describe('pf2eBudgetCalculator', () => {
  it('computes 50% materials cost for PF2e crafting and warns if untrained', () => {
    const char = pf2eModule.createEmpty()
    char.inventory.currency = { cp: 0, sp: 0, gp: 50, pp: 0 }
    const craftSkill = char.skills.find((s) => s.key === 'crafting')
    if (craftSkill) craftSkill.rank = 'untrained'
    const derived = pf2eModule.compute(char)

    expect(getPf2eCurrentGold(char)).toBe(50)

    const items = [
      {
        id: '1',
        name: 'Fine Clothing',
        marketPrice: 2,
        quantity: 1,
        mode: 'craft' as const,
      },
    ]

    const result = calculatePf2eBudget(char, derived, items)
    expect(result.summary.buyAllTotal).toBe(2)
    expect(result.summary.mixedTotal).toBe(1) // 50% of 2 gp = 1 gp
    expect(result.items[0].canCraft).toBe(false)
    expect(result.items[0].reasons).toContain('untrained in Crafting')
    expect(result.items[0].craftTimeDays).toBe(2) // Remaster 2-day downtime
    expect(result.summary.remainingGold).toBe(49)
  })

  it('checks feat requirements such as Magical Crafting', () => {
    const char = pf2eModule.createEmpty()
    const craftSkill = char.skills.find((s) => s.key === 'crafting')
    if (craftSkill) craftSkill.rank = 'trained'
    const derived = pf2eModule.compute(char)

    const items = [
      {
        id: '2',
        name: 'Wand of Heal',
        marketPrice: 60,
        quantity: 1,
        mode: 'craft' as const,
        isMagic: true,
        featRequired: 'Magical Crafting',
      },
    ]

    const result = calculatePf2eBudget(char, derived, items)
    expect(result.items[0].canCraft).toBe(false)
    expect(result.items[0].reasons).toContain('missing required feat: Magical Crafting')

    // Add Magical Crafting feat
    char.feats = [
      {
        id: 'f1',
        category: 'skill',
        levelGained: 2,
        feat: { id: 'feat.magical-crafting', name: 'Magical Crafting', rulesetSource: 'crb' },
      },
    ]
    const resultWithFeat = calculatePf2eBudget(char, derived, items)
    expect(resultWithFeat.items[0].canCraft).toBe(true)
    expect(resultWithFeat.items[0].craftTimeDays).toBe(2)
  })
})
