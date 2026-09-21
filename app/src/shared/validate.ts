import Ajv, { type ErrorObject } from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { ValidateFunction } from 'ajv'

export class CharacterValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CharacterValidationError'
  }
}

export function formatAjvErrors(
  errors: ErrorObject[] | null | undefined,
): string {
  if (!errors?.length) return 'Document failed JSON Schema validation.'
  return errors
    .slice(0, 8)
    .map((err) => {
      const where = err.instancePath || '/'
      const extra =
        typeof err.params?.additionalProperty === 'string'
          ? ` '${err.params.additionalProperty}'`
          : ''
      return `${where}${extra} ${err.message ?? 'is invalid'}`
    })
    .join('; ')
}

export function createSchemaValidator(
  schema: object,
): ValidateFunction<unknown> {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    allowUnionTypes: true,
  })
  addFormats(ajv)
  return ajv.compile(schema)
}

/**
 * Compile on first use instead of at module scope.
 *
 * Compiling the two character schemas costs ~23ms (PF1e) and ~25ms (PF2e) on
 * a warm engine, and both ran during import — on the critical path of every
 * cold start, including the common case of opening the app to keep playing an
 * already-loaded draft. Validation is only reachable from Save and Load, so
 * defer it to the first document that actually crosses that boundary.
 *
 * The compiled validator is cached, so repeated Save/Load pays nothing extra.
 */
export function lazySchemaValidator(
  schema: object,
): () => ValidateFunction<unknown> {
  let compiled: ValidateFunction<unknown> | null = null
  return () => {
    compiled ??= createSchemaValidator(schema)
    return compiled
  }
}
