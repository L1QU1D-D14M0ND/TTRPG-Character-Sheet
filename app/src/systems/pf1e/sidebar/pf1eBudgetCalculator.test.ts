import { describe, expect, it } from 'vitest'
import { createEmptyFeat, createEmptySpellcasting } from '../character/createRows'
import { pf1eModule } from '../module'
import { calculatePf1eBudget, getPf1eCurrentGold } from './pf1eBudgetCalculator'

describe('pf1eBudgetCalculator', () => {
  it('computes buy-all and craft costs correctly with purse comparison', () => {
    const char = pf1eModule.createEmpty()
    char.inventory.currency = { cp: 0, sp: 0, gp: 500, pp: 0 }
    const derived = pf1eModule.compute(char)

    expect(getPf1eCurrentGold(char)).toBe(500)

    const items = [
      {
        id: '1',
        name: 'Masterwork Longsword',
        marketPrice: 315,
        quantity: 1,
        mode: 'craft' as const,
        isMagic: false,
      },
      {
        id: '2',
        name: 'Shield',
        marketPrice: 20,
        quantity: 1,
        mode: 'buy' as const,
        isMagic: false,
      },
    ]

    const result = calculatePf1eBudget(char, derived, items)
    // Masterwork Longsword: 315 / 3 = 105 gp
    // Shield buy: 20 gp
    // Buy all = 315 + 20 = 335 gp
    // Mixed plan = 105 + 20 = 125 gp
    // Craft all = 105 + (20/3=6.67) = 111.67 gp
    expect(result.summary.buyAllTotal).toBe(335)
    expect(result.summary.mixedTotal).toBe(125)
    expect(result.summary.currentGold).toBe(500)
    expect(result.summary.remainingGold).toBe(375)
    expect(result.summary.isDeficit).toBe(false)
  })

  it('detects missing craft feats and CL for magic items', () => {
    const char = pf1eModule.createEmpty()
    char.classes = [
      {
        id: 'c1',
        class: { id: 'class.wizard', name: 'Wizard' },
        levels: 3,
        babProgression: 'half',
        saves: { fort: 'poor', ref: 'poor', will: 'good' },
      },
    ]
    char.spellcasting = [{ ...createEmptySpellcasting(), classRowId: 'c1' }]
    char.feats = [] // No Craft Wondrous Item
    char.inventory.currency = { cp: 0, sp: 0, gp: 200, pp: 0 }
    const derived = pf1eModule.compute(char)

    const items = [
      {
        id: '1',
        name: 'Cloak of Resistance +2',
        marketPrice: 4000,
        quantity: 1,
        mode: 'craft' as const,
        isMagic: true,
        casterLevelRequired: 6,
        featRequired: 'Craft Wondrous Item',
      },
    ]

    const result = calculatePf1eBudget(char, derived, items)
    expect(result.items[0].canCraft).toBe(false)
    expect(result.items[0].reasons).toContain('missing Craft Wondrous Item')
    expect(result.items[0].reasons).toContain('CL 3 < 6')
    expect(result.summary.blockedCraftCount).toBe(1)
    // Craft materials cost = 2000 gp, purse has 200 -> deficit
    expect(result.summary.isDeficit).toBe(true)
    expect(result.summary.remainingGold).toBe(-1800)
  })

  describe('reads the engine instead of re-deriving', () => {
    const wand = {
      id: 'w',
      name: 'Wand',
      marketPrice: 750,
      quantity: 1,
      mode: 'craft' as const,
      isMagic: true,
      casterLevelRequired: 1,
      featRequired: 'Craft Wand',
    }

    function wizard(levels: number) {
      const char = pf1eModule.createEmpty()
      char.classes = [
        {
          id: 'c1',
          class: { id: 'class.wizard', name: 'Wizard' },
          levels,
          babProgression: 'half',
          saves: { fort: 'poor', ref: 'poor', will: 'good' },
        },
      ]
      char.spellcasting = [{ ...createEmptySpellcasting(), classRowId: 'c1' }]
      return char
    }

    it('uses the derived caster level, including a sheet override', () => {
      const char = wizard(3)
      char.overrides = {
        [`derived.spellcasting.${char.spellcasting[0]!.id}.casterLevel`]: { value: 9 },
      }
      const derived = pf1eModule.compute(char)
      const result = calculatePf1eBudget(char, derived, [
        { ...wand, casterLevelRequired: 8 },
      ])
      expect(result.items[0].reasons).not.toContain('CL 3 < 8')
      expect(result.items[0].reasons.some((r) => r.startsWith('CL '))).toBe(false)
    })

    it('treats a character with no casting entries as caster level 0', () => {
      const char = wizard(3)
      char.spellcasting = []
      const result = calculatePf1eBudget(char, pf1eModule.compute(char), [wand])
      expect(result.items[0].reasons).toContain('CL 0 < 1')
    })

    it('matches a required feat by exact name, never by substring', () => {
      const char = wizard(5)
      const craft = createEmptyFeat()
      craft.feat = { id: null, name: 'Craft' }
      char.feats = [craft]
      let result = calculatePf1eBudget(char, pf1eModule.compute(char), [wand])
      expect(result.items[0].reasons).toContain('missing Craft Wand')

      craft.feat = { id: null, name: '  craft   wand ' }
      result = calculatePf1eBudget(char, pf1eModule.compute(char), [wand])
      expect(result.items[0].reasons).not.toContain('missing Craft Wand')
    })
  })
})
