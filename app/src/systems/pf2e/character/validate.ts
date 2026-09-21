import characterSchema from '../../../../../schemas/character.schema.json'
import type { CharacterDocument } from './types'
import {
  CharacterValidationError,
  formatAjvErrors,
  lazySchemaValidator,
} from '../../../shared/validate'
import { PF2E_SYSTEM_ID, resolveSystemId } from '../../../shared/envelope'

const getValidateFn = lazySchemaValidator(characterSchema)

export { CharacterValidationError, formatAjvErrors }

function withSystem(doc: CharacterDocument): CharacterDocument {
  if (doc.system === PF2E_SYSTEM_ID) return doc
  return { ...doc, system: PF2E_SYSTEM_ID }
}

/** Validate an unknown value against character.schema.json (schemaVersion 1). */
export function validateCharacterDocument(data: unknown): CharacterDocument {
  const validateFn = getValidateFn()
  if (validateFn(data)) {
    const doc = data as unknown as CharacterDocument
    return withSystem(doc)
  }
  throw new CharacterValidationError(formatAjvErrors(validateFn.errors))
}

/** Files without `system` are PF2e. Reject other system ids before Ajv when present. */
export function normalizeLoadedDocument(data: unknown): CharacterDocument {
  if (data && typeof data === 'object' && 'system' in data) {
    const system = (data as { system?: unknown }).system
    if (system !== undefined && resolveSystemId(system) !== PF2E_SYSTEM_ID) {
      throw new CharacterValidationError(
        `This app cannot open system '${String(system)}' with the PF2e schema.`,
      )
    }
  }
  return validateCharacterDocument(data)
}
