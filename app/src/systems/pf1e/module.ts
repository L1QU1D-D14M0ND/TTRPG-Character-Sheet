import {
  createEmptyCharacter,
  downloadCharacterJson,
  parseCharacterJson,
  readCharacterFile,
  serializeCharacter,
  suggestedSaveFilename,
  validateCharacterDocument,
  type CharacterDocument,
} from './character'
import { compute, type DerivedView } from './engine'
import { Pf1eWorkspace } from './sheet/Workspace'
import type { SystemModule } from '../../shell/types'

import { pf1eSidebarTools } from './sidebar/tools'

export const pf1eModule: SystemModule<CharacterDocument, DerivedView> = {
  id: 'pf1e',
  displayNameKey: 'pf1e.displayName',
  validate: validateCharacterDocument,
  createEmpty: createEmptyCharacter,
  compute,
  parse: parseCharacterJson,
  serialize: serializeCharacter,
  download: downloadCharacterJson,
  readFile: readCharacterFile,
  suggestedFilename: suggestedSaveFilename,
  Workspace: Pf1eWorkspace,
  sidebarTools: pf1eSidebarTools,
}

export type { CharacterDocument, DerivedView }
