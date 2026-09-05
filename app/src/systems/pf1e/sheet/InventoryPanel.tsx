import { useState } from 'react'
import { createEmptyItem, type CharacterDocument } from '../character'
import type { ItemLocation } from '../character/types'
import {
  addWeaponProperty,
  removeWeaponProperty,
} from '../character/weaponProperties'
import { applyCrbItem, CRB_ITEMS } from '../content'
import type { DerivedView } from '../engine'
import { formatLoadSummary } from '../engine/encumbrance'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { useT } from '../../../shared/i18n'
import { patchAt, updateAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const LOCATIONS: ItemLocation[] = ['equipped', 'carried', 'stowed', 'dropped']

export function InventoryPanel({
  character,
  derived,
  update,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
}) {
  const t = useT()
  return (
    <div className="panel-stack">
      <table className="sheet-table">
        <tbody>
          {(['cp', 'sp', 'gp', 'pp'] as const).map((coin) => (
            <tr key={coin}>
              <th>{coin.toUpperCase()}</th>
              <td>
                <input
                  type="number"
                  min={0}
                  aria-label={coin.toUpperCase()}
                  value={character.inventory.currency[coin]}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      inventory: {
                        ...c.inventory,
                        currency: {
                          ...c.inventory.currency,
                          [coin]: Math.max(0, Number(e.target.value) || 0),
                        },
                      },
                    }))
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <th>{t('pf1e.inventory.weightLoad')}</th>
            <td>
              <div className="weight-row">
                <DerivedCell
                  value={formatLoadSummary(
                    derived.weightUsed,
                    derived.loadCategory,
                    {
                      light: derived.lightLoad,
                      medium: derived.mediumLoad,
                      heavy: derived.heavyLoad,
                    },
                  )}
                  overridden={derived.overriddenPaths.includes(
                    'derived.weightUsed',
                  )}
                />
                <button
                  type="button"
                  aria-pressed={character.inventory.ignoreWeight === true}
                  onClick={() =>
                    update((c) => ({
                      ...c,
                      inventory: {
                        ...c.inventory,
                        ignoreWeight: !c.inventory.ignoreWeight,
                      },
                    }))
                  }
                >
                  {t('pf1e.inventory.ignoreWeight')}
                </button>
              </div>
              <p className="muted">{t('pf1e.inventory.help')}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>{t('pf1e.inventory.items')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              inventory: {
                ...c.inventory,
                items: [...c.inventory.items, createEmptyItem()],
              },
            }))
          }
        >
          {t('pf1e.inventory.addItem')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.inventory.name')}</th>
            <th>{t('pf1e.inventory.qty')}</th>
            <th>{t('pf1e.inventory.lb')}</th>
            <th>{t('pf1e.inventory.location')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.inventory.items.length === 0 ? (
            <tr>
              <td colSpan={5} className="muted">
                {t('pf1e.inventory.empty')}
              </td>
            </tr>
          ) : (
            character.inventory.items.map((item, index) => (
              <tr key={item.id}>
                <td className="item-cell">
                  <select
                    aria-label={t('pf1e.inventory.catalog')}
                    value={item.item.id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null
                      update((c) => ({
                        ...c,
                        inventory: {
                          ...c.inventory,
                          items: updateAt(c.inventory.items, index, (row) =>
                            applyCrbItem(row, id),
                          ),
                        },
                      }))
                    }}
                  >
                    <option value="">{t('pf1e.common.custom')}</option>
                    {CRB_ITEMS.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={t('pf1e.inventory.itemName')}
                    value={item.item.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        inventory: {
                          ...c.inventory,
                          items: updateAt(c.inventory.items, index, (row) => ({
                            ...row,
                            item: { ...row.item, name: e.target.value },
                          })),
                        },
                      }))
                    }
                  />
                  {item.weapon ? (
                    <WeaponPropertiesEditor
                      tags={item.weapon.properties ?? []}
                      onChange={(properties) =>
                        update((c) => {
                          const items = [...c.inventory.items]
                          const current = items[index]
                          if (!current.weapon) return c
                          const weapon = { ...current.weapon }
                          if (properties) weapon.properties = properties
                          else delete weapon.properties
                          items[index] = { ...current, weapon }
                          return {
                            ...c,
                            inventory: { ...c.inventory, items },
                          }
                        })
                      }
                    />
                  ) : null}
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    aria-label={t('pf1e.inventory.qty')}
                    value={item.quantity}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        inventory: {
                          ...c.inventory,
                          items: patchAt(c.inventory.items, index, {
                            quantity: Math.max(0, Number(e.target.value) || 0),
                          }),
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    aria-label={t('pf1e.inventory.lb')}
                    value={item.pounds}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        inventory: {
                          ...c.inventory,
                          items: patchAt(c.inventory.items, index, {
                            pounds: Math.max(0, Number(e.target.value) || 0),
                          }),
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <select
                    aria-label={t('pf1e.inventory.location')}
                    value={item.location}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        inventory: {
                          ...c.inventory,
                          items: patchAt(c.inventory.items, index, {
                            location: e.target.value as ItemLocation,
                          }),
                        },
                      }))
                    }
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {t(`pf1e.inventory.${loc}`)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        inventory: {
                          ...c.inventory,
                          items: c.inventory.items.filter(
                            (row) => row.id !== item.id,
                          ),
                        },
                      }))
                    }
                  >
                    {t('pf1e.common.remove')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function WeaponPropertiesEditor({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (next: string[] | undefined) => void
}) {
  const t = useT()
  const [draft, setDraft] = useState('')
  const addDraft = () => {
    onChange(addWeaponProperty(tags, draft))
    setDraft('')
  }
  return (
    <div className="weapon-properties">
      <span className="muted">{t('pf1e.inventory.properties')}</span>
      <ul className="property-list" aria-label={t('pf1e.inventory.properties')}>
        {tags.map((tag) => (
          <li key={tag} className="property-chip">
            <span>{tag}</span>
            <button
              type="button"
              aria-label={t('pf1e.inventory.removeProperty', { tag })}
              onClick={() => onChange(removeWeaponProperty(tags, tag))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="property-add">
        <input
          aria-label={t('pf1e.inventory.addProperty')}
          value={draft}
          placeholder={t('pf1e.inventory.propertyPlaceholder')}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addDraft()
            }
          }}
        />
        <button type="button" onClick={addDraft}>
          {t('pf1e.inventory.addProperty')}
        </button>
      </div>
      <p className="muted">{t('pf1e.inventory.propertiesHelp')}</p>
    </div>
  )
}
