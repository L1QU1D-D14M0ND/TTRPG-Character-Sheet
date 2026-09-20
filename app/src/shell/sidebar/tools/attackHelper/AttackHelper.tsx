import { useMemo, useState } from 'react'
import { useT } from '../../../../shared/i18n'
import type {
  AttackHelperOption,
  AttackHelperOutput,
  AttackHelperToggle,
} from './types'

export interface AttackHelperProps {
  options: AttackHelperOption[]
  getToggles: (attackId: string) => AttackHelperToggle[]
  compute: (attackId: string, activeToggles: Set<string>) => AttackHelperOutput | null
}

export function AttackHelper({ options, getToggles, compute }: AttackHelperProps) {
  const t = useT()
  const [selectedAttackId, setSelectedAttackId] = useState<string>(() => options[0]?.id ?? '')
  const [activeToggleIds, setActiveToggleIds] = useState<Set<string>>(new Set())

  // If selected attack is no longer valid, default to first
  const currentAttackId = options.some((o) => o.id === selectedAttackId)
    ? selectedAttackId
    : (options[0]?.id ?? '')

  const toggles = useMemo(() => {
    if (!currentAttackId) return []
    return getToggles(currentAttackId)
  }, [currentAttackId, getToggles])

  const output = useMemo(() => {
    if (!currentAttackId) return null
    return compute(currentAttackId, activeToggleIds)
  }, [currentAttackId, activeToggleIds, compute])

  function handleToggle(id: string) {
    setActiveToggleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (options.length === 0) {
    return (
      <div className="attack-helper-empty">
        <p className="muted">{t('shell.attackHelper.noAttacks')}</p>
      </div>
    )
  }

  return (
    <div className="attack-helper-container">
      <div className="attack-helper-field">
        <label htmlFor="attack-helper-select">
          <strong>{t('shell.attackHelper.selectWeapon')}</strong>
        </label>
        <select
          id="attack-helper-select"
          value={currentAttackId}
          onChange={(e) => {
            setSelectedAttackId(e.target.value)
            setActiveToggleIds(new Set())
          }}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} ({opt.type})
            </option>
          ))}
        </select>
      </div>

      {toggles.length > 0 && (
        <fieldset className="attack-helper-toggles">
          <legend><strong>{t('shell.attackHelper.modifiersAndFeats')}</strong></legend>
          {toggles.map((tog) => {
            const isChecked = activeToggleIds.has(tog.id)
            return (
              <label key={tog.id} className="attack-helper-toggle-label">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(tog.id)}
                />
                <span>{t(tog.labelKey) || tog.labelFallback}</span>
                {tog.description && <span className="muted toggle-desc"> ({tog.description})</span>}
              </label>
            )
          })}
        </fieldset>
      )}

      {output && (
        <div className="attack-helper-results">
          <div className="attack-helper-card math-card">
            <h4>{t('shell.attackHelper.toHitAndDamage')}</h4>
            <div className="math-row main-attack">
              <span className="stat-label">{t('shell.attackHelper.toHit')}:</span>
              <span className="stat-value highlight">{output.attackBonusString}</span>
            </div>

            {output.iterativeBonusStrings.length > 1 && (
              <div className="math-row iteratives">
                <span className="stat-label">{t('shell.attackHelper.sequence')}:</span>
                <span className="stat-value">{output.iterativeBonusStrings.join(' / ')}</span>
              </div>
            )}

            <div className="math-row damage">
              <span className="stat-label">{t('shell.attackHelper.damage')}:</span>
              <span className="stat-value highlight">{output.damageExpression}</span>
            </div>

            <div className="math-row crit">
              <span className="stat-label">{t('shell.attackHelper.crit')}:</span>
              <span className="stat-value">{output.critHint}</span>
            </div>

            <div className="math-breakdown muted">
              <small>{output.damageBreakdown}</small>
            </div>
          </div>

          {(output.triggers.length > 0 || output.inflicts.length > 0) && (
            <div className="attack-helper-card mechanics-card">
              <h4>{t('shell.attackHelper.mechanics')}</h4>

              {output.triggers.length > 0 && (
                <div className="mechanic-section triggers">
                  <strong>{t('shell.attackHelper.triggers')}:</strong>
                  <ul>
                    {output.triggers.map((trig, i) => (
                      <li key={i} className="trigger-item warning">{trig}</li>
                    ))}
                  </ul>
                </div>
              )}

              {output.inflicts.length > 0 && (
                <div className="mechanic-section inflicts">
                  <strong>{t('shell.attackHelper.inflicts')}:</strong>
                  <ul>
                    {output.inflicts.map((inf, i) => (
                      <li key={i} className="inflict-item">{inf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="attack-helper-notice muted">
            <small>🎲 {t('shell.attackHelper.tableDiceReminder')}</small>
          </div>
        </div>
      )}
    </div>
  )
}
