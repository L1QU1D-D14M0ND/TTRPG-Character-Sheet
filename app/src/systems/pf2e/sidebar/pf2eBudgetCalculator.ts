import type { CharacterDocument } from '../character/types'
import type { DerivedView } from '../engine/types'
import type {
  BudgetItemCalculated,
  BudgetItemInput,
  BudgetSummary,
} from '../../../shell/sidebar/tools/budgetCalculator/types'

export function getPf2eCurrentGold(character: CharacterDocument): number {
  const c = character.inventory.currency
  if (!c) return 0
  const total = (c.pp ?? 0) * 10 + (c.gp ?? 0) + (c.sp ?? 0) / 10 + (c.cp ?? 0) / 100
  return Math.round(total * 100) / 100
}

export function calculatePf2eBudget(
  character: CharacterDocument,
  _derived: DerivedView,
  items: BudgetItemInput[],
): { items: BudgetItemCalculated[]; summary: BudgetSummary } {
  const currentGold = getPf2eCurrentGold(character)
  const craftingSkill = character.skills?.find((s) => s.key === 'crafting')
  const craftingRank = craftingSkill?.rank ?? 'untrained'
  const isTrainedCrafting = craftingRank !== 'untrained'

  const calculatedItems: BudgetItemCalculated[] = []
  let buyAllTotal = 0
  let craftAllTotal = 0
  let mixedTotal = 0
  let totalCraftDays = 0
  let blockedCraftCount = 0

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1)
    const fullMarket = item.marketPrice * qty
    buyAllTotal += fullMarket

    const materialsPerUnit = Math.round((item.marketPrice / 2) * 100) / 100
    const craftMaterialsCost = materialsPerUnit * qty
    const lineCraftDays = 4 * qty // 4 days downtime per batch
    const craftDc = 15 // Standard Level 1-2 DC

    const reasons: string[] = []
    if (!isTrainedCrafting) {
      reasons.push('untrained in Crafting')
    }

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
      isMagic: !!item.isMagic,
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
