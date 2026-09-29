import type {
  CharacterDocument,
  ProficiencyRank,
  StrikeEntry,
} from '../character/types'
import type { AttributeKey } from '../character/types'
import { findItem } from './ac'
import { proficiencyBonus } from './proficiency'
import { stackBreakdown } from './stacking'
import { signed, type StrikeDerived } from './types'

function weaponRank(
  strike: StrikeEntry,
  character: Pick<CharacterDocument, 'proficiencies' | 'inventory'>,
): ProficiencyRank {
  const specific = character.proficiencies.weapons.specific ?? []
  const linked = findItem(character.inventory.items, strike.itemId)
  const weaponRefId = linked?.item.id
  if (weaponRefId) {
    const match = specific.find((row) => row.weapon.id === weaponRefId)
    if (match) return match.rank
  }
  const category = strike.weaponCategory ?? 'other'
  if (category === 'other') return 'untrained'
  return character.proficiencies.weapons[category]
}

export function scaleDamageDice(
  damageDice: string,
  strikingRune?: 'none' | 'striking' | 'greaterStriking' | 'majorStriking',
): string {
  if (!strikingRune || strikingRune === 'none') return damageDice
  const targetCount =
    strikingRune === 'majorStriking' ? 4 :
    strikingRune === 'greaterStriking' ? 3 : 2
  const match = damageDice.match(/^(\d+)(d\d+.*)$/)
  if (match) {
    const currentCount = parseInt(match[1], 10)
    if (currentCount < targetCount) {
      return `${targetCount}${match[2]}`
    }
  }
  return damageDice
}

export function strikeAttack(
  strike: StrikeEntry,
  character: Pick<CharacterDocument, 'identity' | 'proficiencies' | 'inventory'>,
  attributeModifiers: Record<AttributeKey, number>,
): number {
  const attrKey = strike.attackAttribute ?? 'str'
  const attr = attributeModifiers[attrKey] ?? 0
  const rank = weaponRank(strike, character)
  const proficiency = proficiencyBonus(rank, character.identity.level)
  const linked = findItem(character.inventory.items, strike.itemId)
  const potency = linked?.weapon?.potencyRune ?? 0
  const extras = stackBreakdown(strike.modifiers, {
    item: potency !== 0 ? [potency] : [],
  })
  return attr + proficiency + extras
}

export function strikeDamage(
  strike: StrikeEntry,
  attributeModifiers: Record<AttributeKey, number>,
  character?: Pick<CharacterDocument, 'inventory'>,
): string {
  const linked = character ? findItem(character.inventory.items, strike.itemId) : undefined
  const striking = linked?.weapon?.strikingRune
  const effectiveDice = scaleDamageDice(strike.damageDice, striking)
  const attrKey = strike.damageAttribute
  const bonus = attrKey ? (attributeModifiers[attrKey] ?? 0) : 0
  if (!attrKey || bonus === 0) return effectiveDice
  return `${effectiveDice}${signed(bonus)}`
}

export function strikeDerived(
  strike: StrikeEntry,
  character: Pick<CharacterDocument, 'identity' | 'proficiencies' | 'inventory'>,
  attributeModifiers: Record<AttributeKey, number>,
): StrikeDerived {
  return {
    attack: strikeAttack(strike, character, attributeModifiers),
    damage: strikeDamage(strike, attributeModifiers, character),
  }
}

export function allStrikeDerived(
  character: Pick<
    CharacterDocument,
    'identity' | 'proficiencies' | 'inventory' | 'strikes'
  >,
  attributeModifiers: Record<AttributeKey, number>,
): Record<string, StrikeDerived> {
  const result: Record<string, StrikeDerived> = {}
  for (const strike of character.strikes) {
    result[strike.id] = strikeDerived(strike, character, attributeModifiers)
  }
  return result
}
