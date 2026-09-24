// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../shared/i18n'
import App from './App'
import { clearDraft, DRAFT_DB, readDraft } from './draftStore'

/**
 * The shell owns the parts of the app a player can lose work in: which system
 * is loaded, what autosave has written to IndexedDB, and what Save hands back
 * as a file. Those flows were exercised only through their pieces, so this
 * drives the real App the way a player does.
 */
afterEach(async () => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  await clearDraft()
  indexedDB.deleteDatabase(DRAFT_DB)
})

beforeEach(async () => {
  await clearDraft()
})

function renderApp() {
  return render(
    <I18nProvider initialLocale="en">
      <App />
    </I18nProvider>,
  )
}

/** Wait past the draft gate so the app is on its ready blank sheet. */
async function ready() {
  renderApp()
  await screen.findByRole('button', { name: 'New sheet' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}

describe('shell workflows', () => {
  it('starts on PF2e and switches the loaded system from the New dialog', async () => {
    const user = userEvent.setup()
    await ready()

    expect(screen.getByText(/Pathfinder Second Edition ·/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New sheet' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Pathfinder First Edition',
      }),
    )

    await waitFor(() =>
      expect(screen.getByText(/Pathfinder First Edition ·/)).toBeInTheDocument(),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'New Pathfinder First Edition sheet created.',
    )
  })

  it('autosaves an edited sheet to the draft store', async () => {
    const user = userEvent.setup()
    await ready()

    // A New sheet is a real edit: it must survive a refresh.
    await user.click(screen.getByRole('button', { name: 'New sheet' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Pathfinder First Edition',
      }),
    )

    await waitFor(
      async () => {
        const draft = await readDraft()
        expect(draft).toBeDefined()
        expect(JSON.parse(draft!).system).toBe('pf1e')
      },
      { timeout: 3000 },
    )
  })

  it('stamps the chosen locale onto the autosaved draft', async () => {
    const user = userEvent.setup()
    await ready()

    await user.selectOptions(
      screen.getByLabelText('Language'),
      'es',
    )

    await waitFor(
      async () => {
        const draft = await readDraft()
        expect(draft).toBeDefined()
        expect(JSON.parse(draft!).meta.locale).toBe('es')
      },
      { timeout: 3000 },
    )
    // Chrome follows the same switch.
    expect(
      screen.getByRole('button', { name: 'Nueva hoja' }),
    ).toBeInTheDocument()
  })

  it('reports the failure instead of crashing when a load is not valid JSON', async () => {
    const user = userEvent.setup()
    await ready()

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(
      input,
      new File(['not json at all'], 'broken.json', {
        type: 'application/json',
      }),
    )

    await waitFor(() =>
      expect(screen.getByRole('status')).not.toHaveTextContent(
        'New sheet ready.',
      ),
    )
    // The sheet is still usable after a rejected load.
    expect(screen.getByRole('button', { name: 'Save sheet' })).toBeEnabled()
  })

  it('loads a PF1e file and switches the chrome to it', async () => {
    const user = userEvent.setup()
    await ready()

    const { createEmptyCharacter, serializeCharacter } = await import(
      '../systems/pf1e/character'
    )
    const text = serializeCharacter(createEmptyCharacter())
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(input, new File([text], 'hero.json', {
      type: 'application/json',
    }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Loaded hero.json (pf1e)',
      ),
    )
    expect(screen.getByText(/Pathfinder First Edition ·/)).toBeInTheDocument()
  })

  it('hands Save a complete document and reports it', async () => {
    const user = userEvent.setup()
    // jsdom has no Blob URL plumbing; capture what Save would have written.
    const blobs: Blob[] = []
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: (blob: Blob) => {
        blobs.push(blob)
        return 'blob:stub'
      },
      revokeObjectURL: () => {},
    })
    await ready()

    await user.click(screen.getByRole('button', { name: 'Save sheet' }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Save sheet downloaded (.json).',
      ),
    )
    expect(blobs.length).toBe(1)
    const saved = JSON.parse(await blobs[0]!.text())
    // Save stamps the system discriminator and the active UI locale.
    expect(saved.system).toBe('pf2e')
    expect(saved.meta.locale).toBe('en')
  })

  it('toggles the tools sidebar from the toolbar', async () => {
    const user = userEvent.setup()
    await ready()

    // PF2e ships tools, so a wide viewport starts with the sidebar shown.
    const toolbar = screen.getByRole('banner')
    const toggle = within(toolbar).getByRole('button', {
      name: 'Hide tools',
    })
    await user.click(toggle)

    expect(
      within(toolbar).getByRole('button', { name: 'Show tools' }),
    ).toBeInTheDocument()

    await user.click(
      within(toolbar).getByRole('button', { name: 'Show tools' }),
    )
    expect(
      within(toolbar).getByRole('button', { name: 'Hide tools' }),
    ).toBeInTheDocument()
  })

  it('offers to restore a draft left by a previous session', async () => {
    const user = userEvent.setup()
    const { writeDraft } = await import('./draftStore')
    const { createEmptyCharacter, serializeCharacter } = await import(
      '../systems/pf1e/character'
    )
    await writeDraft(serializeCharacter(createEmptyCharacter()))

    renderApp()

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/Restore last draft/i)
    await user.click(
      within(dialog).getByRole('button', { name: 'Restore draft' }),
    )

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Restored the in-browser draft.',
      ),
    )
    expect(screen.getByText(/Pathfinder First Edition ·/)).toBeInTheDocument()
  })

  it('discards the stored draft when the player declines it', async () => {
    const user = userEvent.setup()
    const { writeDraft } = await import('./draftStore')
    const { createEmptyCharacter, serializeCharacter } = await import(
      '../systems/pf1e/character'
    )
    await writeDraft(serializeCharacter(createEmptyCharacter()))

    renderApp()
    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Discard draft' }),
    )

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Discarded the in-browser draft.',
      ),
    )
    await waitFor(async () => expect(await readDraft()).toBeUndefined())
  })
})
