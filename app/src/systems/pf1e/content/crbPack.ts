/**
 * Core Rulebook content pack: parse, validate, and expose the rows.
 * No side effects. The catalog index registers this pack; nothing else
 * should look rows up here.
 */
import { seededClassSkills } from './catalogLookup'
import { loadCatalog } from './loadCatalog'
import type {
  ClassProgression,
  FeatCatalogRow,
  FeatureCatalogRow,
  ItemCatalogRow,
  PackRows,
  RaceCatalogRow,
  SpellCatalogRow,
} from './packRegistry'
import classesSchema from '../../../../../schemas/content/pf1e/classes.schema.json'
import racesSchema from '../../../../../schemas/content/pf1e/races.schema.json'
import itemsSchema from '../../../../../schemas/content/pf1e/items.schema.json'
import featsSchema from '../../../../../schemas/content/pf1e/feats.schema.json'
import spellsSchema from '../../../../../schemas/content/pf1e/spells.schema.json'
import featuresSchema from '../../../../../schemas/content/pf1e/features.schema.json'
import classesJson from '../../../../../content/pf1e/crb/classes.json'
import racesJson from '../../../../../content/pf1e/crb/races.json'
import itemsJson from '../../../../../content/pf1e/crb/items.json'
import featsJson from '../../../../../content/pf1e/crb/feats.json'
import spellsJson from '../../../../../content/pf1e/crb/spells.json'
import featuresJson from '../../../../../content/pf1e/crb/features.json'

const classRows = loadCatalog<ClassProgression[]>(
  classesSchema,
  classesJson,
  'content/pf1e/crb/classes.json',
)
const raceRows = loadCatalog<RaceCatalogRow[]>(
  racesSchema,
  racesJson,
  'content/pf1e/crb/races.json',
)
const itemRows = loadCatalog<ItemCatalogRow[]>(
  itemsSchema,
  itemsJson,
  'content/pf1e/crb/items.json',
)
const featRows = loadCatalog<FeatCatalogRow[]>(
  featsSchema,
  featsJson,
  'content/pf1e/crb/feats.json',
)
const spellRows = loadCatalog<SpellCatalogRow[]>(
  spellsSchema,
  spellsJson,
  'content/pf1e/crb/spells.json',
)
const featureRows = loadCatalog<FeatureCatalogRow[]>(
  featuresSchema,
  featuresJson,
  'content/pf1e/crb/features.json',
)

export const CRB_CLASSES: ClassProgression[] = classRows.map((row) => ({
  ...row,
  classSkills: seededClassSkills(row.classSkills),
}))

export const CRB_RACES: RaceCatalogRow[] = raceRows.map((row) => ({ ...row }))

export const CRB_ITEMS: ItemCatalogRow[] = itemRows.map((row) => ({
  ...row,
  kind: row.kind,
  weapon: row.kind === 'weapon' ? row.weapon : undefined,
  armor: row.kind === 'armor' ? row.armor : undefined,
  shield: row.kind === 'shield' ? row.shield : undefined,
}))

export const CRB_FEATS: FeatCatalogRow[] = featRows.map((row) => ({ ...row }))

export const CRB_SPELLS: SpellCatalogRow[] = spellRows.map((row) => ({ ...row }))

export const CRB_FEATURES: FeatureCatalogRow[] = featureRows.map((row) => ({ ...row }))

export const CRB_PACK: PackRows = {
  class: CRB_CLASSES,
  race: CRB_RACES,
  item: CRB_ITEMS,
  feat: CRB_FEATS,
  spell: CRB_SPELLS,
  feature: CRB_FEATURES,
}
