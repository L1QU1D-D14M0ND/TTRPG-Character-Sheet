import {
  createEmptyAttack,
  type CharacterDocument,
} from '../character'
import type { AbilityKey } from '../character/types'
import { formatIteratives, signed, type DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { useT } from '../../../shared/i18n'
import { patchAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const ABILITY_OPTIONS: AbilityKey[] = [
  'str',
  'dex',
  'con',
  'int',
  'wis',
  'cha',
]

const AC_FIELDS = [
  ['armorBonus', 'pf1e.combat.armorBonus'],
  ['shieldBonus', 'pf1e.combat.shieldBonus'],
  ['natural', 'pf1e.combat.natural'],
  ['deflection', 'pf1e.combat.deflection'],
  ['dodge', 'pf1e.combat.dodge'],
  ['other', 'pf1e.combat.other'],
  ['armorCheckPenalty', 'pf1e.combat.acp'],
] as const

const COMBAT_MISC = [
  ['initiativeMisc', 'pf1e.combat.initiativeMisc'],
  ['meleeAttackMisc', 'pf1e.combat.meleeMisc'],
  ['rangedAttackMisc', 'pf1e.combat.rangedMisc'],
  ['cmbMisc', 'pf1e.combat.cmbMisc'],
  ['cmdMisc', 'pf1e.combat.cmdMisc'],
  ['fortMisc', 'pf1e.combat.fortMisc'],
  ['refMisc', 'pf1e.combat.refMisc'],
  ['willMisc', 'pf1e.combat.willMisc'],
] as const

export function CombatPanel({
  character,
  derived,
  update,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
}) {
  const t = useT()
  const ac = character.armorClass
  const combat = character.combat

  function setAc<K extends keyof typeof ac>(key: K, value: (typeof ac)[K]) {
    update((c) => ({
      ...c,
      armorClass: { ...c.armorClass, [key]: value },
    }))
  }

  function setCombat<K extends keyof typeof combat>(
    key: K,
    value: (typeof combat)[K],
  ) {
    update((c) => ({
      ...c,
      combat: { ...c.combat, [key]: value },
    }))
  }

  return (
    <div className="panel-stack">
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>{t('pf1e.combat.bab')}</th>
            <td>
              <DerivedCell
                value={signed(derived.bab)}
                overridden={derived.overriddenPaths.includes('derived.bab')}
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.combat.iteratives')}</th>
            <td>
              <DerivedCell
                value={formatIteratives(derived.babIteratives)}
                overridden={derived.overriddenPaths.includes(
                  'derived.babIteratives',
                )}
              />
              <div className="muted">{t('pf1e.combat.iterativesHelp')}</div>
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.combat.meleeRanged')}</th>
            <td>
              <DerivedCell
                value={`${signed(derived.meleeAttack)} / ${signed(derived.rangedAttack)}`}
                overridden={
                  derived.overriddenPaths.includes('derived.meleeAttack') ||
                  derived.overriddenPaths.includes('derived.rangedAttack')
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.combat.acTrio')}</th>
            <td>
              <DerivedCell
                value={`${derived.ac} / ${derived.touchAc} / ${derived.flatFootedAc}`}
                overridden={
                  derived.overriddenPaths.includes('derived.ac') ||
                  derived.overriddenPaths.includes('derived.touchAc') ||
                  derived.overriddenPaths.includes('derived.flatFootedAc')
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.combat.cmbCmd')}</th>
            <td>
              <DerivedCell
                value={`${signed(derived.cmb)} / ${derived.cmd} (FF ${derived.flatFootedCmd})`}
                overridden={
                  derived.overriddenPaths.includes('derived.cmb') ||
                  derived.overriddenPaths.includes('derived.cmd') ||
                  derived.overriddenPaths.includes('derived.flatFootedCmd')
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.combat.saves')}</th>
            <td>
              <DerivedCell
                value={`${signed(derived.fortitude)} / ${signed(derived.reflex)} / ${signed(derived.will)}`}
                overridden={derived.overriddenPaths.includes(
                  'derived.fortitude',
                )}
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.combat.initiative')}</th>
            <td>
              <DerivedCell
                value={signed(derived.initiative)}
                overridden={derived.overriddenPaths.includes(
                  'derived.initiative',
                )}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className="sheet-table">
        <thead>
          <tr>
            <th>{t('pf1e.combat.acInputs')}</th>
            <th>{t('pf1e.combat.value')}</th>
          </tr>
        </thead>
        <tbody>
          {AC_FIELDS.map(([key, labelKey]) => (
            <tr key={key}>
              <th>{t(labelKey)}</th>
              <td>
                <input
                  type="number"
                  aria-label={t(labelKey)}
                  value={ac[key]}
                  onChange={(e) =>
                    setAc(
                      key,
                      key === 'armorCheckPenalty'
                        ? Math.min(0, Number(e.target.value) || 0)
                        : Number(e.target.value) || 0,
                    )
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <th>{t('pf1e.combat.maxDex')}</th>
            <td>
              <input
                type="number"
                aria-label={t('pf1e.combat.maxDex')}
                value={ac.maxDex ?? ''}
                onChange={(e) =>
                  setAc(
                    'maxDex',
                    e.target.value === '' ? null : Number(e.target.value) || 0,
                  )
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p className="muted">{t('pf1e.combat.otherApplies')}</p>

      <table className="sheet-table">
        <thead>
          <tr>
            <th>{t('pf1e.combat.miscCombat')}</th>
            <th>{t('pf1e.combat.value')}</th>
          </tr>
        </thead>
        <tbody>
          {COMBAT_MISC.map(([key, labelKey]) => (
            <tr key={key}>
              <th>{t(labelKey)}</th>
              <td>
                <input
                  type="number"
                  aria-label={t(labelKey)}
                  value={combat[key]}
                  onChange={(e) =>
                    setCombat(key, Number(e.target.value) || 0)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>{t('pf1e.combat.attacks')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              attacks: [...c.attacks, createEmptyAttack()],
            }))
          }
        >
          {t('pf1e.combat.addAttack')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.combat.name')}</th>
            <th>{t('pf1e.combat.type')}</th>
            <th>{t('pf1e.combat.dice')}</th>
            <th>{t('pf1e.combat.damageType')}</th>
            <th>{t('pf1e.combat.atkAbility')}</th>
            <th>{t('pf1e.combat.dmgAbility')}</th>
            <th>{t('pf1e.combat.miscAtk')}</th>
            <th>{t('pf1e.combat.miscDmg')}</th>
            <th>{t('pf1e.combat.crit')}</th>
            <th>{t('pf1e.combat.range')}</th>
            <th>{t('pf1e.combat.attack')}</th>
            <th>{t('pf1e.combat.damage')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.attacks.length === 0 ? (
            <tr>
              <td colSpan={13} className="muted">
                {t('pf1e.combat.noAttacks')}
              </td>
            </tr>
          ) : (
            character.attacks.map((row, index) => {
              const derivedAttack = derived.attacks[row.id]
              return (
                <tr key={row.id}>
                  <td>
                    <input
                      aria-label={t('pf1e.combat.name')}
                      value={row.name}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            name: e.target.value,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      aria-label={t('pf1e.combat.type')}
                      value={row.attackType}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            attackType: e.target.value as 'melee' | 'ranged',
                          }),
                        }))
                      }
                    >
                      <option value="melee">{t('pf1e.combat.melee')}</option>
                      <option value="ranged">{t('pf1e.combat.ranged')}</option>
                    </select>
                  </td>
                  <td>
                    <input
                      aria-label={t('pf1e.combat.dice')}
                      value={row.damageDice}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            damageDice: e.target.value,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={t('pf1e.combat.damageType')}
                      value={row.damageType}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            damageType: e.target.value,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      aria-label={t('pf1e.combat.atkAbility')}
                      value={row.attackAbility ?? (row.attackType === 'ranged' ? 'dex' : 'str')}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            attackAbility: e.target.value as AbilityKey,
                          }),
                        }))
                      }
                    >
                      {ABILITY_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {key.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={t('pf1e.combat.dmgAbility')}
                      value={row.damageAbility === null ? '' : (row.damageAbility ?? row.attackAbility ?? 'str')}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            damageAbility:
                              e.target.value === ''
                                ? null
                                : (e.target.value as AbilityKey),
                          }),
                        }))
                      }
                    >
                      <option value="">{t('pf1e.combat.none')}</option>
                      {ABILITY_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {key.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      aria-label={t('pf1e.combat.miscAtk')}
                      value={row.miscAttack ?? 0}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            miscAttack: Number(e.target.value) || 0,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      aria-label={t('pf1e.combat.miscDmg')}
                      value={row.miscDamage ?? 0}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            miscDamage: Number(e.target.value) || 0,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      aria-label={t('pf1e.combat.crit')}
                      value={row.critRange ?? 20}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            critRange: Math.min(
                              20,
                              Math.max(1, Number(e.target.value) || 20),
                            ),
                          }),
                        }))
                      }
                    />
                    ×
                    <input
                      type="number"
                      aria-label={t('pf1e.combat.crit')}
                      value={row.critMultiplier ?? 2}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            critMultiplier: Math.max(
                              2,
                              Number(e.target.value) || 2,
                            ),
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      aria-label={t('pf1e.combat.range')}
                      value={row.rangeFeet ?? ''}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          attacks: patchAt(c.attacks, index, {
                            rangeFeet:
                              e.target.value === ''
                                ? null
                                : Math.max(0, Number(e.target.value) || 0),
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <DerivedCell
                      value={
                        derivedAttack
                          ? formatIteratives(derivedAttack.iteratives)
                          : '—'
                      }
                      overridden={derived.overriddenPaths.includes(
                        `derived.attacks.${row.id}.attack`,
                      )}
                    />
                  </td>
                  <td>
                    <DerivedCell value={derivedAttack?.damage ?? '—'} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        update((c) => ({
                          ...c,
                          attacks: c.attacks.filter((item) => item.id !== row.id),
                        }))
                      }
                    >
                      {t('pf1e.combat.remove')}
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
