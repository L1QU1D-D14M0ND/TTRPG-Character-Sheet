import {
  createEmptyClass,
  ensureEidolonCompanion,
  type CharacterDocument,
} from '../character'
import type { Alignment, Size } from '../character/types'
import { applyClassProgression, applyCrbRace, applyApgArchetype, APG_ARCHETYPES, APG_CLASSES, CRB_CLASSES, CRB_RACES, stampClassSkills } from '../content'
import { characterLevel, type DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { useT } from '../../../shared/i18n'
import { SynthesistPanel } from './SynthesistPanel'
import { patchAt, updateAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const SIZES: Size[] = [
  'fine',
  'diminutive',
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan',
  'colossal',
]

const ALIGNMENTS: Array<Alignment | ''> = [
  '',
  'lawful good',
  'neutral good',
  'chaotic good',
  'lawful neutral',
  'neutral',
  'chaotic neutral',
  'lawful evil',
  'neutral evil',
  'chaotic evil',
]

const BAB: Array<CharacterDocument['classes'][number]['babProgression']> = [
  'full',
  'threeQuarter',
  'half',
]

const SAVE: Array<'good' | 'poor'> = ['good', 'poor']

const ALIGNMENT_KEYS: Record<Alignment, string> = {
  'lawful good': 'pf1e.identity.alignments.lawfulGood',
  'neutral good': 'pf1e.identity.alignments.neutralGood',
  'chaotic good': 'pf1e.identity.alignments.chaoticGood',
  'lawful neutral': 'pf1e.identity.alignments.lawfulNeutral',
  'neutral': 'pf1e.identity.alignments.neutral',
  'chaotic neutral': 'pf1e.identity.alignments.chaoticNeutral',
  'lawful evil': 'pf1e.identity.alignments.lawfulEvil',
  'neutral evil': 'pf1e.identity.alignments.neutralEvil',
  'chaotic evil': 'pf1e.identity.alignments.chaoticEvil',
}

const BAB_KEYS = {
  full: 'pf1e.identity.babFull',
  threeQuarter: 'pf1e.identity.babThreeQuarter',
  half: 'pf1e.identity.babHalf',
} as const

export function IdentityPanel({
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
          <tr>
            <th>{t('pf1e.identity.player')}</th>
            <td>
              <input
                aria-label={t('pf1e.identity.player')}
                value={character.identity.playerName ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: { ...c.identity, playerName: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.identity.race')}</th>
            <td className="race-cell">
              <select
                aria-label={t('pf1e.identity.raceCatalog')}
                value={character.identity.race.id ?? ''}
                onChange={(e) => {
                  const id = e.target.value || null
                  update((c) => ({
                    ...c,
                    identity: applyCrbRace(c.identity, id),
                  }))
                }}
              >
                <option value="">{t('pf1e.common.custom')}</option>
                {CRB_RACES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              <input
                aria-label={t('pf1e.identity.raceName')}
                value={character.identity.race.name}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      race: { ...c.identity.race, name: e.target.value },
                    },
                  }))
                }
              />
              <p className="muted">
                {t('pf1e.identity.raceHelp')}
              </p>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.identity.size')}</th>
            <td>
              <select
                aria-label={t('pf1e.identity.size')}
                value={character.identity.size}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: { ...c.identity, size: e.target.value as Size },
                  }))
                }
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {t(`pf1e.identity.sizes.${size}`)}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.identity.alignment')}</th>
            <td>
              <select
                aria-label={t('pf1e.identity.alignment')}
                value={character.identity.alignment ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      alignment: (e.target.value || null) as Alignment | null,
                    },
                  }))
                }
              >
                {ALIGNMENTS.map((value) => (
                  <option key={value || 'none'} value={value}>
                    {value
                      ? t(ALIGNMENT_KEYS[value])
                      : t('pf1e.common.none')}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.identity.deity')}</th>
            <td>
              <input
                aria-label={t('pf1e.identity.deity')}
                value={character.identity.deity ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: { ...c.identity, deity: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.identity.xp')}</th>
            <td>
              <input
                type="number"
                min={0}
                aria-label={t('pf1e.identity.xp')}
                value={character.identity.xp ?? 0}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      xp: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.identity.levelDerived')}</th>
            <td>
              <DerivedCell
                value={derived.level}
                overridden={derived.overriddenPaths.includes('derived.level')}
              />
              <span className="muted">
                {' '}
                {t('pf1e.identity.levelSum', {
                  level: characterLevel(character.classes),
                })}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>{t('pf1e.identity.classes')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              classes: [...c.classes, createEmptyClass()],
            }))
          }
        >
          {t('pf1e.identity.addClass')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.identity.className')}</th>
            <th>{t('pf1e.identity.levels')}</th>
            <th>{t('pf1e.identity.hitDie')}</th>
            <th>{t('pf1e.identity.bab')}</th>
            <th>{t('pf1e.identity.fort')}</th>
            <th>{t('pf1e.identity.ref')}</th>
            <th>{t('pf1e.identity.will')}</th>
            <th>{t('pf1e.identity.favoredHp')}</th>
            <th>{t('pf1e.identity.favoredRanks')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.classes.length === 0 ? (
            <tr>
              <td colSpan={10} className="muted">
                {t('pf1e.identity.noClasses')}
              </td>
            </tr>
          ) : (
            character.classes.map((row, index) => (
              <tr key={row.id}>
                <td className="class-cell">
                  <select
                    aria-label={t('pf1e.identity.classCatalog')}
                    value={row.class.id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null
                      update((c) => {
                        const classes = [...c.classes]
                        classes[index] = applyClassProgression(
                          classes[index],
                          id,
                        )
                        return {
                          ...c,
                          classes,
                          skills: stampClassSkills(c.skills, classes),
                        }
                      })
                    }}
                  >
                    <option value="">{t('pf1e.common.custom')}</option>
                    <optgroup label={t('pf1e.identity.optgroupCrb')}>
                      {CRB_CLASSES.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={t('pf1e.identity.optgroupApg')}>
                      {APG_CLASSES.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <input
                    aria-label={t('pf1e.identity.className')}
                    value={row.class.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        classes: updateAt(c.classes, index, (row) => ({
                          ...row,
                          class: {
                            ...row.class,
                            name: e.target.value,
                          },
                        })),
                      }))
                    }
                  />
                  {row.class.id === 'class.summoner' ? (
                    <>
                      <select
                        aria-label={t('pf1e.identity.archetype')}
                        value={row.archetype?.id ?? ''}
                        onChange={(e) => {
                          const id = e.target.value || null
                          update((c) => {
                            const classes = [...c.classes]
                            classes[index] = applyApgArchetype(
                              classes[index],
                              id,
                            )
                            return {
                              ...c,
                              classes,
                              companions:
                                id === 'archetype.synthesist'
                                  ? ensureEidolonCompanion(c.companions)
                                  : c.companions,
                            }
                          })
                        }}
                      >
                        <option value="">{t('pf1e.identity.noArchetype')}</option>
                        {APG_ARCHETYPES.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.name}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label={t('pf1e.identity.archetypeName')}
                        value={row.archetype?.name ?? ''}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            classes: updateAt(c.classes, index, (row) => ({
                              ...row,
                              archetype: {
                                id: row.archetype?.id ?? null,
                                name: e.target.value,
                                source: row.archetype?.source,
                              },
                            })),
                          }))
                        }
                      />
                    </>
                  ) : null}
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    aria-label={t('pf1e.identity.levels')}
                    value={row.levels}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        classes: patchAt(c.classes, index, {
                          levels: Math.max(1, Number(e.target.value) || 1),
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    aria-label={t('pf1e.identity.hitDie')}
                    value={row.hitDie}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        classes: patchAt(c.classes, index, {
                          hitDie: Math.max(1, Number(e.target.value) || 8),
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <select
                    aria-label={t('pf1e.identity.bab')}
                    value={row.babProgression}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        classes: patchAt(c.classes, index, {
                          babProgression: e.target
                            .value as (typeof BAB)[number],
                        }),
                      }))
                    }
                  >
                    {BAB.map((value) => (
                      <option key={value} value={value}>
                        {t(BAB_KEYS[value])}
                      </option>
                    ))}
                  </select>
                </td>
                {(['fort', 'ref', 'will'] as const).map((save) => (
                  <td key={save}>
                    <select
                      aria-label={t(`pf1e.identity.${save}`)}
                      value={row.saves[save]}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          classes: updateAt(c.classes, index, (row) => ({
                            ...row,
                            saves: {
                              ...row.saves,
                              [save]: e.target.value as 'good' | 'poor',
                            },
                          })),
                        }))
                      }
                    >
                      {SAVE.map((value) => (
                        <option key={value} value={value}>
                          {t(value === 'good' ? 'pf1e.identity.saveGood' : 'pf1e.identity.savePoor')}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
                <td>
                  <input
                    type="number"
                    min={0}
                    aria-label={t('pf1e.identity.favoredHp')}
                    value={row.favored?.hp ?? 0}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        classes: updateAt(c.classes, index, (row) => ({
                          ...row,
                          favored: {
                            hp: Math.max(0, Number(e.target.value) || 0),
                            skillRanks: row.favored?.skillRanks ?? 0,
                          },
                        })),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    aria-label={t('pf1e.identity.favoredRanks')}
                    value={row.favored?.skillRanks ?? 0}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        classes: updateAt(c.classes, index, (row) => ({
                          ...row,
                          favored: {
                            hp: row.favored?.hp ?? 0,
                            skillRanks: Math.max(
                              0,
                              Number(e.target.value) || 0,
                            ),
                          },
                        })),
                      }))
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => {
                        const classes = c.classes.filter(
                          (item) => item.id !== row.id,
                        )
                        return {
                          ...c,
                          classes,
                          skills: stampClassSkills(c.skills, classes),
                        }
                      })
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
      {character.classes.some((row) => row.class.id === 'class.summoner') ? (
        <p className="muted">
          {t('pf1e.identity.synthesistHelp')}
        </p>
      ) : null}
      <SynthesistPanel
        character={character}
        derived={derived}
        update={update}
      />
    </div>
  )
}
