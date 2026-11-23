/**
 * Magic overlay: masterwork and enhancement on one weapon, second head,
 * armor, or shield, plus the badge and suggested CRB market price they imply.
 *
 * Enhancement 1–5 is stored and forces masterwork. Zero deletes the enhancement
 * field. Masterwork is stored only as true, or the field is omitted. Unchecking
 * masterwork while an enhancement remains leaves masterwork set.
 */
import type { ItemEntry } from '../character/types'
import { computeSuggestedMagicPrice } from './crbMagicProperties'


export interface MagicOverlayFields {
  enhancementBonus?: number
  masterwork?: boolean
}

export function masterworkChecked(slot: MagicOverlayFields): boolean {
  return slot.masterwork ?? Boolean(slot.enhancementBonus)
}

/** `+N` when enhanced, `MWK` when only masterwork, otherwise nothing. */
export function magicBadge(slot: MagicOverlayFields | undefined): string | null {
  if (!slot?.enhancementBonus) {
    return slot?.masterwork ? 'MWK' : null
  }
  return `+${slot.enhancementBonus}`
}

export function setMasterwork<T extends MagicOverlayFields>(
  slot: T,
  checked: boolean,
): T {
  const next = { ...slot }
  if (checked || next.enhancementBonus) next.masterwork = true
  else delete next.masterwork
  return next
}

export function setEnhancement<T extends MagicOverlayFields>(
  slot: T,
  bonus: number,
): T {
  const next = { ...slot }
  if (bonus > 0) {
    next.enhancementBonus = bonus
    next.masterwork = true
  } else {
    delete next.enhancementBonus
  }
  return next
}

/** Badge for an item row: its weapon, else armor, else shield overlay. */
export function itemMagicBadge(item: ItemEntry): string | null {
  return magicBadge(item.weapon) ?? magicBadge(item.armor) ?? magicBadge(item.shield)
}

/**
 * Suggested CRB market price for an item row: base price plus masterwork,
 * enhancement, and special-ability costs of its weapon, armor, or shield
 * overlay. Null for a row with no such slot, or a mundane, untagged one.
 */
export function suggestedMagicPrice(item: ItemEntry): number | null {
  const kind = item.weapon ? 'weapon' : item.armor ? 'armor' : item.shield ? 'shield' : null
  const slot = item.weapon ?? item.armor ?? item.shield
  if (!kind || !slot) return null
  return computeSuggestedMagicPrice({
    kind,
    basePriceGp: item.priceGp ?? 0,
    masterwork: slot.masterwork,
    enhancementBonus: slot.enhancementBonus,
    properties: slot.properties,
  })
}
