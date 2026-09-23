// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../shared/i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { clearDraft, DRAFT_DB, writeDraft } from './draftStore'

function Boom({ fail }: { fail: boolean }): React.ReactElement {
  if (fail) throw new Error('panel exploded')
  return <p>sheet is fine</p>
}

function renderBoundary(fail: boolean) {
  return render(
    <I18nProvider initialLocale="en">
      <ErrorBoundary>
        <Boom fail={fail} />
      </ErrorBoundary>
    </I18nProvider>,
  )
}

afterEach(async () => {
  cleanup()
  vi.restoreAllMocks()
  await clearDraft()
  indexedDB.deleteDatabase(DRAFT_DB)
})

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    renderBoundary(false)
    expect(screen.getByText('sheet is fine')).toBeInTheDocument()
  })

  it('shows a recovery screen with the error message instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderBoundary(true)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/something went wrong/i)
    expect(alert).toHaveTextContent('panel exploded')
    expect(
      screen.getByRole('button', { name: /download last autosave/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /reload the app/i }),
    ).toBeInTheDocument()
  })

  it('downloads the last autosaved draft on request', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await writeDraft('{"system":"pf1e","rescued":true}')

    const clicked: string[] = []
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:draft')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function (this: HTMLAnchorElement) {
        clicked.push(this.download)
      },
    )

    renderBoundary(true)
    fireEvent.click(
      screen.getByRole('button', { name: /download last autosave/i }),
    )

    await waitFor(() => expect(clicked).toEqual(['recovered-character.json']))
    expect(createObjectURL).toHaveBeenCalled()
  })
})
