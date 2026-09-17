export interface MagicPropertyDescriptor {
  id: string
  name: string
  bonusEquivalent: number
  flatGpCost?: number
}

export const CRB_WEAPON_SPECIAL_ABILITIES: readonly MagicPropertyDescriptor[] = [
  { id: 'bane', name: 'Bane', bonusEquivalent: 1 },
  { id: 'defending', name: 'Defending', bonusEquivalent: 1 },
  { id: 'flaming', name: 'Flaming', bonusEquivalent: 1 },
  { id: 'frost', name: 'Frost', bonusEquivalent: 1 },
  { id: 'ghost-touch', name: 'Ghost Touch', bonusEquivalent: 1 },
  { id: 'keen', name: 'Keen', bonusEquivalent: 1 },
  { id: 'ki-focus', name: 'Ki Focus', bonusEquivalent: 1 },
  { id: 'merciful', name: 'Merciful', bonusEquivalent: 1 },
  { id: 'mighty-cleaving', name: 'Mighty Cleaving', bonusEquivalent: 1 },
  { id: 'shock', name: 'Shock', bonusEquivalent: 1 },
  { id: 'spell-storing', name: 'Spell Storing', bonusEquivalent: 1 },
  { id: 'throwing', name: 'Throwing', bonusEquivalent: 1 },
  { id: 'thundering', name: 'Thundering', bonusEquivalent: 1 },
  { id: 'vicious', name: 'Vicious', bonusEquivalent: 1 },
  { id: 'distance', name: 'Distance', bonusEquivalent: 1 },
  { id: 'returning', name: 'Returning', bonusEquivalent: 1 },
  { id: 'seeking', name: 'Seeking', bonusEquivalent: 1 },
  { id: 'anarchic', name: 'Anarchic', bonusEquivalent: 2 },
  { id: 'axiomatic', name: 'Axiomatic', bonusEquivalent: 2 },
  { id: 'disruption', name: 'Disruption', bonusEquivalent: 2 },
  { id: 'flaming-burst', name: 'Flaming Burst', bonusEquivalent: 2 },
  { id: 'holy', name: 'Holy', bonusEquivalent: 2 },
  { id: 'icy-burst', name: 'Icy Burst', bonusEquivalent: 2 },
  { id: 'shocking-burst', name: 'Shocking Burst', bonusEquivalent: 2 },
  { id: 'unholy', name: 'Unholy', bonusEquivalent: 2 },
  { id: 'wounding', name: 'Wounding', bonusEquivalent: 2 },
  { id: 'speed', name: 'Speed', bonusEquivalent: 3 },
  { id: 'brilliant-energy', name: 'Brilliant Energy', bonusEquivalent: 4 },
  { id: 'dancing', name: 'Dancing', bonusEquivalent: 4 },
  { id: 'vorpal', name: 'Vorpal', bonusEquivalent: 5 },
]

export const CRB_ARMOR_SPECIAL_ABILITIES: readonly MagicPropertyDescriptor[] = [
  { id: 'glamered', name: 'Glamered', bonusEquivalent: 0, flatGpCost: 2700 },
  { id: 'fortification-light', name: 'Fortification (light)', bonusEquivalent: 1 },
  { id: 'slick', name: 'Slick', bonusEquivalent: 0, flatGpCost: 3750 },
  { id: 'shadow', name: 'Shadow', bonusEquivalent: 0, flatGpCost: 3750 },
  { id: 'spell-resistance-13', name: 'Spell Resistance (13)', bonusEquivalent: 2 },
  { id: 'improved-slick', name: 'Slick (improved)', bonusEquivalent: 0, flatGpCost: 15000 },
  { id: 'shadow-improved', name: 'Shadow (improved)', bonusEquivalent: 0, flatGpCost: 15000 },
  { id: 'energy-resistance', name: 'Energy Resistance', bonusEquivalent: 0, flatGpCost: 18000 },
  { id: 'ghost-touch', name: 'Ghost Touch', bonusEquivalent: 3 },
  { id: 'invulnerability', name: 'Invulnerability', bonusEquivalent: 3 },
  { id: 'fortification-moderate', name: 'Fortification (moderate)', bonusEquivalent: 3 },
  { id: 'spell-resistance-15', name: 'Spell Resistance (15)', bonusEquivalent: 3 },
  { id: 'wild', name: 'Wild', bonusEquivalent: 3 },
  { id: 'slick-greater', name: 'Slick (greater)', bonusEquivalent: 0, flatGpCost: 33750 },
  { id: 'shadow-greater', name: 'Shadow (greater)', bonusEquivalent: 0, flatGpCost: 33750 },
  { id: 'energy-resistance-improved', name: 'Energy Resistance (improved)', bonusEquivalent: 0, flatGpCost: 42000 },
  { id: 'spell-resistance-17', name: 'Spell Resistance (17)', bonusEquivalent: 4 },
  { id: 'energy-resistance-greater', name: 'Energy Resistance (greater)', bonusEquivalent: 0, flatGpCost: 66000 },
  { id: 'fortification-heavy', name: 'Fortification (heavy)', bonusEquivalent: 5 },
  { id: 'spell-resistance-19', name: 'Spell Resistance (19)', bonusEquivalent: 5 },
]

