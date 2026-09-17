import { useRef, useState } from 'react'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
  type CharacterDocument,
} from '../character'
import type { AbilityKey, SpellListEntry, SpellcastingEntry } from '../character/types'
import { applyCrbSpell, CRB_SPELLS } from '../content'
import type { DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { useT } from '../../../shared/i18n'
import type { SheetUpdate } from './update'

const ATTRS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function SpellsPanel({
  character,
  derived,
  update,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
}) {
  const t = useT()
  function patchEntry(
    index: number,
    patch: Partial<SpellcastingEntry> | ((entry: SpellcastingEntry) => SpellcastingEntry),
  ) {
    update((c) => {
      const spellcasting = [...c.spellcasting]
      const current = spellcasting[index]
      spellcasting[index] =
        typeof patch === 'function' ? patch(current) : { ...current, ...patch }
      return { ...c, spellcasting }
    })
  }

  return (
    <div className="panel-stack">
      <p className="muted">{t('pf1e.spells.help')}</p>
      <div className="table-toolbar">
        <strong>{t('pf1e.spells.entries')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              spellcasting: [...c.spellcasting, createEmptySpellcasting()],
            }))
          }
        >
          {t('pf1e.spells.addEntry')}
        </button>
      </div>
      {character.spellcasting.length === 0 ? (
        <p className="placeholder">{t('pf1e.spells.empty')}</p>
      ) : (
        character.spellcasting.map((entry, index) => (
          <SpellcastingBlock
            key={entry.id}
            entry={entry}
            classes={character.classes}
            derived={derived.spellcasting[entry.id]}
            overriddenPaths={derived.overriddenPaths}
            onPatch={(patch) => patchEntry(index, patch)}
            onRemove={() =>
              update((c) => ({
                ...c,
                spellcasting: c.spellcasting.filter((row) => row.id !== entry.id),
              }))
            }
          />
        ))
      )}
    </div>
  )
}

