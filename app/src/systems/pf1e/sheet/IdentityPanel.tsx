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
import { patchAt, removeAt, updateAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const ARCANE_SCHOOLS = [
  'universalist',
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
] as const

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
                  {row.class.id === 'class.wizard' ? (
                    <div className="wizard-school-controls">
                      <select
                        aria-label={t('pf1e.identity.arcaneSchool')}
                        value={row.arcaneSchool?.specialized ?? 'universalist'}
                        onChange={(e) => {
                          const specialized = e.target.value
                          update((c) => ({
                            ...c,
                            classes: updateAt(c.classes, index, (r) => ({
                              ...r,
                              arcaneSchool: {
                                specialized,
                                opposition: (r.arcaneSchool?.opposition ?? []).filter(
                                  (s) => s !== specialized,
                                ),
                              },
                            })),
                          }))
                        }}
                      >
                        {ARCANE_SCHOOLS.map((school) => (
                          <option key={school} value={school}>
                            {t(`pf1e.identity.schools.${school}`)}
                          </option>
                        ))}
                      </select>
                      {row.arcaneSchool?.specialized &&
                      row.arcaneSchool.specialized !== 'universalist' ? (
                        <div className="opposition-schools">
                          <span className="muted">
                            {t('pf1e.identity.oppositionSchools')}:
                          </span>
                          {ARCANE_SCHOOLS.filter(
                            (s) =>
                              s !== 'universalist' &&
                              s !== row.arcaneSchool?.specialized,
                          ).map((school) => {
                            const isOpposed =
                              row.arcaneSchool?.opposition?.includes(school) ??
                              false
                            return (
                              <label
                                key={school}
                                className="school-checkbox-label"
                              >
                                <input
                                  type="checkbox"
                                  checked={isOpposed}
                                  aria-label={`${t('pf1e.identity.oppositionSchool')} ${school}`}
                                  onChange={(e) => {
                                    const current =
                                      row.arcaneSchool?.opposition ?? []
                                    const updated = e.target.checked
                                      ? [...current, school]
                                      : current.filter((s) => s !== school)
                                    update((c) => ({
                                      ...c,
                                      classes: updateAt(c.classes, index, (r) => ({
                                        ...r,
                                        arcaneSchool: {
                                          specialized:
                                            r.arcaneSchool?.specialized ??
                                            'universalist',
                                          opposition: updated,
                                        },
                                      })),
                                    }))
                                  }}
                                />
                                {t(`pf1e.identity.schools.${school}`)}
                              </label>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
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

      <div className="table-toolbar">
        <strong>{t('pf1e.identity.speeds')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              vitals: {
                ...c.vitals,
                speeds: [
                  ...(c.vitals.speeds ?? []),
                  { kind: 'land', feet: 30, notes: '' },
                ],
              },
            }))
          }
        >
          {t('pf1e.identity.addSpeed')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.identity.speedKind')}</th>
            <th>{t('pf1e.identity.speedFeet')}</th>
            <th>{t('pf1e.identity.speedNotes')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {!character.vitals.speeds || character.vitals.speeds.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                {t('pf1e.identity.noSpeeds')}
              </td>
            </tr>
          ) : (
            character.vitals.speeds.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    aria-label={t('pf1e.identity.speedKind')}
                    value={row.kind}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          speeds: patchAt(c.vitals.speeds ?? [], index, {
                            kind: e.target.value,
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
                    aria-label={t('pf1e.identity.speedFeet')}
                    value={row.feet}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          speeds: patchAt(c.vitals.speeds ?? [], index, {
                            feet: Math.max(0, Number(e.target.value) || 0),
                          }),
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={t('pf1e.identity.speedNotes')}
                    value={row.notes ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          speeds: patchAt(c.vitals.speeds ?? [], index, {
                            notes: e.target.value,
                          }),
                        },
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
                        vitals: {
                          ...c.vitals,
                          speeds: removeAt(c.vitals.speeds ?? [], index),
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

      <div className="table-toolbar">
        <strong>{t('pf1e.identity.senses')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              vitals: {
                ...c.vitals,
                senses: [
                  ...(c.vitals.senses ?? []),
                  { name: '', rangeFeet: null, notes: '' },
                ],
              },
            }))
          }
        >
          {t('pf1e.identity.addSense')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.identity.senseName')}</th>
            <th>{t('pf1e.identity.senseRange')}</th>
            <th>{t('pf1e.identity.senseNotes')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {!character.vitals.senses || character.vitals.senses.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                {t('pf1e.identity.noSenses')}
              </td>
            </tr>
          ) : (
            character.vitals.senses.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    aria-label={t('pf1e.identity.senseName')}
                    value={row.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          senses: patchAt(c.vitals.senses ?? [], index, {
                            name: e.target.value,
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
                    aria-label={t('pf1e.identity.senseRange')}
                    value={row.rangeFeet ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          senses: patchAt(c.vitals.senses ?? [], index, {
                            rangeFeet:
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
                  <input
                    aria-label={t('pf1e.identity.senseNotes')}
                    value={row.notes ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          senses: patchAt(c.vitals.senses ?? [], index, {
                            notes: e.target.value,
                          }),
                        },
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
                        vitals: {
                          ...c.vitals,
                          senses: removeAt(c.vitals.senses ?? [], index),
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