export const CRB_SHIELD_SPECIAL_ABILITIES: readonly MagicPropertyDescriptor[] = [
  { id: 'arrow-catching', name: 'Arrow Catching', bonusEquivalent: 1 },
  { id: 'bashing', name: 'Bashing', bonusEquivalent: 1 },
  { id: 'blinding', name: 'Blinding', bonusEquivalent: 1 },
  { id: 'fortification-light', name: 'Fortification (light)', bonusEquivalent: 1 },
  { id: 'arrow-deflection', name: 'Arrow Deflection', bonusEquivalent: 2 },
  { id: 'animated', name: 'Animated', bonusEquivalent: 2 },
  { id: 'spell-resistance-13', name: 'Spell Resistance (13)', bonusEquivalent: 2 },
  { id: 'fortification-moderate', name: 'Fortification (moderate)', bonusEquivalent: 3 },
  { id: 'ghost-touch', name: 'Ghost Touch', bonusEquivalent: 3 },
  { id: 'spell-resistance-15', name: 'Spell Resistance (15)', bonusEquivalent: 3 },
  { id: 'wild', name: 'Wild', bonusEquivalent: 3 },
  { id: 'reflecting', name: 'Reflecting', bonusEquivalent: 5 },
  { id: 'fortification-heavy', name: 'Fortification (heavy)', bonusEquivalent: 5 },
  { id: 'spell-resistance-19', name: 'Spell Resistance (19)', bonusEquivalent: 5 },
]

export function getPropertiesForKind(
  kind: 'weapon' | 'armor' | 'shield',
): readonly MagicPropertyDescriptor[] {
  switch (kind) {
    case 'weapon':
      return CRB_WEAPON_SPECIAL_ABILITIES
    case 'armor':
      return CRB_ARMOR_SPECIAL_ABILITIES
    case 'shield':
      return CRB_SHIELD_SPECIAL_ABILITIES
  }
}

/**
 * Calculates standard CRB market price for a masterwork/magic weapon, armor, or shield.
 * Returns null if not masterwork and not enhanced (i.e. mundane standard).
 */
export function computeSuggestedMagicPrice({
  kind,
  basePriceGp = 0,
  masterwork,
  enhancementBonus,
  properties = [],
}: {
  kind: 'weapon' | 'armor' | 'shield'
  basePriceGp?: number
  masterwork?: boolean
  enhancementBonus?: number
  properties?: readonly string[]
}): number | null {
  const isMagic = Boolean(enhancementBonus && enhancementBonus > 0)
  const isMasterwork = Boolean(masterwork || isMagic)

  if (!isMasterwork && !isMagic && properties.length === 0) {
    return null
  }

  const mwkCost = kind === 'weapon' ? 300 : 150
  let totalBonus = enhancementBonus ?? 0
  let flatCostSum = 0

  const catalog = getPropertiesForKind(kind)
  const catalogMap = new Map<string, MagicPropertyDescriptor>(
    catalog.map((p) => [p.id, p]),
  )

  for (const tag of properties) {
    const desc = catalogMap.get(tag)
    if (desc) {
      totalBonus += desc.bonusEquivalent
      flatCostSum += desc.flatGpCost ?? 0
    }
  }

  const multiplier = kind === 'weapon' ? 2000 : 1000
  const enhancementCost = totalBonus > 0 ? totalBonus * totalBonus * multiplier : 0

  return basePriceGp + mwkCost + enhancementCost + flatCostSum
}
