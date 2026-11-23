import { STANDARD_SKILLS } from '../character/standardSkills'

const STANDARD_SKILL_ORDER = new Map(
  STANDARD_SKILLS.map((row, index) => [row.key, index]),
)

export function seededClassSkills(keys: readonly string[]): string[] {
  return [...keys].sort((left, right) => {
    const a = STANDARD_SKILL_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER
    const b = STANDARD_SKILL_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER
    return a - b
  })
}
