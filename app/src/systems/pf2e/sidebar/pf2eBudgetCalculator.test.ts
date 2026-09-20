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
    expect(result.summary.remainingGold).toBe(49)
  })
})
