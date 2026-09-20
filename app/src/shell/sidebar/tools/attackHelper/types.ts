export interface AttackHelperToggle {
  id: string
  labelKey: string
  labelFallback: string
  active: boolean
  description?: string
}

export interface AttackHelperOutput {
  attackBonusString: string
  iterativeBonusStrings: string[]
  damageExpression: string
  damageBreakdown: string
  critHint: string
  triggers: string[]
  inflicts: string[]
}

export interface AttackHelperOption {
  id: string
  name: string
  type: 'melee' | 'ranged'
}