function SpellcastingBlock({
  entry,
  classes,
  derived,
  overriddenPaths,
  onPatch,
  onRemove,
}: {
  entry: SpellcastingEntry
  classes: CharacterDocument['classes']
  derived: DerivedView['spellcasting'][string] | undefined
  overriddenPaths: string[]
  onPatch: (
    patch: Partial<SpellcastingEntry> | ((current: SpellcastingEntry) => SpellcastingEntry),
  ) => void
  onRemove: () => void
}) {
  const t = useT()
  function patchList(listKey: 'cantrips' | 'spells', list: SpellListEntry[]) {
    onPatch({ [listKey]: list })
  }

  return (
    <section className="spell-block">
      <div className="table-toolbar">
        <input
          value={entry.name}
          onChange={(e) => onPatch({ name: e.target.value })}
          aria-label={t('pf1e.spells.entryName')}
        />
        <button type="button" onClick={onRemove}>
          {t('pf1e.spells.removeEntry')}
        </button>
      </div>
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>{t('pf1e.spells.ability')}</th>
            <td>
              <select
                aria-label={t('pf1e.spells.ability')}
                value={entry.ability}
                onChange={(e) =>
                  onPatch({ ability: e.target.value as AbilityKey })
                }
              >
                {ATTRS.map((key) => (
                  <option key={key} value={key}>
                    {key.toUpperCase()}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.spells.classRow')}</th>
            <td>
              <select
                aria-label={t('pf1e.spells.classRow')}
                value={entry.classRowId ?? ''}
                onChange={(e) =>
                  onPatch({ classRowId: e.target.value || null })
                }
              >
                <option value="">{t('pf1e.spells.noClassRow')}</option>
                {classes.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.class.name || row.id} {row.levels}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.spells.casterLevelOverride')}</th>
            <td>
              <input
                type="number"
                min={0}
                aria-label={t('pf1e.spells.casterLevelOverride')}
                value={entry.casterLevelOverride ?? ''}
                onChange={(e) =>
                  onPatch({
                    casterLevelOverride:
                      e.target.value === ''
                        ? null
                        : Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.spells.casterLevel')}</th>
            <td>
              <DerivedCell
                value={derived?.casterLevel ?? 0}
                overridden={overriddenPaths.includes(
                  `derived.spellcasting.${entry.id}.casterLevel`,
                )}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.spells.level')}</th>
            <th>{t('pf1e.spells.dc')}</th>
            <th>{t('pf1e.spells.bonusSlots')}</th>
            {derived?.schoolSlotsByLevel?.some((v) => v > 0) ? (
              <th>{t('pf1e.spells.schoolSlots')}</th>
            ) : null}
            <th>{t('pf1e.spells.max')}</th>
            <th>{t('pf1e.spells.left')}</th>
          </tr>
        </thead>
        <tbody>
          {SPELL_LEVELS.map((spellLevel) => {
            const slot =
              entry.slots.find((row) => row.spellLevel === spellLevel) ?? {
                spellLevel,
                max: null,
                remaining: 0,
              }
            const hasSchoolCol =
              derived?.schoolSlotsByLevel?.some((v) => v > 0) ?? false
            return (
              <tr key={spellLevel}>
                <th>
                  {spellLevel === 0
                    ? t('pf1e.spells.cantripLevel')
                    : spellLevel}
                </th>
                <td>
                  <DerivedCell
                    value={derived?.dcByLevel[spellLevel] ?? 10}
                    overridden={overriddenPaths.includes(
                      `derived.spellcasting.${entry.id}.dcByLevel.${spellLevel}`,
                    )}
                  />
                </td>
                <td>
                  <DerivedCell
                    value={derived?.bonusSlotsByLevel[spellLevel] ?? 0}
                    overridden={overriddenPaths.includes(
                      `derived.spellcasting.${entry.id}.bonusSlotsByLevel.${spellLevel}`,
                    )}
                  />
                </td>
                {hasSchoolCol ? (
                  <td>
                    <DerivedCell
                      value={derived?.schoolSlotsByLevel[spellLevel] ?? 0}
                      overridden={false}
                    />
                  </td>
                ) : null}
                <td>
                  <SlotMaxCell
                    spellLevel={spellLevel}
                    displayed={derived?.slotMaxByLevel[spellLevel] ?? 0}
                    custom={slot.max ?? null}
                    onChange={(max) =>
                      onPatch((current) => ({
                        ...current,
                        slots: upsertSlot(current.slots, spellLevel, { max }),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    aria-label={`${t('pf1e.spells.left')} ${spellLevel}`}
                    value={slot.remaining}
                    onChange={(e) =>
                      onPatch((current) => ({
                        ...current,
                        slots: upsertSlot(current.slots, spellLevel, {
                          remaining: Math.max(0, Number(e.target.value) || 0),
                        }),
                      }))
                    }
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <SpellListTable
        title={t('pf1e.spells.cantrips')}
        rows={entry.cantrips}
        onChange={(list) => patchList('cantrips', list)}
        defaultLevel={0}
      />
      <SpellListTable
        title={t('pf1e.spells.spells')}
        rows={entry.spells}
        onChange={(list) => patchList('spells', list)}
        defaultLevel={1}
      />
    </section>
  )
}

function upsertSlot(
  slots: SpellcastingEntry['slots'],
  spellLevel: number,
  patch: Partial<{ max: number | null; remaining: number }>,
): SpellcastingEntry['slots'] {
  const next = [...slots]
  const index = next.findIndex((row) => row.spellLevel === spellLevel)
  if (index === -1) {
    next.push({
      spellLevel,
      max: patch.max ?? null,
      remaining: patch.remaining ?? 0,
    })
    return next
  }
  next[index] = { ...next[index], ...patch }
  return next
}

function SlotMaxCell({
  spellLevel,
  displayed,
  custom,
  onChange,
}: {
  spellLevel: number
  displayed: number
  custom: number | null
  onChange: (max: number | null) => void
}) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const skipBlur = useRef(false)
  const overridden = custom != null

  function commit(raw: string) {
    const trimmed = raw.trim()
    if (trimmed === '') onChange(null)
    else onChange(Math.max(0, Number(trimmed) || 0))
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        type="number"
        min={0}
        autoFocus
        placeholder={String(displayed)}
        aria-label={t('pf1e.spells.maxEdit', { level: spellLevel })}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (skipBlur.current) {
            skipBlur.current = false
            return
          }
          commit(draft)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            skipBlur.current = true
            setEditing(false)
          }
          if (e.key === 'Enter') {
            e.preventDefault()
            commit(draft)
          }
        }}
      />
    )
  }

  return (
    <button
      type="button"
      className={overridden ? 'derived-button overridden' : 'derived-button'}
      title={t('pf1e.spells.maxHint', { default: displayed })}
      aria-label={t('pf1e.spells.maxOverride', {
        level: spellLevel,
        max: displayed,
      })}
      onClick={() => {
        setDraft(custom == null ? '' : String(custom))
        setEditing(true)
      }}
    >
      {displayed}
    </button>
  )
}

function SpellListTable({
  title,
  rows,
  onChange,
  defaultLevel,
}: {
  title: string
  rows: SpellListEntry[]
  onChange: (rows: SpellListEntry[]) => void
  defaultLevel: number
}) {
  const t = useT()
  return (
    <>
      <div className="table-toolbar">
        <strong>{title}</strong>
        <button
          type="button"
          onClick={() =>
            onChange([...rows, createEmptySpellListEntry(defaultLevel)])
          }
        >
          {t('pf1e.spells.addSpell')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.spells.name')}</th>
            <th>{t('pf1e.spells.level')}</th>
            <th>{t('pf1e.spells.prepared')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                {t('pf1e.spells.emptyList')}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id}>
                <td className="spell-cell">
                  <select
                    aria-label={t('pf1e.spells.catalog')}
                    value={row.spell.id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null
                      const next = [...rows]
                      next[index] = applyCrbSpell(next[index], id)
                      onChange(next)
                    }}
                  >
                    <option value="">{t('pf1e.common.custom')}</option>
                    {CRB_SPELLS.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={t('pf1e.spells.spellName')}
                    value={row.spell.name}
                    onChange={(e) => {
                      const next = [...rows]
                      next[index] = {
                        ...next[index],
                        spell: { ...next[index].spell, name: e.target.value },
                      }
                      onChange(next)
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={9}
                    aria-label={t('pf1e.spells.level')}
                    value={row.spellLevel}
                    onChange={(e) => {
                      const next = [...rows]
                      next[index] = {
                        ...next[index],
                        spellLevel: Math.min(
                          9,
                          Math.max(0, Number(e.target.value) || 0),
                        ),
                      }
                      onChange(next)
                    }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={t('pf1e.spells.prepared')}
                    checked={row.prepared ?? false}
                    onChange={(e) => {
                      const next = [...rows]
                      next[index] = {
                        ...next[index],
                        prepared: e.target.checked,
                      }
                      onChange(next)
                    }}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(rows.filter((item) => item.id !== row.id))
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
    </>
  )
}
