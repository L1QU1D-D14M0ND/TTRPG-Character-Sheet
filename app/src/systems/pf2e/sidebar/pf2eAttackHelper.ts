import type { CharacterDocument, StrikeEntry } from '../character/types'
import type { DerivedView } from '../engine/types'
import type {
  AttackHelperOption,
  AttackHelperOutput,
  AttackHelperToggle,
} from '../../../shell/sidebar/tools/attackHelper/types'

export function getPf2eAttackOptions(character: CharacterDocument): AttackHelperOption[] {
  return character.strikes.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.name.toLowerCase().includes('bow') || s.name.toLowerCase().includes('crossbow') || s.name.toLowerCase().includes('dart')
      ? 'ranged'
      : 'melee',
  }))
}

export function isAgileStrike(strike: StrikeEntry, character: CharacterDocument): boolean {
  // Check strike traits or linked item traits
  const linkedItem = character.inventory.items.find((i) => i.id === strike.itemId)
  const itemNotes = (linkedItem?.notes ?? '').toLowerCase()
  const strikeName = strike.name.toLowerCase()
  return (
    (strike.traits ?? []).some((t) => t.toLowerCase() === 'agile') ||
    itemNotes.includes('agile') ||
    (linkedItem?.traits ?? []).some((t) => t.toLowerCase() === 'agile') ||
    strikeName.includes('agile') ||
    strikeName.includes('fist') ||
    strikeName.includes('dagger') ||
    strikeName.includes('shortsword')
  )
}

export function getPf2eAvailableToggles(
  character: CharacterDocument,
  strikeId: string,
): AttackHelperToggle[] {
  const strike = character.strikes.find((s) => s.id === strikeId)
  if (!strike) return []

  return [
    {
      id: 'off_guard',
      labelKey: 'shell.attackHelper.offGuard',
      labelFallback: 'Target Off-Guard (-2 AC)',
      active: false,
      description: 'Target is flat-footed / off-guard',
    },
    {
      id: 'cover_standard',
      labelKey: 'shell.attackHelper.coverStandard',
      labelFallback: 'Target Standard Cover (+2 AC)',
      active: false,
      description: 'Target has standard cover (+2 circumstance AC)',
    },
    {
      id: 'status_bless',
      labelKey: 'shell.attackHelper.statusBless',
      labelFallback: 'Status Bonus (+1 to-hit)',
      active: false,
      description: 'Bless, Heroism, or similar status bonus',
    },
  ]
}

export function computePf2eAttackHelper(
  character: CharacterDocument,
  derived: DerivedView,
  strikeId: string,
  activeToggleIds: Set<string>,
): AttackHelperOutput | null {
  const strike = character.strikes.find((s) => s.id === strikeId)
  if (!strike) return null

  const baseDerived = derived.strikes[strike.id]
  const baseAttackBonus = baseDerived?.attack ?? 0

  let attackMod = 0
  const breakdownParts: string[] = []

  if (activeToggleIds.has('status_bless')) {
    attackMod += 1
    breakdownParts.push('Status: +1')
  }

  if (activeToggleIds.has('off_guard')) {
    breakdownParts.push('Target Off-Guard: -2 target AC (effective +2)')
  }

  if (activeToggleIds.has('cover_standard')) {
    breakdownParts.push('Target Cover: +2 target AC')
  }

  const finalAttackBonus = baseAttackBonus + attackMod
  const attackBonusString = finalAttackBonus >= 0 ? `+${finalAttackBonus}` : `${finalAttackBonus}`

  // MAP (Multiple Attack Penalty)
  const isAgile = isAgileStrike(strike, character)
  const map2Penalty = isAgile ? 4 : 5
  const map3Penalty = isAgile ? 8 : 10

  const iter1 = attackBonusString
  const iter2Num = finalAttackBonus - map2Penalty
  const iter2 = iter2Num >= 0 ? `+${iter2Num}` : `${iter2Num}`
  const iter3Num = finalAttackBonus - map3Penalty
  const iter3 = iter3Num >= 0 ? `+${iter3Num}` : `${iter3Num}`

  const iterativeBonusStrings = [
    `1st: ${iter1}`,
    `2nd (${isAgile ? '-4 agile' : '-5'}): ${iter2}`,
    `3rd (${isAgile ? '-8 agile' : '-10'}): ${iter3}`,
  ]

  const damageExpression = baseDerived?.damage ?? strike.damageDice
  const critHint = 'Crit Success: AC + 10 or Nat 20 (Double Damage)'

  const triggers: string[] = []
  const isRanged = strike.name.toLowerCase().includes('bow') || strike.name.toLowerCase().includes('crossbow')
  if (isRanged) {
    triggers.push('Triggers Reactive Strike / AoO if used in enemy reach')
  }

  const inflicts: string[] = []
  if (isAgile) {
    inflicts.push('Agile (reduced MAP: -4 / -8)')
  }
  const linkedItem = character.inventory.items.find((i) => i.id === strike.itemId)
  if (linkedItem?.notes) {
    inflicts.push(`Traits: ${linkedItem.notes}`)
  }

  return {
    attackBonusString,
    iterativeBonusStrings,
    damageExpression,
    damageBreakdown: breakdownParts.length > 0 ? breakdownParts.join(', ') : 'Base values from character sheet',
    critHint,
    triggers,
    inflicts,
  }
}
