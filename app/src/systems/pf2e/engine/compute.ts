import type { CharacterDocument } from '../character/types'
import { attributeModifiers } from './attributes'
import { armorClassTotal, equippedArmor } from './ac'
import {
  bulkCapacityTenths,
  bulkMaximumTenths,
  bulkUsedTenths,
  investedCount,
  tenthsToBulk,
} from './bulk'
import { rankedBonus, classDcValue } from './checks'
import { maxHp } from './hp'
import { applyOverrides } from './overrides'
import { skillTotals } from './skills'
import { allStrikeDerived } from './strikes'
import { spellcastingDerived } from './spellcasting'
import type { ComputeInput, DerivedView } from './types'

export function resilientRuneBonus(
  character: Pick<CharacterDocument, 'armorClass' | 'inventory'>,
): number {
  const armor = equippedArmor(character)?.armor
  if (!armor) return 0
  switch (armor.resilientRune) {
    case 'resilient':
      return 1
    case 'greaterResilient':
      return 2
    case 'majorResilient':
      return 3
    default:
      return 0
  }
}

export function maxDyingThreshold(
  character: Pick<CharacterDocument, 'vitals'> &
    Partial<Pick<CharacterDocument, 'feats' | 'conditions'>>,
): number {
  const hasDiehard = (character.feats ?? []).some((f) => {
    const id = f.feat?.id?.toLowerCase() ?? ''
    const name = f.feat?.name?.toLowerCase() ?? ''
    return id.includes('diehard') || name.includes('diehard')
  })
  const baseDying = hasDiehard ? 5 : 4

  let doomed = character.vitals?.doomed ?? 0
  const condDoomed = (character.conditions ?? []).find((c) => {
    const name = c.condition?.name?.toLowerCase() ?? ''
    const id = c.condition?.id?.toLowerCase() ?? ''
    return name === 'doomed' || id.includes('doomed')
  })
  if (condDoomed && condDoomed.value != null) {
    doomed = Math.max(doomed, condDoomed.value)
  }

  return Math.max(1, baseDying - doomed)
}

export function compute(character: ComputeInput): DerivedView {
  const attrs = attributeModifiers(character.attributes)
  const level = character.identity.level
  const bulkBonus = character.inventory.bulkBonus ?? 0
  const resilient = resilientRuneBonus(character)
  const saveExtras = resilient > 0 ? { item: [resilient] } : undefined

  const base: DerivedView = {
    attributeModifiers: attrs,
    maxHp: maxHp(character, attrs.con),
    ac: armorClassTotal(character, attrs.dex),
    perception: rankedBonus(character.proficiencies.perception, level, attrs),
    fortitude: rankedBonus(
      character.proficiencies.fortitude,
      level,
      attrs,
      saveExtras,
    ),
    reflex: rankedBonus(
      character.proficiencies.reflex,
      level,
      attrs,
      saveExtras,
    ),
    will: rankedBonus(character.proficiencies.will, level, attrs, saveExtras),
    classDC: classDcValue(character.proficiencies.classDC, level, attrs),
    skillTotals: skillTotals(character, attrs),
    bulkUsed: tenthsToBulk(bulkUsedTenths(character.inventory.items)),
    bulkCapacity: tenthsToBulk(
      bulkCapacityTenths(attrs.str, bulkBonus, character.identity.size),
    ),
    bulkMaximum: tenthsToBulk(
      bulkMaximumTenths(attrs.str, bulkBonus, character.identity.size),
    ),
    investedCount: investedCount(character.inventory.items),
    maxDying: maxDyingThreshold(character),
    strikes: allStrikeDerived(character, attrs),
    spellcasting: spellcastingDerived(character.spellcasting, level, attrs),
    overriddenPaths: [],
    ignoredOverridePaths: [],
  }

  return applyOverrides(base, character.overrides)
}

export function computeCharacter(character: CharacterDocument): DerivedView {
  return compute(character)
}
