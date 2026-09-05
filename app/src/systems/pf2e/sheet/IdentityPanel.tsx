import { blankRef, type CharacterDocument } from '../character'
import { patchAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const SIZES = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan',
] as const

export function IdentityPanel({
  character,
  update,
}: {
  character: CharacterDocument
  update: SheetUpdate
}) {
  const subclass = character.identity.subclass
  const deity = character.identity.deity

  return (
    <div className="panel-stack">
      <table className="sheet-table">
        <tbody>
          {(
            [
              ['Player', 'playerName'],
              ['Ancestry', 'ancestry'],
              ['Heritage', 'heritage'],
              ['Background', 'background'],
            ] as const
          ).map(([label, key]) => (
            <tr key={key}>
              <th>{label}</th>
              <td>
                {key === 'playerName' ? (
                  <input
                    value={character.identity.playerName ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        identity: { ...c.identity, playerName: e.target.value },
                      }))
                    }
                  />
                ) : (
                  <input
                    value={character.identity[key].name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        identity: {
                          ...c.identity,
                          [key]: {
                            ...c.identity[key],
                            name: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                )}
              </td>
            </tr>
          ))}
          <tr>
            <th>Subclass / doctrine</th>
            <td>
              <input
                value={subclass?.name ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      subclass: {
                        ...(c.identity.subclass ?? blankRef()),
                        name: e.target.value,
                      },
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>XP</th>
            <td>
              <input
                type="number"
                min={0}
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
            <th>Size</th>
            <td>
              <select
                value={character.identity.size}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      size: e.target.value as CharacterDocument['identity']['size'],
                    },
                  }))
                }
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>Traits</th>
            <td>
              <input
                value={character.identity.traits.join(', ')}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      traits: parseCommaList(e.target.value),
                    },
                  }))
                }
                placeholder="human, humanoid"
              />
            </td>
          </tr>
          <tr>
            <th>Deity</th>
            <td>
              <input
                value={deity?.name ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      deity: {
                        ...(c.identity.deity ?? blankRef()),
                        name: e.target.value,
                      },
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Home region</th>
            <td>
              <input
                value={character.identity.homeRegion ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: { ...c.identity, homeRegion: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Alignment (legacy)</th>
            <td>
              <input
                value={character.identity.alignment ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: {
                      ...c.identity,
                      alignment: e.target.value || null,
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Edicts</th>
            <td>
              <textarea
                rows={2}
                value={character.identity.edicts ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: { ...c.identity, edicts: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Anathema</th>
            <td>
              <textarea
                rows={2}
                value={character.identity.anathema ?? ''}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    identity: { ...c.identity, anathema: e.target.value },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Ancestry HP</th>
            <td>
              <input
                type="number"
                min={0}
                value={character.vitals.ancestryHp}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      ancestryHp: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>Class HP / level</th>
            <td>
              <input
                type="number"
                min={0}
                value={character.vitals.classHpPerLevel}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    vitals: {
                      ...c.vitals,
                      classHpPerLevel: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>Languages</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              identity: {
                ...c.identity,
                languages: [...c.identity.languages, blankRef()],
              },
            }))
          }
        >
          Add language
        </button>
      </div>
      <table className="sheet-table">
        <tbody>
          {character.identity.languages.length === 0 ? (
            <tr>
              <td className="muted">No languages yet.</td>
            </tr>
          ) : (
            character.identity.languages.map((lang, index) => (
              <tr key={`${lang.name}-${index}`}>
                <td>
                  <input
                    value={lang.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        identity: {
                          ...c.identity,
                          languages: patchAt(c.identity.languages, index, {
                            name: e.target.value,
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
                        identity: {
                          ...c.identity,
                          languages: c.identity.languages.filter(
                            (_, i) => i !== index,
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

      <div className="table-toolbar">
        <strong>Speeds</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              vitals: {
                ...c.vitals,
                speeds: [...c.vitals.speeds, { kind: 'land', feet: 0 }],
              },
            }))
          }
        >
          Add speed
        </button>
      </div>
      <table className="sheet-table">
        <thead>
          <tr>
            <th>Kind</th>
            <th>Feet</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.vitals.speeds.map((speed, index) => (
            <tr key={`${speed.kind}-${index}`}>
              <td>
                <input
                  value={speed.kind}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      vitals: {
                        ...c.vitals,
                        speeds: patchAt(c.vitals.speeds, index, {
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
                  value={speed.feet}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      vitals: {
                        ...c.vitals,
                        speeds: patchAt(c.vitals.speeds, index, {
                          feet: Math.max(0, Number(e.target.value) || 0),
                        }),
                      },
                    }))
                  }
                />
              </td>
              <td>
                <button
                  type="button"
                  disabled={character.vitals.speeds.length <= 1}
                  title={
                    character.vitals.speeds.length <= 1
                      ? 'At least one speed is required'
                      : 'Remove speed'
                  }
                  onClick={() =>
                    update((c) => ({
                      ...c,
                      vitals: {
                        ...c.vitals,
                        speeds: c.vitals.speeds.filter((_, i) => i !== index),
                      },
                    }))
                  }
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>Senses</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              vitals: {
                ...c.vitals,
                senses: [...c.vitals.senses, { name: '', rangeFeet: null }],
              },
            }))
          }
        >
          Add sense
        </button>
      </div>
      <table className="sheet-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Range (ft)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.vitals.senses.length === 0 ? (
            <tr>
              <td colSpan={3} className="muted">
                No special senses.
              </td>
            </tr>
          ) : (
            character.vitals.senses.map((sense, index) => (
              <tr key={`${sense.name}-${index}`}>
                <td>
                  <input
                    value={sense.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          senses: patchAt(c.vitals.senses, index, {
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
                    value={sense.rangeFeet ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          senses: patchAt(c.vitals.senses, index, {
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
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          senses: c.vitals.senses.filter((_, i) => i !== index),
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

      <div className="table-toolbar">
        <strong>HP bonuses</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              vitals: {
                ...c.vitals,
                bonuses: [
                  ...c.vitals.bonuses,
                  { label: '', amount: 0, perLevel: false },
                ],
              },
            }))
          }
        >
          Add bonus
        </button>
      </div>
      <table className="sheet-table">
        <thead>
          <tr>
            <th>Label</th>
            <th>Amount</th>
            <th>Per level</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.vitals.bonuses.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                No extra HP bonuses (Toughness, etc.).
              </td>
            </tr>
          ) : (
            character.vitals.bonuses.map((bonus, index) => (
              <tr key={`${bonus.label}-${index}`}>
                <td>
                  <input
                    value={bonus.label}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          bonuses: patchAt(c.vitals.bonuses, index, {
                            label: e.target.value,
                          }),
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={bonus.amount}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          bonuses: patchAt(c.vitals.bonuses, index, {
                            amount: Number(e.target.value) || 0,
                          }),
                        },
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={Boolean(bonus.perLevel)}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        vitals: {
                          ...c.vitals,
                          bonuses: patchAt(c.vitals.bonuses, index, {
                            perLevel: e.target.checked,
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
                          bonuses: c.vitals.bonuses.filter((_, i) => i !== index),
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

function parseCommaList(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}
