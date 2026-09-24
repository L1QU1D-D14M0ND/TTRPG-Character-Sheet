import { useId } from 'react'
import type { CharacterDocument } from '../character'
import { signed } from '../../../shared/format'
import { useT } from '../../../shared/i18n'
import { ModalDialog } from '../../../shared/ui/ModalDialog'
import { hpBreakdown, setHitDieRoll } from '../engine/vitals'
import type { SheetUpdate } from './update'

export function HpBreakdownDialog({
  open,
  onClose,
  character,
  update,
}: {
  open: boolean
  onClose: () => void
  character: CharacterDocument
  update: SheetUpdate
}) {
  const t = useT()
  const titleId = useId()
  const conMod = Math.floor((character.abilities.con.score - 10) / 2)
  const breakdown = hpBreakdown(character.vitals, character.classes, conMod)

  function writeRoll(index: number, raw: string) {
    if (raw === '') {
      update((c) => ({
        ...c,
        vitals: {
          ...c.vitals,
          hpRolled: setHitDieRoll(c.vitals.hpRolled, index, null),
        },
      }))
      return
    }
    const rolled = Number(raw)
    if (!Number.isFinite(rolled)) return
    update((c) => ({
      ...c,
      vitals: {
        ...c.vitals,
        hpRolled: setHitDieRoll(c.vitals.hpRolled, index, rolled),
      },
    }))
  }

  function writeFavored(classRowId: string, hp: number) {
    update((c) => ({
      ...c,
      classes: c.classes.map((row) =>
        row.id === classRowId
          ? {
              ...row,
              favored: {
                hp,
                skillRanks: row.favored?.skillRanks ?? 0,
              },
            }
          : row,
      ),
    }))
  }

  function dropExtra(index: number) {
    update((c) => ({
      ...c,
      vitals: {
        ...c.vitals,
        hpRolled: c.vitals.hpRolled.filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="hp-dialog"
    >
      <div className="table-toolbar">
        <h2 id={titleId}>{t('pf1e.hp.title')}</h2>
        <button type="button" data-autofocus="" onClick={onClose}>
          {t('pf1e.hp.close')}
        </button>
      </div>
      <p className="muted">{t('pf1e.hp.help')}</p>
      {breakdown.slots.length === 0 ? (
        <p className="muted">{t('pf1e.hp.noSlots')}</p>
      ) : (
        <table className="sheet-table wide">
          <thead>
            <tr>
              <th>{t('pf1e.hp.hd')}</th>
              <th>{t('pf1e.hp.class')}</th>
              <th>{t('pf1e.hp.die')}</th>
              <th>{t('pf1e.hp.yourRoll')}</th>
              <th>{t('pf1e.hp.con')}</th>
              <th>{t('pf1e.hp.fromThisHd')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {breakdown.slots.map((slot) => (
              <tr key={slot.index}>
                <td>{slot.characterLevel}</td>
                <td>
                  {slot.className} {slot.classLevel}
                </td>
                <td>d{slot.hitDie}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={slot.hitDie}
                    disabled={!slot.editable}
                    value={slot.rolled ?? ''}
                    placeholder={slot.editable ? t('pf1e.hp.rollPlaceholder') : ''}
                    title={
                      slot.editable ? undefined : t('pf1e.hp.enterEarlier')
                    }
                    aria-label={t('pf1e.hp.hdRoll', { level: slot.characterLevel })}
                    onChange={(e) => writeRoll(slot.index, e.target.value)}
                  />
                </td>
                <td>{signed(slot.conMod)}</td>
                <td>{slot.rolled == null ? '—' : slot.fromHd}</td>
                <td>
                  {slot.firstLevel ? (
                    <button
                      type="button"
                      disabled={!slot.editable}
                      onClick={() =>
                        writeRoll(slot.index, String(slot.hitDie))
                      }
                    >
                      {t('pf1e.hp.maxFirst')}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {breakdown.extraRolls.length > 0 ? (
        <>
          <p className="muted">{t('pf1e.hp.extraHelp')}</p>
          <table className="sheet-table wide">
            <thead>
              <tr>
                <th>{t('pf1e.hp.extra')}</th>
                <th>{t('pf1e.hp.roll')}</th>
                <th>{t('pf1e.hp.fromHd')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {breakdown.extraRolls.map((row) => (
                <tr key={row.index}>
                  <td>#{row.index + 1}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={row.rolled}
                      aria-label={t('pf1e.hp.extraRoll', { n: row.index + 1 })}
                      onChange={(e) => writeRoll(row.index, e.target.value)}
                    />
                  </td>
                  <td>{row.fromHd}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => dropExtra(row.index)}
                    >
                      {t('pf1e.common.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
      {character.classes.length > 0 ? (
        <table className="sheet-table">
          <thead>
            <tr>
              <th>{t('pf1e.hp.favoredTitle')}</th>
              <th>{t('pf1e.hp.bonus')}</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.favored.map((line) => (
              <tr key={line.classRowId}>
                <th>{line.className}</th>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={line.hp}
                    aria-label={t('pf1e.hp.favoredAria', { name: line.className })}
                    onChange={(e) =>
                      writeFavored(
                        line.classRowId,
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>{t('pf1e.hp.fromHitDice')}</th>
            <td>{breakdown.fromDice}</td>
          </tr>
          <tr>
            <th>{t('pf1e.hp.fromFavored')}</th>
            <td>{breakdown.fromFavored}</td>
          </tr>
          <tr>
            <th>{t('pf1e.hp.maxHp')}</th>
            <td>
              <strong>{breakdown.maxHp}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </ModalDialog>
  )
}
