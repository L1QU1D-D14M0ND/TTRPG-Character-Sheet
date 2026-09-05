import {
  createEmptyCondition,
  createEmptyDailyResource,
  type CharacterDocument,
} from '../character'
import type { DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { useT } from '../../../shared/i18n'
import { patchAt, updateAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const RESETS = ['daily', 'encounter', 'other'] as const

export function PlayPanel({
  character,
  derived,
  update,
  onOpenHpBreakdown,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
  onOpenHpBreakdown: () => void
}) {
  const t = useT()
  return (
    <div className="panel-stack">
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>{t('pf1e.play.currentHp')}</th>
            <td>
              <input
                type="number"
                aria-label={t('pf1e.play.currentHp')}
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
              <span className="muted"> {t('pf1e.play.mayBeNegative')}</span>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.play.maxHp')}</th>
            <td>
              <button
                type="button"
                className={
                  derived.overriddenPaths.includes('derived.maxHp')
                    ? 'derived overridden hp-max-button'
                    : 'derived hp-max-button'
                }
                title={t('pf1e.play.openBreakdown')}
                aria-label={t('pf1e.play.maxHpBreakdown', { max: derived.maxHp })}
                onClick={onOpenHpBreakdown}
              >
                {derived.maxHp}
              </button>
              <span className="muted"> {t('pf1e.play.clickBreakdown')}</span>
              {derived.fusedActive ? (
                <div className="muted">
                  {t('pf1e.play.costumeHpNote', { pilot: derived.pilotMaxHp })}
                </div>
              ) : null}
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.play.tempHp')}</th>
            <td>
              <input
                type="number"
                min={0}
                aria-label={t('pf1e.play.tempHp')}
                value={character.vitals.tempHp}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      tempHp: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.play.nonlethal')}</th>
            <td>
              <input
                type="number"
                min={0}
                aria-label={t('pf1e.play.nonlethal')}
                value={character.vitals.nonlethal ?? 0}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      nonlethal: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.play.deadAt')}</th>
            <td>
              <DerivedCell
                value={derived.deadAt}
                overridden={derived.overriddenPaths.includes('derived.deadAt')}
              />
              <span className="muted"> {t('pf1e.play.deadAtHelp')}</span>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.play.hdRolls')}</th>
            <td>
              <button type="button" onClick={onOpenHpBreakdown}>
                {t('pf1e.play.enterHd')}
              </button>
              <div className="muted">
                {t('pf1e.play.hdHelp')}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>{t('pf1e.play.conditions')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              conditions: [...c.conditions, createEmptyCondition()],
            }))
          }
        >
          {t('pf1e.play.addCondition')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.play.name')}</th>
            <th>{t('pf1e.play.value')}</th>
            <th>{t('pf1e.play.duration')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.conditions.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                {t('pf1e.play.noConditions')}
              </td>
            </tr>
          ) : (
            character.conditions.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input
                    aria-label={t('pf1e.play.name')}
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
                    aria-label={t('pf1e.play.value')}
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
                    aria-label={t('pf1e.play.duration')}
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
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        conditions: c.conditions.filter(
                          (item) => item.id !== row.id,
                        ),
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

      <div className="table-toolbar">
        <strong>{t('pf1e.play.dailyResources')}</strong>
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
          {t('pf1e.play.addResource')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.play.name')}</th>
            <th>{t('pf1e.play.max')}</th>
            <th>{t('pf1e.play.left')}</th>
            <th>{t('pf1e.play.resets')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.play.dailyResources.length === 0 ? (
            <tr>
              <td colSpan={5} className="muted">
                {t('pf1e.play.noResources')}
              </td>
            </tr>
          ) : (
            character.play.dailyResources.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input
                    aria-label={t('pf1e.play.name')}
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
                    aria-label={t('pf1e.play.max')}
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
                    aria-label={t('pf1e.play.left')}
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
                    aria-label={t('pf1e.play.resets')}
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
                    {RESETS.map((value) => (
                      <option key={value} value={value}>
                        {t(
                          value === 'daily'
                            ? 'pf1e.play.resetDaily'
                            : value === 'encounter'
                              ? 'pf1e.play.resetEncounter'
                              : 'pf1e.play.resetOther',
                        )}
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
