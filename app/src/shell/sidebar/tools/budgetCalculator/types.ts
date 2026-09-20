export interface BudgetItemInput {
  id: string
  name: string
  marketPrice: number
  quantity: number
  mode: 'buy' | 'craft'
  isMagic?: boolean
  casterLevelRequired?: number
  featRequired?: string
}

export interface BudgetItemCalculated {
  id: string
  name: string
  marketPrice: number
  quantity: number
  mode: 'buy' | 'craft'
  isMagic: boolean
  lineCost: number
  craftMaterialsCost: number
  craftTimeDays: number
  craftDc: number | null
  canCraft: boolean
  reasons: string[]
}

export interface BudgetSummary {
  buyAllTotal: number
  craftAllTotal: number
  mixedTotal: number
  totalCraftDays: number
  currentGold: number
  remainingGold: number
  isDeficit: boolean
  blockedCraftCount: number
}
