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
import { Pf2eWorkspace } from './sheet/Workspace'
import type { SystemModule } from '../../shell/types'

import { pf2eSidebarTools } from './sidebar/tools'

export const pf2eModule: SystemModule<CharacterDocument, DerivedView> = {
  id: 'pf2e',
  displayNameKey: 'pf2e.displayName',
  validate: validateCharacterDocument,
  createEmpty: createEmptyCharacter,
  compute,
  parse: parseCharacterJson,
  serialize: serializeCharacter,
  download: downloadCharacterJson,
  readFile: readCharacterFile,
  suggestedFilename: suggestedSaveFilename,
  Workspace: Pf2eWorkspace,
  sidebarTools: pf2eSidebarTools,
}

export type { CharacterDocument, DerivedView }
