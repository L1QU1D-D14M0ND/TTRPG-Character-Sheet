import { describe, expect, it } from 'vitest'
import { createSchemaValidator, formatAjvErrors } from '../../../shared/validate'
import { listRepoFiles, readRepoJson } from '../../../test/readRepoFile'
import packSchema from '../../../../../schemas/content/pf1e/pack.schema.json'
import classesSchema from '../../../../../schemas/content/pf1e/classes.schema.json'
import racesSchema from '../../../../../schemas/content/pf1e/races.schema.json'
import itemsSchema from '../../../../../schemas/content/pf1e/items.schema.json'
import featsSchema from '../../../../../schemas/content/pf1e/feats.schema.json'
import spellsSchema from '../../../../../schemas/content/pf1e/spells.schema.json'
import archetypesSchema from '../../../../../schemas/content/pf1e/archetypes.schema.json'
import evolutionsSchema from '../../../../../schemas/content/pf1e/evolutions.schema.json'
import featuresSchema from '../../../../../schemas/content/pf1e/features.schema.json'
import entriesSchema from '../../../../../schemas/content/pf1e/entries.schema.json'

// Schema per file *name*, so globbing picks up new packs automatically.
const SCHEMA_BY_BASENAME: Record<string, object> = {
  'pack.json': packSchema,
  'classes.json': classesSchema,
  'races.json': racesSchema,
  'items.json': itemsSchema,
  'feats.json': featsSchema,
  'spells.json': spellsSchema,
  'archetypes.json': archetypesSchema,
  'evolutions.json': evolutionsSchema,
  'features.json': featuresSchema,
  'entries.json': entriesSchema,
}

const FILES = listRepoFiles('content/pf1e')

describe('PF1e content pack JSON Schema', () => {
  it('actually found pack files to validate', () => {
    expect(FILES.length).toBeGreaterThanOrEqual(10)
  })

  it('knows a schema for every pack file under content/pf1e/', () => {
    // A new entity kind must arrive with a schema rather than skipping
    // validation because no list mentions it.
    const unmapped = FILES.filter(
      (file) => !(file.split('/').pop()! in SCHEMA_BY_BASENAME),
    )
    expect(unmapped).toEqual([])
  })

  it('accepts every pack file under content/pf1e/', () => {
    const failures: string[] = []
    for (const file of FILES) {
      const schema = SCHEMA_BY_BASENAME[file.split('/').pop()!]
      if (!schema) continue
      const validate = createSchemaValidator(schema)
      if (!validate(readRepoJson(file))) {
        failures.push(`${file}: ${formatAjvErrors(validate.errors)}`)
      }
    }
    expect(failures).toEqual([])
  })
})
