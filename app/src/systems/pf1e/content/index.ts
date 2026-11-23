/**
 * Public interface of the PF1e content module. Everything a caller outside
 * `content/` needs: the catalog index (list, resolve, stamp a host), the
 * class-derived helpers the engine and Identity panel use, localized names,
 * and the magic overlay (masterwork/enhancement rules, badge, suggested price)
 * with its CRB special-ability tables.
 *
 * Pack modules and the pack registry are internal; reach rows through
 * `resolve(kind, id)` and stamp through `stamp(kind, host, id)`.
 */
export {
  catalogId,
  catalogName,
  groups,
  resolve,
  setCatalogName,
  stamp,
} from './catalogIndex'
export type {
  CatalogGroup,
  CatalogHostMap,
  CatalogKind,
  CatalogOption,
  HostFor,
  MechanicsFor,
  MechanicsMap,
} from './catalogIndex'
export type { ClassProgression } from './packRegistry'
export {
  classSkillKeySet,
  classSpellsPerDayRow,
  skillPointsPerLevelFor,
  stampClassSkills,
} from './classLookup'
export {
  displayName,
  localizedIds,
  localizedName,
  LOCALIZED_NAME_ROWS,
} from './namesPack'
export type { LocalizedNameRow } from './namesPack'
export {
  getPropertiesForKind,
  CRB_ARMOR_SPECIAL_ABILITIES,
  CRB_SHIELD_SPECIAL_ABILITIES,
  CRB_WEAPON_SPECIAL_ABILITIES,
} from './crbMagicProperties'
export type { MagicPropertyDescriptor } from './crbMagicProperties'
export {
  itemMagicBadge,
  magicBadge,
  masterworkChecked,
  setEnhancement,
  setMasterwork,
  suggestedMagicPrice,
} from './magicOverlay'
export type { MagicOverlayFields } from './magicOverlay'
