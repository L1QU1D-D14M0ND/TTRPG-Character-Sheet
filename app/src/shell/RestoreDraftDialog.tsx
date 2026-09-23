import { useT } from '../shared/i18n'
import { ModalDialog } from '../shared/ui/ModalDialog'

export function RestoreDraftDialog({
  open,
  onRestore,
  onDiscard,
}: {
  open: boolean
  onRestore: () => void
  onDiscard: () => void
}) {
  const t = useT()
  return (
    <ModalDialog
      open={open}
      onClose={onDiscard}
      labelledBy="restore-draft-title"
    >
      <h2 id="restore-draft-title">{t('shell.draftRestoreTitle')}</h2>
      <p>{t('shell.draftRestoreBody')}</p>
      <div className="dialog-actions">
        <button
          type="button"
          className="primary"
          data-autofocus=""
          onClick={onRestore}
        >
          {t('shell.draftRestore')}
        </button>
        <button type="button" onClick={onDiscard}>
          {t('shell.draftDiscard')}
        </button>
      </div>
    </ModalDialog>
  )
}
