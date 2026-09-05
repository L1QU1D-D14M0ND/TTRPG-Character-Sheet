import {
  CharacterValidationError,
  createSchemaValidator,
  formatAjvErrors,
} from '../../../shared/validate'

/**
 * Content packs are bundled build inputs, not user data: they are imported as
 * static JSON and every file under `content/pf1e/` is validated against its
 * schema in CI by `packSchema.test.ts`. Compiling those seven schemas with Ajv
 * again at startup costs ~74ms on the app's critical path and can only fail if
 * the build itself shipped a pack CI already rejected.
 *
 * So validate in dev and test, where a hand-edited pack should fail loudly and
 * immediately, and trust the CI-verified bundle in production. User-supplied
 * documents are the opposite case and stay validated always — see
 * `character/validate.ts`, which does not go through this path.
 */
const VALIDATE_PACKS_AT_RUNTIME = import.meta.env.DEV

export function loadCatalog<T>(
  schema: object,
  data: unknown,
  label: string,
): T {
  if (!VALIDATE_PACKS_AT_RUNTIME) return data as T

  const validate = createSchemaValidator(schema)
  if (!validate(data)) {
    throw new CharacterValidationError(
      `${label}: ${formatAjvErrors(validate.errors)}`,
    )
  }
  return data as T
}
