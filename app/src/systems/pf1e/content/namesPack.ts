/**
 * Localized catalog names (Phase 5.2).
 *
 * A catalog row's `name` is English pack content and stays the row's
 * identity in every locale: ids, goldens, and save files never change. This
 * module adds a *display* name on top, so a Spanish player reads "Espada
 * larga" while the document still carries "Longsword".
 *
 * The index is keyed by catalog id alone rather than per kind, because ids
 * are already one shared namespace per kind and a translation is a property
 * of the row, not of the list it happens to appear in. A missing row or a
 * missing locale falls back to the English name, so a partial locale
 * degrades row by row instead of failing.
 */

import namesSchema from '../../../../../schemas/content/pf1e/names.schema.json'
import esJson from '../../../../../content/pf1e/names/es.json'
import type { Locale } from '../../../shared/i18n'
import { loadCatalog } from './loadCatalog'

export interface LocalizedNameRow {
  id: string
  names: Partial<Record<Exclude<Locale, 'en'>, string>>
}

const ES_ROWS = loadCatalog<LocalizedNameRow[]>(
  namesSchema,
  esJson,
  'content/pf1e/names/es.json',
)

export const LOCALIZED_NAME_ROWS: readonly LocalizedNameRow[] = ES_ROWS

const byId = new Map<string, LocalizedNameRow['names']>()
for (const row of ES_ROWS) {
  byId.set(row.id, { ...byId.get(row.id), ...row.names })
}

/** Curated name for this id in this locale, or null when none is curated. */
export function localizedName(
  id: string | null | undefined,
  locale: Locale,
): string | null {
  if (!id || locale === 'en') return null
  return byId.get(id)?.[locale] ?? null
}

/**
 * What to show for a row: the curated name when there is one, else the
 * English pack name. Never empty, so a caller can render it directly.
 */
export function displayName(
  id: string | null | undefined,
  englishName: string,
  locale: Locale,
): string {
  return localizedName(id, locale) ?? englishName
}

/** Ids that carry at least one curated name. Used by the coverage test. */
export function localizedIds(): readonly string[] {
  return [...byId.keys()]
}
