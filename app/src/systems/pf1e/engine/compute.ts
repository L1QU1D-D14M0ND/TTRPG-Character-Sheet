import type { CharacterDocument } from '../character/types'
import { skillPointsPerLevelFor } from '../content'
import { abilityModifiers, cmbAbilityModifier, effectiveAbilityScore, sizeAcAttackModifier, sizeCmbModifier } from './abilities'
import { armorClassValues, flatFootedDex } from './ac'
import { effectiveLoadCategory, loadThresholds, weightUsed } from './encumbrance'
import { applyOverrides } from './overrides'
import {
  characterLevel,
  iterativeAttacks,
  stackedBab,
  stackedSave,
} from './progressions'
import { spellcastingDerived } from './spellcasting'
import type { ComputeInput, DerivedView } from './types'
import { activeFusedOverlay, abilitiesForCompute } from './fused'
import {
  deadAtThreshold,
  defaultAttackAbility,
  maxHp,
  skillRanksBudget,
  skillRanksSpent,
  skillTotal,
  skillUsableUntrained,
} from './vitals'

export function compute(character: ComputeInput): DerivedView {
  const fused = activeFusedOverlay(character.companions)
  const body = abilitiesForCompute(character.abilities, character.companions)
  const mods = abilityModifiers(body)
  const pilotMods = abilityModifiers(character.abilities)
  const level = characterLevel(character.classes)
  const bab = stackedBab(character.classes)
  const size = character.identity.size
  const sizeAttack = sizeAcAttackModifier(size)
  const sizeCmb = sizeCmbModifier(size)
  const ac = armorClassValues(character.armorClass, mods.dex, size)
  const thresholds = loadThresholds(
    effectiveAbilityScore(body.str),
    size,
  )
  const carried = weightUsed(character.inventory.items)
  const pilotMaxHp = maxHp(
    character.vitals,
    character.classes,
    pilotMods.con,
  )

  const skillTotals: Record<string, number | null> = {}
  for (const skill of character.skills) {
    if (
      !skillUsableUntrained(
        skill.key,
        skill.ranks,
        character.vitals.speeds,
      )
    ) {
      skillTotals[skill.key] = null
      continue
    }
    skillTotals[skill.key] = skillTotal({
      ranks: skill.ranks,
      abilityMod: mods[skill.ability],
      classSkill: skill.classSkill,
      armorPenaltyApplies: skill.armorPenaltyApplies,
      armorCheckPenalty: character.armorClass.armorCheckPenalty,
      acpMultiplier: skill.key === 'swim' ? 2 : 1,
      misc: skill.misc ?? 0,
    })
  }

  const meleeAttack = bab + mods.str + sizeAttack + character.combat.meleeAttackMisc
  const rangedAttack = bab + mods.dex + sizeAttack + character.combat.rangedAttackMisc
  const babIteratives = iterativeAttacks(bab)

  const attacks: DerivedView['attacks'] = {}
  for (const attack of character.attacks) {
    const atkKey = attack.attackAbility ?? defaultAttackAbility(attack.attackType)
    const dmgKey = attack.damageAbility === undefined
      ? defaultAttackAbility(attack.attackType)
      : attack.damageAbility
    const attackBonus =
      bab +
      mods[atkKey] +
      sizeAttack +
      (attack.miscAttack ?? 0) +
      (attack.attackType === 'melee'
        ? character.combat.meleeAttackMisc
        : character.combat.rangedAttackMisc)
    const abilityDamage = dmgKey === null ? 0 : mods[dmgKey]
    const dmgMod = abilityDamage + (attack.miscDamage ?? 0)
    const dmgSign = dmgMod === 0 ? '' : dmgMod > 0 ? `+${dmgMod}` : `${dmgMod}`
    attacks[attack.id] = {
      attack: attackBonus,
      damage: `${attack.damageDice}${dmgSign}`,
      iteratives: babIteratives.map((step) => step + attackBonus - bab),
    }
  }

  const base: DerivedView = {
    level,
    abilityModifiers: mods,
    bab,
    babIteratives,
    maxHp: fused ? fused.costumeHp : pilotMaxHp,
    deadAt: deadAtThreshold(effectiveAbilityScore(body.con)),
    ac: ac.ac,
    touchAc: ac.touchAc,
    flatFootedAc: ac.flatFootedAc,
    cmb: bab + cmbAbilityModifier(size, mods) + sizeCmb + character.combat.cmbMisc,
    cmd:
      10 +
      bab +
      mods.str +
      mods.dex +
      sizeCmb +
      character.armorClass.dodge +
      character.armorClass.deflection +
      character.combat.cmdMisc,
    flatFootedCmd:
      10 +
      bab +
      mods.str +
      flatFootedDex(mods.dex) +
      sizeCmb +
      character.armorClass.deflection +
      character.combat.cmdMisc,
    initiative: mods.dex + character.combat.initiativeMisc,
    fortitude: stackedSave(character.classes, 'fort') + mods.con + character.combat.fortMisc,
    reflex: stackedSave(character.classes, 'ref') + mods.dex + character.combat.refMisc,
    will: stackedSave(character.classes, 'will') + mods.wis + character.combat.willMisc,
    meleeAttack,
    rangedAttack,
    skillTotals,
    weightUsed: carried,
    lightLoad: thresholds.light,
    mediumLoad: thresholds.medium,
    heavyLoad: thresholds.heavy,
    loadCategory: effectiveLoadCategory(
      carried,
      thresholds,
      character.inventory.ignoreWeight === true,
    ),
    skillRanksSpent: skillRanksSpent(character.skills),
    skillRanksBudget: skillRanksBudget({
      classes: character.classes.map((row) => ({
        levels: row.levels,
        skillPointsPerLevel: skillPointsPerLevelFor(row),
        favoredSkillRanks: row.favored?.skillRanks ?? 0,
      })),
      intMod: mods.int,
      humanBonusLevels:
        character.identity.race.id === 'race.human' ? level : 0,
    }),
    attacks,
    spellcasting: spellcastingDerived(
      character.spellcasting,
      character.classes,
      {
        str: effectiveAbilityScore(body.str),
        dex: effectiveAbilityScore(body.dex),
        con: effectiveAbilityScore(body.con),
        int: effectiveAbilityScore(character.abilities.int),
        wis: effectiveAbilityScore(character.abilities.wis),
        cha: effectiveAbilityScore(character.abilities.cha),
      },
      mods,
    ),
    overriddenPaths: [],
    ignoredOverridePaths: [],
    fusedActive: fused != null,
    pilotMaxHp,
  }

  return applyOverrides(base, character.overrides)
}

export function computeCharacter(character: CharacterDocument): DerivedView {
  return compute(character)
}
