import { useT } from '../../../shared/i18n'
import {
  masterworkChecked,
  setEnhancement,
  setMasterwork,
  type MagicOverlayFields,
} from './magicOverlay'

const ENHANCEMENT_BONUSES = [1, 2, 3, 4, 5] as const

export function MagicOverlayControls<T extends MagicOverlayFields>({
  slot,
  onChange,
  masterworkAriaLabel,
  enhancementAriaLabel,
}: {
  slot: T
  onChange: (next: T) => void
  masterworkAriaLabel?: string
  enhancementAriaLabel?: string
}) {
  const t = useT()
  return (
    <div className="magic-overlay-controls">
      <label>
        <input
          type="checkbox"
          aria-label={masterworkAriaLabel ?? t('pf1e.inventory.masterwork')}
          checked={masterworkChecked(slot)}
          onChange={(e) => onChange(setMasterwork(slot, e.target.checked))}
        />
        {t('pf1e.inventory.masterwork')}
      </label>
      <label>
        {t('pf1e.inventory.enhancement')}:
        <select
          aria-label={enhancementAriaLabel ?? t('pf1e.inventory.enhancement')}
          value={slot.enhancementBonus ?? 0}
          onChange={(e) =>
            onChange(setEnhancement(slot, Number(e.target.value) || 0))
          }
        >
          <option value={0}>{t('pf1e.inventory.noEnhancement')}</option>
          {ENHANCEMENT_BONUSES.map((bonus) => (
            <option key={bonus} value={bonus}>
              +{bonus}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
