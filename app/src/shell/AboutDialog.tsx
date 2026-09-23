import { useT } from '../shared/i18n'
import { ModalDialog } from '../shared/ui/ModalDialog'

export function AboutDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const t = useT()

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      labelledBy="about-dialog-title"
      className="about-card"
    >
      <h2 id="about-dialog-title">{t('shell.aboutDialogTitle')}</h2>
      <p>{t('shell.aboutDialogBody')}</p>
      <p className="muted">{t('shell.aboutLicense')}</p>
      <div className="about-disclaimer">
        <strong>{t('shell.aboutDisclaimerTitle')}</strong>
        <p>{t('shell.aboutDisclaimer')}</p>
      </div>
      <div className="dialog-actions">
        <button
          type="button"
          className="primary"
          data-autofocus=""
          onClick={onClose}
        >
          {t('shell.aboutClose')}
        </button>
      </div>
    </ModalDialog>
  )
}
