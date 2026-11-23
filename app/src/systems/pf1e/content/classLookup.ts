import type { ClassEntry, SkillEntry } from '../character/types'
import { STANDARD_SKILLS } from '../character/standardSkills'
import { resolve } from './catalogIndex'

const STANDARD_SKILL_KEYS = new Set(STANDARD_SKILLS.map((row) => row.key))

/** Union of catalog class-skill keys for the given class rows. */
export function classSkillKeySet(classes: ClassEntry[]): Set<string> {
  const keys = new Set<string>()
  for (const row of classes) {
    const found = resolve('class', row.class.id)
    if (!found) continue
    for (const key of found.classSkills) keys.add(key)
  }
  return keys
}

/**
 * Stamp class-skill checkboxes from the catalog union.
 * Standard CRB skills are overwritten. Craft/Perform/Profession extras keep
 * their current checkbox. Does not change ranks.
 */
export function stampClassSkills(
  skills: SkillEntry[],
  classes: ClassEntry[],
): SkillEntry[] {
  const keys = classSkillKeySet(classes)
  return skills.map((skill) => {
    if (!STANDARD_SKILL_KEYS.has(skill.key)) return skill
    return { ...skill, classSkill: keys.has(skill.key) }
  })
}

/** Row field if present; otherwise catalog; otherwise 0. */
export function skillPointsPerLevelFor(row: ClassEntry): number {
  if (row.skillPointsPerLevel != null) return row.skillPointsPerLevel
  return resolve('class', row.class.id)?.skillPointsPerLevel ?? 0
}

/**
 * Class spells-per-day row for a class level (1–20).
 * null = no table (non-caster, unknown id, or level < 1).
 * Cell null = cannot cast that spell level yet. 0 = table lists 0.
 */
export function classSpellsPerDayRow(
  classId: string | null | undefined,
  classLevel: number,
): Array<number | null> | null {
  const found = resolve('class', classId)
  if (!found?.spellsPerDay || classLevel < 1) return null
  const index = Math.min(20, classLevel) - 1
  return found.spellsPerDay[index] ?? null
}

