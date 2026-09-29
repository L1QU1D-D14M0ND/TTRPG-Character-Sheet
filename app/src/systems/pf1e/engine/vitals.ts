import type { AbilityKey, Vitals, ClassEntry } from '../character/types'

/** One HD from class rows in sheet order (Fighter 2 then Wizard 3 → five slots). */
export interface HitDieSlot {
  index: number
  characterLevel: number
  classRowId: string
  className: string
  hitDie: number
  classLevel: number
  firstLevel: boolean
}

export interface HitDieLine extends HitDieSlot {
  rolled: number | null
  conMod: number
  fromHd: number
  editable: boolean
}

export interface FavoredHpLine {
  classRowId: string
  className: string
  hp: number
}

export interface HpBreakdown {
  slots: HitDieLine[]
  extraRolls: Array<{ index: number; rolled: number; conMod: number; fromHd: number }>
  favored: FavoredHpLine[]
  fromDice: number
  fromFavored: number
  maxHp: number
  expectedHitDice: number
}

/** CRB: each HD grants max(1, die result + Con modifier). The app does not roll. */
export function hpFromHitDie(rolled: number, conMod: number): number {
  return Math.max(1, rolled + conMod)
}

export function hitDieSlots(classes: ClassEntry[]): HitDieSlot[] {
  const slots: HitDieSlot[] = []
  for (const row of classes) {
    for (let classLevel = 1; classLevel <= row.levels; classLevel += 1) {
      const index = slots.length
      slots.push({
        index,
        characterLevel: index + 1,
        classRowId: row.id,
        className: row.class.name || 'Class',
        hitDie: row.hitDie,
        classLevel,
        firstLevel: index === 0,
      })
    }
  }
  return slots
}

export function favoredHpLines(classes: ClassEntry[]): FavoredHpLine[] {
  return classes.map((row) => ({
    classRowId: row.id,
    className: row.class.name || 'Class',
    hp: row.favored?.hp ?? 0,
  }))
}

/**
 * Max HP = per recorded HD max(1, rolled + Con) + favored-class HP.
 * Missing rolls (fewer entries than class levels) contribute nothing.
 * Constitution applies once per recorded HD, not per class level with a missing roll.
 */
export function maxHp(
  vitals: Vitals,
  classes: ClassEntry[],
  conMod: number,
): number {
  const fromDice = vitals.hpRolled.reduce(
    (sum, rolled) => sum + hpFromHitDie(rolled, conMod),
    0,
  )
  const fromFavored = classes.reduce(
    (sum, row) => sum + (row.favored?.hp ?? 0),
    0,
  )
  return fromDice + fromFavored
}

export function hpBreakdown(
  vitals: Vitals,
  classes: ClassEntry[],
  conMod: number,
): HpBreakdown {
  const slotsSpec = hitDieSlots(classes)
  const expectedHitDice = slotsSpec.length
  const nextIndex = vitals.hpRolled.length
  const slots: HitDieLine[] = slotsSpec.map((slot) => {
    const rolled =
      slot.index < vitals.hpRolled.length ? vitals.hpRolled[slot.index]! : null
    return {
      ...slot,
      rolled,
      conMod,
      fromHd: rolled == null ? 0 : hpFromHitDie(rolled, conMod),
      editable: slot.index <= nextIndex,
    }
  })
  const extraRolls = vitals.hpRolled
    .slice(expectedHitDice)
    .map((rolled, offset) => {
      const index = expectedHitDice + offset
      return {
        index,
        rolled,
        conMod,
        fromHd: hpFromHitDie(rolled, conMod),
      }
    })
  const favored = favoredHpLines(classes)
  const fromFavored = classes.reduce(
    (sum, row) => sum + (row.favored?.hp ?? 0),
    0,
  )
  const fromDice = vitals.hpRolled.reduce(
    (sum, rolled) => sum + hpFromHitDie(rolled, conMod),
    0,
  )
  return {
    slots,
    extraRolls,
    favored,
    fromDice,
    fromFavored,
    maxHp: fromDice + fromFavored,
    expectedHitDice,
  }
}

/**
 * Write one HD roll. Rolls are filled in order (next empty slot or an
 * already-recorded slot). Clearing is allowed on the last recorded roll only.
 */
export function setHitDieRoll(
  hpRolled: number[],
  index: number,
  rolled: number | null,
): number[] {
  const next = [...hpRolled]
  if (rolled == null) {
    if (index === next.length - 1) next.pop()
    return next
  }
  if (index < next.length) {
    next[index] = rolled
    return next
  }
  if (index === next.length) {
    next.push(rolled)
    return next
  }
  return next
}

export function deadAtThreshold(conScore: number): number {
  return -conScore
}

/** CRB: cannot be used untrained. Fly also needs a fly speed. */
export const UNTRAINED_UNUSABLE_SKILLS = new Set([
  'disable-device',
  'handle-animal',
  'use-magic-device',
  'sleight-of-hand',
  'spellcraft',
  'linguistics',
  'profession',
])

export function hasFlySpeed(
  speeds: Array<{ kind: string; feet: number }> | undefined,
): boolean {
  return (speeds ?? []).some(
    (speed) => speed.kind.toLowerCase() === 'fly' && speed.feet > 0,
  )
}

export function skillUsableUntrained(
  key: string,
  ranks: number,
  speeds: Array<{ kind: string; feet: number }> | undefined,
): boolean {
  if (key === 'fly') return hasFlySpeed(speeds)
  if (UNTRAINED_UNUSABLE_SKILLS.has(key) || key.startsWith('profession')) return ranks >= 1
  return true
}

export function ranksExceedLevel(ranks: number, characterLevel: number): boolean {
  return ranks > characterLevel && characterLevel > 0
}

export function classSkillBonus(trained: boolean, classSkill: boolean): number {
  return trained && classSkill ? 3 : 0
}

export function skillTotal(args: {
  ranks: number
  abilityMod: number
  classSkill: boolean
  armorPenaltyApplies: boolean
  armorCheckPenalty: number
  misc: number
  acpMultiplier?: number
}): number {
  const trained = args.ranks >= 1
  const multiplier = args.acpMultiplier ?? 1
  const acp = args.armorPenaltyApplies
    ? args.armorCheckPenalty * multiplier
    : 0
  return (
    args.ranks +
    args.abilityMod +
    classSkillBonus(trained, args.classSkill) +
    acp +
    args.misc
  )
}

/** Ranks granted by one class row: levels × max(1, class table + Int). */
export function skillRanksFromClassLevel(
  levels: number,
  skillPointsPerLevel: number,
  intMod: number,
): number {
  return levels * Math.max(1, skillPointsPerLevel + intMod)
}

export function skillRanksSpent(skills: Array<{ ranks: number }>): number {
  return skills.reduce((sum, skill) => sum + skill.ranks, 0)
}

export function skillRanksBudget(args: {
  classes: Array<{
    levels: number
    skillPointsPerLevel: number
    favoredSkillRanks: number
  }>
  intMod: number
  humanBonusLevels: number
}): number {
  let total = args.humanBonusLevels
  for (const row of args.classes) {
    total += skillRanksFromClassLevel(
      row.levels,
      row.skillPointsPerLevel,
      args.intMod,
    )
    total += row.favoredSkillRanks
  }
  return total
}

export function defaultAttackAbility(
  attackType: 'melee' | 'ranged',
): AbilityKey {
  return attackType === 'ranged' ? 'dex' : 'str'
}
