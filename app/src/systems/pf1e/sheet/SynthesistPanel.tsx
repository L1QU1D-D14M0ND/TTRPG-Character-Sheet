import {
  createEmptyEvolution,
  ensureEidolonCompanion,
} from '../character'
import type {
  CharacterDocument,
  CompanionStub,
  FusedOverlay,
} from '../character/types'
import { useT } from '../../../shared/i18n'
import type { DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { CatalogPicker } from './CatalogPicker'
import type { SheetUpdate } from './update'

function patchEidolon(
  companions: CompanionStub[],
  patch: (row: CompanionStub) => CompanionStub,
): CompanionStub[] {
  const rows = ensureEidolonCompanion(companions)
  return rows.map((row) => (row.kind === 'eidolon' ? patch(row) : row))
}

function defaultFused(): FusedOverlay {
  return { active: false, str: 10, dex: 10, con: 10, costumeHp: 0 }
}

export function SynthesistPanel({
  character,
  derived,
  update,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
}) {
  const t = useT()
  if (
    !character.classes.some(
      (row) => row.archetype?.id === 'archetype.synthesist',
    )
  ) {
    return null
  }

  const eidolon =
    character.companions.find((row) => row.kind === 'eidolon') ?? null
  const fused = eidolon?.fused ?? defaultFused()
  const evolutions = eidolon?.evolutions ?? []

  function writeEidolon(patch: (row: CompanionStub) => CompanionStub) {
    update((c) => ({
      ...c,
      companions: patchEidolon(c.companions, patch),
    }))
  }

  function writeFused(patch: Partial<FusedOverlay>) {
    writeEidolon((row) => ({
      ...row,
      fused: { ...(row.fused ?? defaultFused()), ...patch },
    }))
  }

  return (
    <div className="panel-stack">
      <strong>{t('pf1e.synthesist.title')}</strong>
      <p className="muted">{t('pf1e.synthesist.help')}</p>
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>{t('pf1e.synthesist.name')}</th>
            <td>
              <input
                aria-label={t('pf1e.synthesist.name')}
                value={eidolon?.name ?? ''}
                onChange={(e) =>
                  writeEidolon((row) => ({ ...row, name: e.target.value }))
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.synthesist.fused')}</th>
            <td>
              <input
                type="checkbox"
                aria-label={t('pf1e.synthesist.fused')}
                checked={fused.active}
                onChange={(e) => writeFused({ active: e.target.checked })}
              />
            </td>
          </tr>
          {(['str', 'dex', 'con'] as const).map((key) => (
            <tr key={key}>
              <th>{t(`pf1e.synthesist.${key}`)}</th>
              <td>
                <input
                  type="number"
                  aria-label={t(`pf1e.synthesist.${key}`)}
                  value={fused[key]}
                  onChange={(e) =>
                    writeFused({ [key]: Number(e.target.value) || 0 })
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <th>{t('pf1e.synthesist.costumeHp')}</th>
            <td>
              <input
                type="number"
                min={0}
                aria-label={t('pf1e.synthesist.costumeHp')}
                value={fused.costumeHp}
                onChange={(e) =>
                  writeFused({
                    costumeHp: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </td>
          </tr>
          <tr>
            <th>{t('pf1e.synthesist.pilotMaxHp')}</th>
            <td>
              <DerivedCell
                value={derived.pilotMaxHp}
                overridden={derived.overriddenPaths.includes(
                  'derived.pilotMaxHp',
                )}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>{t('pf1e.synthesist.evolutions')}</strong>
        <button
          type="button"
          onClick={() =>
            writeEidolon((row) => ({
              ...row,
              evolutions: [...(row.evolutions ?? []), createEmptyEvolution()],
            }))
          }
        >
          {t('pf1e.synthesist.addEvolution')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.synthesist.evolutionName')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {evolutions.length === 0 ? (
            <tr>
              <td colSpan={2} className="muted">
                {t('pf1e.synthesist.empty')}
              </td>
            </tr>
          ) : (
            evolutions.map((row, index) => (
              <tr key={row.id}>
                <td className="feat-cell">
                  <CatalogPicker
                    kind="evolution"
                    value={row}
                    catalogLabel={t('pf1e.synthesist.catalog')}
                    nameLabel={t('pf1e.synthesist.evolutionName')}
                    onPick={(next) =>
                      writeEidolon((companion) => {
                        const copy = [...(companion.evolutions ?? [])]
                        copy[index] = next
                        return { ...companion, evolutions: copy }
                      })
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      writeEidolon((companion) => ({
                        ...companion,
                        evolutions: (companion.evolutions ?? []).filter(
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
    </div>
  )
}
