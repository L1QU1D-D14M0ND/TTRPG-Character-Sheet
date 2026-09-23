import { useT } from '../shared/i18n'
import { ModalDialog } from '../shared/ui/ModalDialog'
import type { SystemId } from '../shared/envelope'
import { SYSTEM_IDS, SYSTEM_MODULES } from './registry'

export function NewSheetDialog({
  open,
  onCancel,
  onChoose,
}: {
  open: boolean
  onCancel: () => void
  onChoose: (system: SystemId) => void
}) {
  const t = useT()
  return (
    <ModalDialog open={open} onClose={onCancel} labelledBy="new-sheet-title">
      <h2 id="new-sheet-title">{t('shell.newDialogTitle')}</h2>
      <p>{t('shell.newDialogBody')}</p>
      <div className="dialog-actions">
        {SYSTEM_IDS.map((id, index) => (
          <button
            key={id}
            type="button"
            className={index === 0 ? 'primary' : undefined}
            data-autofocus={index === 0 ? '' : undefined}
            onClick={() => onChoose(id)}
          >
            {t(SYSTEM_MODULES[id].displayNameKey)}
          </button>
        ))}
        <button type="button" onClick={onCancel}>
          {t('shell.cancel')}
        </button>
      </div>
    </ModalDialog>
  )
}
