import { useState } from 'react'
import { createEmptyItem, type CharacterDocument } from '../character'
import type { ItemLocation } from '../character/types'
import {
  addItemProperty,
  removeItemProperty,
} from '../character/itemProperties'
import {
  getPropertiesForKind,
  computeSuggestedMagicPrice,
} from '../content'
import type { DerivedView } from '../engine'
import { formatLoadSummary } from '../engine/encumbrance'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { useT } from '../../../shared/i18n'
import { patchAt, replaceAt } from '../../../shared/ui/rows'
import { CatalogPicker } from './CatalogPicker'
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
            <th>{t('pf1e.inventory.priceGp')}</th>
            <th>{t('pf1e.inventory.location')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.inventory.items.length === 0 ? (
            <tr>
              <td colSpan={6} className="muted">
                {t('pf1e.inventory.empty')}
              </td>
            </tr>
          ) : (
            character.inventory.items.map((item, index) => {
              const suggestedPrice = item.weapon
                ? computeSuggestedMagicPrice({
                    kind: 'weapon',
                    basePriceGp: item.priceGp ?? 0,
                    masterwork: item.weapon.masterwork,
                    enhancementBonus: item.weapon.enhancementBonus,
                    properties: item.weapon.properties,
                  })
                : item.armor
                  ? computeSuggestedMagicPrice({
                      kind: 'armor',
                      basePriceGp: item.priceGp ?? 0,
                      masterwork: item.armor.masterwork,
                      enhancementBonus: item.armor.enhancementBonus,
                      properties: item.armor.properties,
                    })
                  : item.shield
                    ? computeSuggestedMagicPrice({
                        kind: 'shield',
                        basePriceGp: item.priceGp ?? 0,
                        masterwork: item.shield.masterwork,
                        enhancementBonus: item.shield.enhancementBonus,
                        properties: item.shield.properties,
                      })
                    : null

              const badge = item.weapon?.enhancementBonus
                ? `+${item.weapon.enhancementBonus}`
                : item.weapon?.masterwork
                  ? 'MWK'
                  : item.armor?.enhancementBonus
                    ? `+${item.armor.enhancementBonus}`
                    : item.armor?.masterwork
                      ? 'MWK'
                      : item.shield?.enhancementBonus
                        ? `+${item.shield.enhancementBonus}`
                        : item.shield?.masterwork
                          ? 'MWK'
                          : null

              return (
                <tr key={item.id}>
                  <td className="item-cell">
                    <CatalogPicker
                      kind="item"
                      value={item}
                      catalogLabel={t('pf1e.inventory.catalog')}
                      nameLabel={t('pf1e.inventory.itemName')}
                      onPick={(next) =>
                        update((c) => ({
                          ...c,
                          inventory: {
                            ...c.inventory,
                            items: replaceAt(c.inventory.items, index, next),
                          },
                        }))
                      }
                    />
                    {badge ? <span className="magic-badge">{badge}</span> : null}

                    {item.weapon ? (
                      <div className="weapon-controls">
                        <div className="magic-overlay-controls">
                          <label>
                            <input
                              type="checkbox"
                              aria-label={t('pf1e.inventory.masterwork')}
                              checked={
                                item.weapon.masterwork ??
                                Boolean(item.weapon.enhancementBonus)
                              }
                              onChange={(e) =>
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.weapon) return c
                                  const weapon = { ...current.weapon }
                                  if (e.target.checked || weapon.enhancementBonus) {
                                    weapon.masterwork = true
                                  } else {
                                    delete weapon.masterwork
                                  }
                                  items[index] = { ...current, weapon }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }
                            />
                            {t('pf1e.inventory.masterwork')}
                          </label>
                          <label>
                            {t('pf1e.inventory.enhancement')}:
                            <select
                              aria-label={t('pf1e.inventory.enhancement')}
                              value={item.weapon.enhancementBonus ?? 0}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.weapon) return c
                                  const weapon = { ...current.weapon }
                                  if (val > 0) {
                                    weapon.enhancementBonus = val
                                    weapon.masterwork = true
                                  } else {
                                    delete weapon.enhancementBonus
                                  }
                                  items[index] = { ...current, weapon }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }}
                            >
                              <option value={0}>
                                {t('pf1e.inventory.noEnhancement')}
                              </option>
                              {[1, 2, 3, 4, 5].map((bonus) => (
                                <option key={bonus} value={bonus}>
                                  +{bonus}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <ItemPropertiesEditor
                          tags={item.weapon.properties ?? []}
                          kind="weapon"
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
                        {item.weapon.secondHead ? (
                          <div className="second-head-overlay">
                            <strong>{t('pf1e.inventory.secondHead')}</strong>
                            <div className="magic-overlay-controls">
                              <label>
                                <input
                                  type="checkbox"
                                  aria-label={t(
                                    'pf1e.inventory.secondHeadMasterwork',
                                  )}
                                  checked={
                                    item.weapon.secondHead.masterwork ??
                                    Boolean(
                                      item.weapon.secondHead.enhancementBonus,
                                    )
                                  }
                                  onChange={(e) =>
                                    update((c) => {
                                      const items = [...c.inventory.items]
                                      const current = items[index]
                                      if (!current.weapon?.secondHead) return c
                                      const secondHead = {
                                        ...current.weapon.secondHead,
                                      }
                                      if (
                                        e.target.checked ||
                                        secondHead.enhancementBonus
                                      ) {
                                        secondHead.masterwork = true
                                      } else {
                                        delete secondHead.masterwork
                                      }
                                      items[index] = {
                                        ...current,
                                        weapon: {
                                          ...current.weapon,
                                          secondHead,
                                        },
                                      }
                                      return {
                                        ...c,
                                        inventory: { ...c.inventory, items },
                                      }
                                    })
                                  }
                                />
                                {t('pf1e.inventory.masterwork')}
                              </label>
                              <label>
                                {t('pf1e.inventory.enhancement')}:
                                <select
                                  aria-label={t(
                                    'pf1e.inventory.secondHeadEnhancement',
                                  )}
                                  value={
                                    item.weapon.secondHead.enhancementBonus ?? 0
                                  }
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0
                                    update((c) => {
                                      const items = [...c.inventory.items]
                                      const current = items[index]
                                      if (!current.weapon?.secondHead) return c
                                      const secondHead = {
                                        ...current.weapon.secondHead,
                                      }
                                      if (val > 0) {
                                        secondHead.enhancementBonus = val
                                        secondHead.masterwork = true
                                      } else {
                                        delete secondHead.enhancementBonus
                                      }
                                      items[index] = {
                                        ...current,
                                        weapon: {
                                          ...current.weapon,
                                          secondHead,
                                        },
                                      }
                                      return {
                                        ...c,
                                        inventory: { ...c.inventory, items },
                                      }
                                    })
                                  }}
                                >
                                  <option value={0}>
                                    {t('pf1e.inventory.noEnhancement')}
                                  </option>
                                  {[1, 2, 3, 4, 5].map((bonus) => (
                                    <option key={bonus} value={bonus}>
                                      +{bonus}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <ItemPropertiesEditor
                              tags={item.weapon.secondHead.properties ?? []}
                              kind="weapon"
                              label={t('pf1e.inventory.secondHeadProperties')}
                              onChange={(properties) =>
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.weapon?.secondHead) return c
                                  const secondHead = {
                                    ...current.weapon.secondHead,
                                  }
                                  if (properties)
                                    secondHead.properties = properties
                                  else delete secondHead.properties
                                  items[index] = {
                                    ...current,
                                    weapon: {
                                      ...current.weapon,
                                      secondHead,
                                    },
                                  }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {item.armor ? (
                      <div className="armor-controls">
                        <div className="magic-overlay-controls">
                          <label>
                            <input
                              type="checkbox"
                              aria-label={t('pf1e.inventory.masterwork')}
                              checked={
                                item.armor.masterwork ??
                                Boolean(item.armor.enhancementBonus)
                              }
                              onChange={(e) =>
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.armor) return c
                                  const armor = { ...current.armor }
                                  if (
                                    e.target.checked ||
                                    armor.enhancementBonus
                                  ) {
                                    armor.masterwork = true
                                  } else {
                                    delete armor.masterwork
                                  }
                                  items[index] = { ...current, armor }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }
                            />
                            {t('pf1e.inventory.masterwork')}
                          </label>
                          <label>
                            {t('pf1e.inventory.enhancement')}:
                            <select
                              aria-label={t('pf1e.inventory.enhancement')}
                              value={item.armor.enhancementBonus ?? 0}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.armor) return c
                                  const armor = { ...current.armor }
                                  if (val > 0) {
                                    armor.enhancementBonus = val
                                    armor.masterwork = true
                                  } else {
                                    delete armor.enhancementBonus
                                  }
                                  items[index] = { ...current, armor }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }}
                            >
                              <option value={0}>
                                {t('pf1e.inventory.noEnhancement')}
                              </option>
                              {[1, 2, 3, 4, 5].map((bonus) => (
                                <option key={bonus} value={bonus}>
                                  +{bonus}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <ItemPropertiesEditor
                          tags={item.armor.properties ?? []}
                          kind="armor"
                          label={t('pf1e.inventory.armorProperties')}
                          onChange={(properties) =>
                            update((c) => {
                              const items = [...c.inventory.items]
                              const current = items[index]
                              if (!current.armor) return c
                              const armor = { ...current.armor }
                              if (properties) armor.properties = properties
                              else delete armor.properties
                              items[index] = { ...current, armor }
                              return {
                                ...c,
                                inventory: { ...c.inventory, items },
                              }
                            })
                          }
                        />
                      </div>
                    ) : null}

                    {item.shield ? (
                      <div className="shield-controls">
                        <div className="magic-overlay-controls">
                          <label>
                            <input
                              type="checkbox"
                              aria-label={t('pf1e.inventory.masterwork')}
                              checked={
                                item.shield.masterwork ??
                                Boolean(item.shield.enhancementBonus)
                              }
                              onChange={(e) =>
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.shield) return c
                                  const shield = { ...current.shield }
                                  if (
                                    e.target.checked ||
                                    shield.enhancementBonus
                                  ) {
                                    shield.masterwork = true
                                  } else {
                                    delete shield.masterwork
                                  }
                                  items[index] = { ...current, shield }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }
                            />
                            {t('pf1e.inventory.masterwork')}
                          </label>
                          <label>
                            {t('pf1e.inventory.enhancement')}:
                            <select
                              aria-label={t('pf1e.inventory.enhancement')}
                              value={item.shield.enhancementBonus ?? 0}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                update((c) => {
                                  const items = [...c.inventory.items]
                                  const current = items[index]
                                  if (!current.shield) return c
                                  const shield = { ...current.shield }
                                  if (val > 0) {
                                    shield.enhancementBonus = val
                                    shield.masterwork = true
                                  } else {
                                    delete shield.enhancementBonus
                                  }
                                  items[index] = { ...current, shield }
                                  return {
                                    ...c,
                                    inventory: { ...c.inventory, items },
                                  }
                                })
                              }}
                            >
                              <option value={0}>
                                {t('pf1e.inventory.noEnhancement')}
                              </option>
                              {[1, 2, 3, 4, 5].map((bonus) => (
                                <option key={bonus} value={bonus}>
                                  +{bonus}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <ItemPropertiesEditor
                          tags={item.shield.properties ?? []}
                          kind="shield"
                          label={t('pf1e.inventory.shieldProperties')}
                          onChange={(properties) =>
                            update((c) => {
                              const items = [...c.inventory.items]
                              const current = items[index]
                              if (!current.shield) return c
                              const shield = { ...current.shield }
                              if (properties) shield.properties = properties
                              else delete shield.properties
                              items[index] = { ...current, shield }
                              return {
                                ...c,
                                inventory: { ...c.inventory, items },
                              }
                            })
                          }
                        />
                      </div>
                    ) : null}

                    {suggestedPrice !== null ? (
                      <div className="muted" style={{ marginTop: '0.25rem' }}>
                        {t('pf1e.inventory.suggestedPrice', {
                          price: suggestedPrice.toLocaleString(),
                        })}
                      </div>
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
                              quantity:
                                Math.max(0, Number(e.target.value) || 0),
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
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      aria-label={t('pf1e.inventory.priceGp')}
                      value={item.priceGp ?? ''}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          inventory: {
                            ...c.inventory,
                            items: patchAt(c.inventory.items, index, {
                              priceGp:
                                e.target.value === ''
                                  ? null
                                  : Math.max(0, Number(e.target.value) || 0),
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
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

function ItemPropertiesEditor({
  tags,
  kind,
  label,
  onChange,
}: {
  tags: string[]
  kind: 'weapon' | 'armor' | 'shield'
  label?: string
  onChange: (next: string[] | undefined) => void
}) {
  const t = useT()
  const [draft, setDraft] = useState('')
  const catalog = getPropertiesForKind(kind)

  const addDraft = () => {
    if (!draft.trim()) return
    onChange(addItemProperty(tags, draft))
    setDraft('')
  }

  const addFromCatalog = (tag: string) => {
    if (!tag) return
    onChange(addItemProperty(tags, tag))
  }

  const fieldLabel = label ?? t('pf1e.inventory.properties')

  return (
    <div className="weapon-properties item-properties">
      <span className="muted">{fieldLabel}</span>
      <ul className="property-list" aria-label={fieldLabel}>
        {tags.map((tag) => (
          <li key={tag} className="property-chip">
            <span>{tag}</span>
            <button
              type="button"
              aria-label={t('pf1e.inventory.removeProperty', { tag })}
              onClick={() => onChange(removeItemProperty(tags, tag))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="property-add">
        <select
          aria-label={t('pf1e.inventory.selectProperty')}
          value=""
          onChange={(e) => addFromCatalog(e.target.value)}
        >
          <option value="">{t('pf1e.inventory.selectProperty')}</option>
          {catalog
            .filter((prop) => !tags.includes(prop.id))
            .map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
                {prop.bonusEquivalent > 0 ? ` (+${prop.bonusEquivalent})` : ''}
              </option>
            ))}
        </select>
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

export function WeaponPropertiesEditor(props: {
  tags: string[]
  onChange: (next: string[] | undefined) => void
}) {
  return <ItemPropertiesEditor {...props} kind="weapon" />
}
