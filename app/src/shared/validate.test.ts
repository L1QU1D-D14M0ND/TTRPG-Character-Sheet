import { describe, expect, it } from 'vitest'
import { createSchemaValidator, lazySchemaValidator } from './validate'

const SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name'],
  additionalProperties: false,
}

/** `strict: true` makes Ajv throw on this at compile time, never before. */
const UNCOMPILABLE_SCHEMA = { type: 'not-a-json-schema-type' }

describe('lazySchemaValidator', () => {
  it('does not compile the schema until the first call', () => {
    // A schema Ajv rejects proves compilation has not happened yet: if the
    // factory compiled eagerly, merely constructing it would throw.
    const getValidate = lazySchemaValidator(UNCOMPILABLE_SCHEMA)
    expect(() => getValidate()).toThrow()

    // And the eager path does throw immediately, which is the contrast.
    expect(() => createSchemaValidator(UNCOMPILABLE_SCHEMA)).toThrow()
  })

  it('compiles once and reuses the same validator', () => {
    const getValidate = lazySchemaValidator(SCHEMA)
    expect(getValidate()).toBe(getValidate())
  })

  it('accepts and rejects exactly like the eager validator', () => {
    const eager = createSchemaValidator(SCHEMA)
    const lazy = lazySchemaValidator(SCHEMA)()

    for (const doc of [{ name: 'Flare' }, { name: 2 }, {}, { extra: true }]) {
      expect(lazy(doc), JSON.stringify(doc)).toBe(eager(doc))
    }
  })

  it('reports errors on every failure, not just the first', () => {
    const validate = lazySchemaValidator(SCHEMA)()

    expect(validate({})).toBe(false)
    expect(validate.errors?.length).toBeGreaterThan(0)
    expect(validate({ name: 1 })).toBe(false)
    expect(validate.errors?.length).toBeGreaterThan(0)
  })
})

describe('character schema validation stays correct when deferred', () => {
  it('still validates real documents through both system modules', async () => {
    const pf1e = await import('../systems/pf1e/character/validate')
    const pf2e = await import('../systems/pf2e/character/validate')

    // Compilation now happens here, on the first document, not at import.
    expect(() => pf1e.validateCharacterDocument({})).toThrow()
    expect(() => pf2e.validateCharacterDocument({})).toThrow()
  })
})
