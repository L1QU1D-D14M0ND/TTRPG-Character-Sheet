import type { CharacterDocument } from '../character/types'
import { hasFeat } from '../engine/feats'
import type { DerivedView } from '../engine/types'
import type {
  AttackHelperOption,
  AttackHelperOutput,
  AttackHelperToggle,
} from '../../../shell/sidebar/tools/attackHelper/types'

export function getPf1eAttackOptions(character: CharacterDocument): AttackHelperOption[] {
  return character.attacks.map((atk) => ({
    id: atk.id,
    name: atk.name,
    type: atk.attackType,
  }))
}

const POWER_ATTACK = { id: 'feat.power-attack', name: 'Power Attack' }
const COMBAT_EXPERTISE = { id: 'feat.combat-expertise', name: 'Combat Expertise' }
const POINT_BLANK_SHOT = { id: 'feat.point-blank-shot', name: 'Point-Blank Shot' }
const DEADLY_AIM = { id: 'feat.deadly-aim', name: 'Deadly Aim' }
const IMPROVED_UNARMED_STRIKE = {
  id: 'feat.improved-unarmed-strike',
  name: 'Improved Unarmed Strike',
}

export function getPf1eAvailableToggles(
  character: CharacterDocument,
  attackId: string,
): AttackHelperToggle[] {
  const attack = character.attacks.find((a) => a.id === attackId)
  if (!attack) return []

  const isMelee = attack.attackType === 'melee'
  const isRanged = attack.attackType === 'ranged'
  const feats = character.feats ?? []

  const toggles: AttackHelperToggle[] = []

  if (isMelee) {
    toggles.push({
      id: 'two_handed',
      labelKey: 'shell.attackHelper.twoHanded',
      labelFallback: 'Two-Handed Grip (1.5× Str / +50% Power Attack)',
      active: false,
      description: 'Wielding with two hands',
    })

    toggles.push({
      id: 'power_attack',
      labelKey: 'shell.attackHelper.powerAttack',
      labelFallback: 'Power Attack',
      active: false,
      description: hasFeat(feats, POWER_ATTACK)
        ? 'Feat available'
        : 'Situational',
    })

    toggles.push({
      id: 'combat_expertise',
      labelKey: 'shell.attackHelper.combatExpertise',
      labelFallback: 'Combat Expertise',
      active: false,
      description: hasFeat(feats, COMBAT_EXPERTISE)
        ? 'Feat available'
        : 'Situational',
    })

    toggles.push({
      id: 'charge',
      labelKey: 'shell.attackHelper.charge',
      labelFallback: 'Charge (+2 attack, -2 AC)',
      active: false,
    })

    toggles.push({
      id: 'flank',
      labelKey: 'shell.attackHelper.flank',
      labelFallback: 'Flanking (+2 attack)',
      active: false,
    })
  }

  if (isRanged) {
    toggles.push({
      id: 'point_blank',
      labelKey: 'shell.attackHelper.pointBlank',
      labelFallback: 'Point-Blank Shot (+1 atk / +1 dmg within 30 ft)',
      active: false,
      description: hasFeat(feats, POINT_BLANK_SHOT)
        ? 'Feat available'
        : 'Situational',
    })

    toggles.push({
      id: 'deadly_aim',
      labelKey: 'shell.attackHelper.deadlyAim',
      labelFallback: 'Deadly Aim',
      active: false,
      description: hasFeat(feats, DEADLY_AIM)
        ? 'Feat available'
        : 'Situational',
    })
  }

  return toggles
}

