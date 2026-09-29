import type {
  CompanionSheet,
  Identity,
  Proficiencies,
} from '../character/types'
import { compute } from './compute'
import type { ComputeInput, DerivedView } from './types'

const UNTRAINED: Proficiencies = {
  perception: { rank: 'untrained', attribute: 'wis', modifiers: {} },
  fortitude: { rank: 'untrained', attribute: 'con', modifiers: {} },
  reflex: { rank: 'untrained', attribute: 'dex', modifiers: {} },
  will: { rank: 'untrained', attribute: 'wis', modifiers: {} },
  classDC: { rank: 'untrained', attribute: 'str', modifiers: {} },
  armor: {
    unarmored: 'untrained',
    light: 'untrained',
    medium: 'untrained',
    heavy: 'untrained',
  },
  weapons: {
    unarmed: 'untrained',
    simple: 'untrained',
    martial: 'untrained',
    advanced: 'untrained',
    specific: [],
  },
}

const BLANK_REF = { id: null, name: '', rulesetSource: 'custom' as const }

/** Nested companion identity is a subset; reuse PC `compute()` with a stub Identity. */
function companionIdentity(sheet: CompanionSheet): Identity {
  return {
    characterName: '',
    level: sheet.identity.level,
    ancestry: sheet.identity.ancestryOrType ?? BLANK_REF,
    heritage: BLANK_REF,
    background: BLANK_REF,
    class: BLANK_REF,
    size: sheet.identity.size,
    traits: sheet.identity.traits,
    languages: [],
  }
}

export function companionAsComputeInput(sheet: CompanionSheet): ComputeInput {
  return {
    identity: companionIdentity(sheet),
    attributes: sheet.attributes,
    proficiencies: sheet.proficiencies ?? UNTRAINED,
    vitals: sheet.vitals,
    armorClass: sheet.armorClass,
    skills: sheet.skills,
    strikes: sheet.strikes,
    spellcasting: sheet.spellcasting ?? [],
    inventory: sheet.inventory,
    overrides: {},
    feats: [],
    conditions: [],
  }
}

/** Core calcs for a nested companion sheet. Does not write support benefits onto the PC. */
export function computeCompanion(sheet: CompanionSheet): DerivedView {
  return compute(companionAsComputeInput(sheet))
}
