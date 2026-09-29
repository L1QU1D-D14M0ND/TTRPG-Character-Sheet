/**
 * Masterwork and enhancement on one weapon, second head, armor, or shield.
 *
 * Enhancement 1–5 is stored and forces masterwork. Zero deletes the enhancement
 * field. Masterwork is stored only as true, or the field is omitted. Unchecking
 * masterwork while an enhancement remains leaves masterwork set.
 */

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
