import {
  createEmptyCondition,
  createEmptyDailyResource,
  type CharacterDocument,
} from '../character'
import type { DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { patchAt, updateAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const RESETS = ['daily', 'encounter', 'refocus', 'other'] as const

export function PlayPanel({
  character,
  derived,
  update,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
}) {
  return (
    <div className="panel-stack">
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>Current HP</th>
            <td>
              <input
                type="number"
                value={character.vitals.currentHp}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      currentHp: Number(e.target.value) || 0,
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Max HP</th>
            <td>
              <DerivedCell
                value={derived.maxHp}
                overridden={derived.overriddenPaths.includes('derived.maxHp')}
              />
            </td>
          </tr>
          <tr>
            <th>Temp HP</th>
            <td>
              <input
                type="number"
                min={0}
                value={character.vitals.temporaryHp}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      temporaryHp: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Dying / Wounded / Doomed</th>
            <td className="inline-triple">
              <input
                type="number"
                min={0}
                max={4}
                value={character.vitals.dying}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      dying: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
              <input
                type="number"
                min={0}
                value={character.vitals.wounded}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      wounded: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
              <input
                type="number"
                min={0}
                value={character.vitals.doomed}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      doomed: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>Conditions</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              conditions: [...c.conditions, createEmptyCondition()],
            }))
          }
        >
          Add condition
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Duration</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.conditions.length === 0 ? (
            <tr>
              <td colSpan={5} className="muted">
                No conditions.
              </td>
            </tr>
          ) : (
            character.conditions.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input
                    value={row.condition.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        conditions: updateAt(c.conditions, index, (row) => ({
                          ...row,
                          condition: {
                            ...row.condition,
                            name: e.target.value,
                          },
                        })),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.value ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        conditions: patchAt(c.conditions, index, {
                          value:
                            e.target.value === ''
                              ? null
                              : Number(e.target.value) || 0,
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    value={row.duration ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        conditions: patchAt(c.conditions, index, {
                          duration: e.target.value,
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    value={row.notes ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        conditions: patchAt(c.conditions, index, {
                          notes: e.target.value,
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        conditions: c.conditions.filter((item) => item.id !== row.id),
                      }))
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>Daily / encounter resources</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              play: {
                ...c.play,
                dailyResources: [
                  ...c.play.dailyResources,
                  createEmptyDailyResource(),
                ],
              },
            }))
          }
        >
          Add resource
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>Name</th>
            <th>Max</th>
            <th>Left</th>
            <th>Resets</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.play.dailyResources.length === 0 ? (
            <tr>
              <td colSpan={5} className="muted">
                No extra resources. Focus is on the Spells tab.
              </td>
            </tr>
          ) : (
            character.play.dailyResources.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input
                    value={row.name}
                    onChange={(e) =>
                      update((c) => {
                        const dailyResources = [...c.play.dailyResources]
                        dailyResources[index] = {
                          ...dailyResources[index],
                          name: e.target.value,
                        }
                        return {
                          ...c,
                          play: { ...c.play, dailyResources },
                        }
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={row.max}
                    onChange={(e) =>
                      update((c) => {
                        const dailyResources = [...c.play.dailyResources]
                        dailyResources[index] = {
                          ...dailyResources[index],
                          max: Math.max(0, Number(e.target.value) || 0),
                        }
                        return {
                          ...c,
                          play: { ...c.play, dailyResources },
                        }
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={row.remaining}
                    onChange={(e) =>
                      update((c) => {
                        const dailyResources = [...c.play.dailyResources]
                        dailyResources[index] = {
                          ...dailyResources[index],
                          remaining: Math.max(0, Number(e.target.value) || 0),
                        }
                        return {
                          ...c,
                          play: { ...c.play, dailyResources },
                        }
                      })
                    }
                  />
                </td>
                <td>
                  <select
                    value={row.resetsOn ?? 'daily'}
                    onChange={(e) =>
                      update((c) => {
                        const dailyResources = [...c.play.dailyResources]
                        dailyResources[index] = {
                          ...dailyResources[index],
                          resetsOn: e.target.value as (typeof RESETS)[number],
                        }
                        return {
                          ...c,
                          play: { ...c.play, dailyResources },
                        }
                      })
                    }
                  >
                    {RESETS.map((reset) => (
                      <option key={reset} value={reset}>
                        {reset}
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
                        play: {
                          ...c.play,
                          dailyResources: c.play.dailyResources.filter(
                            (item) => item.id !== row.id,
                          ),
                        },
                      }))
                    }
                  >
                    Remove
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
