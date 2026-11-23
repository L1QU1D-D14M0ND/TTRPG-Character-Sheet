import type { CharacterDocument } from '../character/types'
import type { DerivedView } from '../engine/types'
import { hasFeatNamed } from '../engine/feats'
import { highestCasterLevel } from '../engine/spellcasting'
import type {
  BudgetItemCalculated,
  BudgetItemInput,
  BudgetSummary,
} from '../../../shell/sidebar/tools/budgetCalculator/types'

export function getPf1eCurrentGold(character: CharacterDocument): number {
  const c = character.inventory.currency
  if (!c) return 0
  const total = (c.pp ?? 0) * 10 + (c.gp ?? 0) + (c.sp ?? 0) / 10 + (c.cp ?? 0) / 100
  return Math.round(total * 100) / 100
}

export function calculatePf1eBudget(
  character: CharacterDocument,
  derived: DerivedView,
  items: BudgetItemInput[],
): { items: BudgetItemCalculated[]; summary: BudgetSummary } {
  const currentGold = getPf1eCurrentGold(character)
  // The caster level the sheet shows, overrides included.
  const charCl = highestCasterLevel(derived)

  const spellcraftTotal = derived.skillTotals?.spellcraft ?? 0

  const calculatedItems: BudgetItemCalculated[] = []
  let buyAllTotal = 0
  let craftAllTotal = 0
  let mixedTotal = 0
  let totalCraftDays = 0
  let blockedCraftCount = 0

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1)
    const isMagic = !!item.isMagic
    const fullMarket = item.marketPrice * qty
    buyAllTotal += fullMarket

    let materialsPerUnit: number
    let craftDaysPerUnit: number
    let craftDc: number | null = null
    const reasons: string[] = []

    if (isMagic) {
      materialsPerUnit = Math.round((item.marketPrice / 2) * 100) / 100
      craftDaysPerUnit = Math.max(1, Math.ceil(item.marketPrice / 1000))
      const reqCl = item.casterLevelRequired ?? 1
      craftDc = 5 + reqCl

      // Check feat
      if (item.featRequired) {
        if (!hasFeatNamed(character.feats, item.featRequired)) {
          reasons.push(`missing ${item.featRequired}`)
        }
      }

      // Check CL
      if (charCl < reqCl) {
        reasons.push(`CL ${charCl} < ${reqCl}`)
      }

      // Check Spellcraft
      if (spellcraftTotal + 10 < craftDc) {
        reasons.push(`Spellcraft ${spellcraftTotal} < DC ${craftDc}`)
      }
    } else {
      // Mundane
      materialsPerUnit = Math.round((item.marketPrice / 3) * 100) / 100
      craftDaysPerUnit = Math.max(1, Math.ceil(item.marketPrice / 50))
      craftDc = item.marketPrice > 100 ? 15 : 10
    }

    const craftMaterialsCost = materialsPerUnit * qty
    const lineCraftDays = craftDaysPerUnit * qty
    craftAllTotal += craftMaterialsCost

    const canCraft = reasons.length === 0
    if (item.mode === 'craft' && !canCraft) {
      blockedCraftCount++
    }

    const lineCost = item.mode === 'craft' ? craftMaterialsCost : fullMarket
    mixedTotal += lineCost

    if (item.mode === 'craft') {
      totalCraftDays += lineCraftDays
    }

    calculatedItems.push({
      id: item.id,
      name: item.name,
      marketPrice: item.marketPrice,
      quantity: qty,
      mode: item.mode,
      isMagic,
      lineCost,
      craftMaterialsCost,
      craftTimeDays: lineCraftDays,
      craftDc,
      canCraft,
      reasons,
    })
  }

  const remainingGold = Math.round((currentGold - mixedTotal) * 100) / 100

  return {
    items: calculatedItems,
    summary: {
      buyAllTotal: Math.round(buyAllTotal * 100) / 100,
      craftAllTotal: Math.round(craftAllTotal * 100) / 100,
      mixedTotal: Math.round(mixedTotal * 100) / 100,
      totalCraftDays,
      currentGold,
      remainingGold,
      isDeficit: remainingGold < 0,
      blockedCraftCount,
    },
  }
}
