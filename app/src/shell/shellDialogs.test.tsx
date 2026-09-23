// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../shared/i18n'
import App from './App'
import { clearDraft, DRAFT_DB } from './draftStore'

/**
 * End-to-end through the real shell, not the dialog in isolation: the About
 * button is a live toolbar control, so this is the path a keyboard player
 * actually takes and the one that used to strand focus behind the modal.
 */
afterEach(async () => {
  cleanup()
  await clearDraft()
  indexedDB.deleteDatabase(DRAFT_DB)
})

function renderApp() {
  return render(
    <I18nProvider initialLocale="en">
      <App />
    </I18nProvider>,
  )
}

describe('shell dialogs in the real app', () => {
  it('opens About from the toolbar, traps focus, and restores it on Escape', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    renderApp()

    const aboutButton = await screen.findByRole('button', { name: 'About' })
    expect(screen.queryByRole('dialog')).toBeNull()

    await user.click(aboutButton)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/not affiliated with/i)
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Close' }),
      ),
    )

    // The only focusable control in the dialog keeps focus across Tab.
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Close' }),
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(aboutButton)
  })

  it('closes About with its own button and still restores focus', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    renderApp()

    const aboutButton = await screen.findByRole('button', { name: 'About' })
    await user.click(aboutButton)
    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(aboutButton)
  })
})
