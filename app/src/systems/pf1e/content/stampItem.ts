import type { ItemEntry } from '../character/types'
import { lookupRow, type ItemCatalogRow, type ItemKind } from './packRegistry'

/**
 * Stamp catalog id, name, pounds, and documentary weapon/armor/shield fields.
 * Does not rewrite quantity, location, armorClass, or attacks.
 * A missing row (unknown id) clears `item.id` and leaves the rest of the row.
 * Internal to the catalog index: callers use `stamp('item', …)`.
 */
export function stampItem(
  row: ItemEntry,
  found: ItemCatalogRow | null,
): ItemEntry {
  if (!found) {
    return {
      ...row,
      item: { ...row.item, id: null },
    }
  }
  const base = found.baseItemId ? lookupRow('item', found.baseItemId) : null
  const kind: ItemKind = found.kind || base?.kind || 'item'
  const pounds = found.pounds ?? base?.pounds ?? 0

  let weapon: ItemEntry['weapon'] = undefined
  if (kind === 'weapon') {
    const baseWeapon = base?.weapon
    const foundWeapon = found.weapon
    if (baseWeapon || foundWeapon) {
      const mergedProperties = Array.from(
        new Set([
          ...(baseWeapon?.properties ?? []),
          ...(foundWeapon?.properties ?? []),
        ]),
      )
      weapon = {
        ...(baseWeapon ? { ...baseWeapon } : {}),
        ...(foundWeapon ? { ...foundWeapon } : {}),
      }
      if (mergedProperties.length > 0) {
        weapon.properties = mergedProperties
      } else {
        delete weapon.properties
      }
      if (baseWeapon?.secondHead || foundWeapon?.secondHead) {
        const baseHead = baseWeapon?.secondHead
        const foundHead = foundWeapon?.secondHead
        const secondProps = Array.from(
          new Set([
            ...(baseHead?.properties ?? []),
            ...(foundHead?.properties ?? []),
          ]),
        )
        weapon.secondHead = {
          ...(baseHead ? { ...baseHead } : {}),
          ...(foundHead ? { ...foundHead } : {}),
        }
        if (secondProps.length > 0) {
          weapon.secondHead.properties = secondProps
        } else {
          delete weapon.secondHead.properties
        }
      }
    }
  }

  let armor: ItemEntry['armor'] = undefined
  if (kind === 'armor') {
    const baseArmor = base?.armor
    const foundArmor = found.armor
    if (baseArmor || foundArmor) {
      const mergedProperties = Array.from(
        new Set([
          ...(baseArmor?.properties ?? []),
          ...(foundArmor?.properties ?? []),
        ]),
      )
      armor = {
        ...(baseArmor ? { ...baseArmor } : {}),
        ...(foundArmor ? { ...foundArmor } : {}),
      }
      if (mergedProperties.length > 0) {
        armor.properties = mergedProperties
      } else {
        delete armor.properties
      }
    }
  }

  let shield: ItemEntry['shield'] = undefined
  if (kind === 'shield') {
    const baseShield = base?.shield
    const foundShield = found.shield
    if (baseShield || foundShield) {
      const mergedProperties = Array.from(
        new Set([
          ...(baseShield?.properties ?? []),
          ...(foundShield?.properties ?? []),
        ]),
      )
      shield = {
        ...(baseShield ? { ...baseShield } : {}),
        ...(foundShield ? { ...foundShield } : {}),
      }
      if (mergedProperties.length > 0) {
        shield.properties = mergedProperties
      } else {
        delete shield.properties
      }
    }
  }

  return {
    ...row,
    item: {
      id: found.id,
      name: found.name,
      source: found.source,
    },
    pounds,
    weapon,
    armor,
    shield,
  }
}
