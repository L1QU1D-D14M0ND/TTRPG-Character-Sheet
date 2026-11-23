/**
 * Advanced Player's Guide content pack (Summoner / Synthesist): parse,
 * validate, and expose the rows. No side effects. The catalog index
 * registers this pack.
 */
import { seededClassSkills } from './catalogLookup'
import { loadCatalog } from './loadCatalog'
import type {
  ArchetypeCatalogRow,
  ClassProgression,
  EvolutionCatalogRow,
  PackRows,
  SpellCatalogRow,
} from './packRegistry'
import archetypesSchema from '../../../../../schemas/content/pf1e/archetypes.schema.json'
import classesSchema from '../../../../../schemas/content/pf1e/classes.schema.json'
import evolutionsSchema from '../../../../../schemas/content/pf1e/evolutions.schema.json'
import spellsSchema from '../../../../../schemas/content/pf1e/spells.schema.json'
import archetypesJson from '../../../../../content/pf1e/apg/archetypes.json'
import classesJson from '../../../../../content/pf1e/apg/classes.json'
import evolutionsJson from '../../../../../content/pf1e/apg/evolutions.json'
import spellsJson from '../../../../../content/pf1e/apg/spells.json'

const classRows = loadCatalog<ClassProgression[]>(
  classesSchema,
  classesJson,
  'content/pf1e/apg/classes.json',
)
const archetypeRows = loadCatalog<ArchetypeCatalogRow[]>(
  archetypesSchema,
  archetypesJson,
  'content/pf1e/apg/archetypes.json',
)
const evolutionRows = loadCatalog<EvolutionCatalogRow[]>(
  evolutionsSchema,
  evolutionsJson,
  'content/pf1e/apg/evolutions.json',
)
const spellRows = loadCatalog<SpellCatalogRow[]>(
  spellsSchema,
  spellsJson,
  'content/pf1e/apg/spells.json',
)

export const APG_CLASSES: ClassProgression[] = classRows.map((row) => ({
  ...row,
  classSkills: seededClassSkills(row.classSkills),
}))

export const APG_ARCHETYPES: ArchetypeCatalogRow[] = archetypeRows.map(
  (row) => ({ ...row }),
)

export const APG_EVOLUTIONS: EvolutionCatalogRow[] = evolutionRows.map(
  (row) => ({ ...row }),
)

export const APG_SPELLS: SpellCatalogRow[] = spellRows.map((row) => ({ ...row }))

export const APG_PACK: PackRows = {
  class: APG_CLASSES,
  archetype: APG_ARCHETYPES,
  evolution: APG_EVOLUTIONS,
  spell: APG_SPELLS,
}
