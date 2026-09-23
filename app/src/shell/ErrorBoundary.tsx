import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useT } from '../shared/i18n'
import { downloadJsonFile } from '../shared/saveLoad'
import { readDraft } from './draftStore'

/**
 * A render crash in any panel used to unmount the whole tree and leave a blank
 * page, with the player's unsaved sheet visible nowhere. The sheet itself is
 * not lost — autosave writes it to IndexedDB — but nothing in a white screen
 * says so or offers it back.
 *
 * So catch the crash, keep the message on screen, and give the two actions
 * that actually recover a session: download the last autosaved draft as JSON,
 * and reload the app (which offers to restore that same draft on boot).
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Character sheet crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <CrashScreen error={this.state.error} />
  }
}

function CrashScreen({ error }: { error: Error }) {
  const t = useT()

  async function onRescue() {
    const draft = await readDraft()
    if (!draft) return
    downloadJsonFile('recovered-character.json', draft)
  }

  return (
    <div className="crash-screen" role="alert">
      <h1>{t('shell.crashTitle')}</h1>
      <p>{t('shell.crashBody')}</p>
      <pre className="crash-detail">{error.message}</pre>
      <div className="dialog-actions">
        <button type="button" className="primary" onClick={() => void onRescue()}>
          {t('shell.crashDownloadDraft')}
        </button>
        <button type="button" onClick={() => window.location.reload()}>
          {t('shell.crashReload')}
        </button>
      </div>
    </div>
  )
}
