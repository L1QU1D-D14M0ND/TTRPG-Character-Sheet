import { useEffect } from 'react'
import { useT } from '../shared/i18n'

export function AboutDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const t = useT()

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog-card about-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="about-dialog-title">{t('shell.aboutDialogTitle')}</h2>
        <p>{t('shell.aboutDialogBody')}</p>
        <p className="muted">{t('shell.aboutLicense')}</p>
        <div className="about-disclaimer">
          <strong>{t('shell.aboutDisclaimerTitle')}</strong>
          <p>{t('shell.aboutDisclaimer')}</p>
        </div>
        <div className="dialog-actions">
          <button type="button" className="primary" onClick={onClose}>
            {t('shell.aboutClose')}
          </button>
        </div>
      </div>
    </div>
  )
}
