import { parseJsonObject } from '../shared/saveLoad'
import { isRecord, resolveSystemId, type SystemId } from '../shared/envelope'
import type { CharacterDocument as Pf1eDocument } from '../systems/pf1e/character'
import type { CharacterDocument as Pf2eDocument } from '../systems/pf2e/character'
import { parseSheetFor } from './registry'

export type LoadedSheet =
  | { system: 'pf1e'; character: Pf1eDocument }
  | { system: 'pf2e'; character: Pf2eDocument }

/** The document type a given system's slot holds, derived from `LoadedSheet`. */
export type DocumentFor<S extends SystemId> = Extract<
  LoadedSheet,
  { system: S }
>['character']

export function peekSystemId(text: string): SystemId {
  const data = parseJsonObject(text)
  return resolveSystemId(isRecord(data) ? data.system : undefined)
}

export function parseLoadedSheet(text: string): LoadedSheet {
  return parseSheetFor(peekSystemId(text), text)
}
