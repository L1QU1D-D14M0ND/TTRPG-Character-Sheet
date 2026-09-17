import type { AbilityKey, ClassEntry, SpellcastingEntry } from '../character/types'
import { classSpellsPerDayRow } from '../content'

/** Spell DC = 10 + spell level + ability modifier (CRB). */
export function spellDc(spellLevel: number, abilityMod: number): number {
  return 10 + spellLevel + abilityMod
}

/**
 * Bonus spells per day from a high ability score (CRB table).
 * Level 0 (cantrips/orisons) never receive bonus slots.
 */
export function bonusSpellsFromAbility(
  abilityScore: number,
  spellLevel: number,
): number {
  if (spellLevel < 1 || spellLevel > 9) return 0
  const mod = Math.floor((abilityScore - 10) / 2)
  if (mod < spellLevel) return 0
  return Math.floor((mod - spellLevel) / 4) + 1
}

export function bonusSlotsByLevel(abilityScore: number): number[] {
  return Array.from({ length: 10 }, (_, spellLevel) =>
    bonusSpellsFromAbility(abilityScore, spellLevel),
  )
}

export function dcByLevel(abilityMod: number): number[] {
  return Array.from({ length: 10 }, (_, spellLevel) =>
    spellDc(spellLevel, abilityMod),
  )
}

export function casterLevelForEntry(
  entry: SpellcastingEntry,
  classes: ClassEntry[],
): number {
  if (entry.casterLevelOverride != null) return entry.casterLevelOverride
  if (entry.classRowId) {
    const row = classes.find((cls) => cls.id === entry.classRowId)
    return row?.levels ?? 0
  }
  return 0
}

/** Ability score needed to cast a spell of this level (10 + spell level). */
export function minAbilityToCast(spellLevel: number): number {
  return 10 + spellLevel
}

export function isSpecialistWizard(classRow?: ClassEntry): boolean {
  if (!classRow) return false
  const school = classRow.arcaneSchool?.specialized?.trim().toLowerCase()
  return Boolean(school && school !== 'universalist')
}

/**
 * Default max slots: class table + ability bonus (+ school slot for specialist wizards),
 * only if the class can already cast that level and the score meets 10 + spell level.
 * No table (or a dash) → 0.
 */
export function defaultSlotMax(
  classSlot: number | null,
  abilityScore: number,
  spellLevel: number,
  hasSchoolSlot = false,
): number {
  if (classSlot == null) return 0
  if (abilityScore < minAbilityToCast(spellLevel)) return 0
  const schoolBonus = hasSchoolSlot && spellLevel >= 1 ? 1 : 0
  return classSlot + bonusSpellsFromAbility(abilityScore, spellLevel) + schoolBonus
}

export function storedSlotMax(
  entry: SpellcastingEntry,
  spellLevel: number,
): number | null {
  const row = entry.slots.find((slot) => slot.spellLevel === spellLevel)
  return row?.max ?? null
}

export function effectiveSlotMax(
  entry: SpellcastingEntry,
  spellLevel: number,
  classSlot: number | null,
  abilityScore: number,
  hasSchoolSlot = false,
): number {
  const custom = storedSlotMax(entry, spellLevel)
  if (custom != null) return custom
  return defaultSlotMax(classSlot, abilityScore, spellLevel, hasSchoolSlot)
}

export interface SpellcastingDerived {
  casterLevel: number
  ability: AbilityKey
  abilityMod: number
  dcByLevel: number[]
  bonusSlotsByLevel: number[]
  schoolSlotsByLevel: number[]
  classSlotsByLevel: Array<number | null>
  slotMaxByLevel: number[]
}

export function spellcastingDerived(
  entries: SpellcastingEntry[],
  classes: ClassEntry[],
  scores: Record<AbilityKey, number>,
  mods: Record<AbilityKey, number>,
): Record<string, SpellcastingDerived> {
  const result: Record<string, SpellcastingDerived> = {}
  for (const entry of entries) {
    const abilityMod = mods[entry.ability]
    const abilityScore = scores[entry.ability]
    const classRow = entry.classRowId
      ? classes.find((cls) => cls.id === entry.classRowId)
      : undefined
    const table = classSpellsPerDayRow(classRow?.class.id, classRow?.levels ?? 0)
    const classSlotsByLevel: Array<number | null> = Array.from(
      { length: 10 },
      (_, spellLevel) => table?.[spellLevel] ?? null,
    )
    const hasSchoolSlot = isSpecialistWizard(classRow)
    const schoolSlotsByLevel: number[] = Array.from(
      { length: 10 },
      (_, spellLevel) =>
        hasSchoolSlot &&
        spellLevel >= 1 &&
        classSlotsByLevel[spellLevel] != null &&
        abilityScore >= minAbilityToCast(spellLevel)
          ? 1
          : 0,
    )
    result[entry.id] = {
      casterLevel: casterLevelForEntry(entry, classes),
      ability: entry.ability,
      abilityMod,
      dcByLevel: dcByLevel(abilityMod),
      bonusSlotsByLevel: bonusSlotsByLevel(abilityScore),
      schoolSlotsByLevel,
      classSlotsByLevel,
      slotMaxByLevel: classSlotsByLevel.map((classSlot, spellLevel) =>
        effectiveSlotMax(entry, spellLevel, classSlot, abilityScore, hasSchoolSlot),
      ),
    }
  }
  return result
}
