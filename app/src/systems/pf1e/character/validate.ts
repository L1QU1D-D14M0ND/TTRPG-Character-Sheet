import characterSchema from '../../../../../schemas/pf1e/character.schema.json'
import type { CharacterDocument } from './types'
import {
  CharacterValidationError,
  formatAjvErrors,
  lazySchemaValidator,
} from '../../../shared/validate'
import { PF1E_SYSTEM_ID } from '../../../shared/envelope'

const getValidateFn = lazySchemaValidator(characterSchema)

export { CharacterValidationError, formatAjvErrors }

/** Validate an unknown value against schemas/pf1e/character.schema.json. */
export function validateCharacterDocument(data: unknown): CharacterDocument {
  const validateFn = getValidateFn()
  if (validateFn(data)) {
    return data as unknown as CharacterDocument
  }
  throw new CharacterValidationError(formatAjvErrors(validateFn.errors))
}

export function normalizeLoadedDocument(data: unknown): CharacterDocument {
  if (data && typeof data === 'object' && 'system' in data) {
    const system = (data as { system?: unknown }).system
    if (system !== PF1E_SYSTEM_ID) {
      throw new CharacterValidationError(
        `This parser cannot open system '${String(system)}' with the PF1e schema.`,
      )
    }
  } else {
    throw new CharacterValidationError(
      'PF1e character files must include "system": "pf1e".',
    )
  }
  return validateCharacterDocument(data)
}