export function computePf1eAttackHelper(
  character: CharacterDocument,
  derived: DerivedView,
  attackId: string,
  activeToggleIds: Set<string>,
): AttackHelperOutput | null {
  const attack = character.attacks.find((a) => a.id === attackId)
  if (!attack) return null

  const baseDerived = derived.attacks[attack.id]
  const baseAttackBonus = baseDerived?.attack ?? 0
  const bab = derived.bab ?? 0

  let attackMod = 0
  let damageMod = 0
  const damageBreakdownParts: string[] = []

  const isTwoHanded = activeToggleIds.has('two_handed')
  const penaltyStep = 1 + Math.floor(bab / 4)

  // Power Attack
  if (activeToggleIds.has('power_attack')) {
    attackMod -= penaltyStep
    const paDmg = isTwoHanded ? 3 * penaltyStep : 2 * penaltyStep
    damageMod += paDmg
    damageBreakdownParts.push(`Power Attack: -${penaltyStep} atk / +${paDmg} dmg`)
  }

  // Combat Expertise
  if (activeToggleIds.has('combat_expertise')) {
    attackMod -= penaltyStep
    damageBreakdownParts.push(`Combat Expertise: -${penaltyStep} atk (+${penaltyStep} dodge AC)`)
  }

  // Deadly Aim
  if (activeToggleIds.has('deadly_aim')) {
    attackMod -= penaltyStep
    const daDmg = 2 * penaltyStep
    damageMod += daDmg
    damageBreakdownParts.push(`Deadly Aim: -${penaltyStep} atk / +${daDmg} dmg`)
  }

  // Charge
  if (activeToggleIds.has('charge')) {
    attackMod += 2
    damageBreakdownParts.push('Charge: +2 atk (-2 AC)')
  }

  // Flank
  if (activeToggleIds.has('flank')) {
    attackMod += 2
    damageBreakdownParts.push('Flanking: +2 atk')
  }

  // Point-Blank Shot
  if (activeToggleIds.has('point_blank')) {
    attackMod += 1
    damageMod += 1
    damageBreakdownParts.push('Point-Blank Shot: +1 atk / +1 dmg')
  }

  // Two-Handed extra Strength bonus if Str adds to damage
  if (isTwoHanded && baseDerived?.damageAbility === 'str') {
    const strMod = derived.abilityModifiers.str ?? 0
    if (strMod > 0) {
      const extraStr = Math.floor(strMod * 1.5) - strMod
      if (extraStr > 0) {
        damageMod += extraStr
        damageBreakdownParts.push(`Two-Handed Str (1.5×): +${extraStr} dmg`)
      }
    }
  }

  // Total attack bonus
  const finalAttackBonus = baseAttackBonus + attackMod
  const attackBonusString = finalAttackBonus >= 0 ? `+${finalAttackBonus}` : `${finalAttackBonus}`

  // Iteratives
  const iteratives = derived.babIteratives.map((step) => {
    const iterBonus = step + finalAttackBonus - bab
    return iterBonus >= 0 ? `+${iterBonus}` : `${iterBonus}`
  })

  // Total damage: the engine's dice and modifier, plus the toggles
  const dice = baseDerived?.damageDice ?? attack.damageDice
  const totalDamageMod = (baseDerived?.damageMod ?? 0) + damageMod
  const totalDmgSign = totalDamageMod === 0 ? '' : totalDamageMod > 0 ? `+${totalDamageMod}` : `${totalDamageMod}`
  const damageExpression = `${dice}${totalDmgSign}`

  // Critical hint
  const critRange = attack.critRange && attack.critRange < 20 ? `${attack.critRange}-20` : '20'
  const critMult = attack.critMultiplier ? `x${attack.critMultiplier}` : 'x2'
  const critHint = `${critRange} / ${critMult}`

  // Triggers
  const triggers: string[] = []
  if (attack.attackType === 'ranged') {
    triggers.push('Provokes Attack of Opportunity (ranged weapon in melee)')
  }
  const isUnarmed = attack.name.toLowerCase().includes('unarmed') || attack.name.toLowerCase().includes('punch')
  const hasIus = hasFeat(character.feats, IMPROVED_UNARMED_STRIKE)
  if (isUnarmed && !hasIus) {
    triggers.push('Provokes Attack of Opportunity (unarmed strike without Improved Unarmed Strike)')
  }

  // Inflicts
  const inflicts: string[] = []
  if (attack.damageType) {
    inflicts.push(`Damage type: ${attack.damageType}`)
  }
  if (attack.notes) {
    inflicts.push(`Notes: ${attack.notes}`)
  }

  return {
    attackBonusString,
    iterativeBonusStrings: iteratives,
    damageExpression,
    damageBreakdown: damageBreakdownParts.length > 0 ? damageBreakdownParts.join(', ') : 'Base values from character sheet',
    critHint,
    triggers,
    inflicts,
  }
}
