// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider, type Locale } from '../../../shared/i18n'
import { createEmptyFeat } from '../character'
import type { FeatEntry, ItemEntry } from '../character/types'
import { createEmptyItem } from '../character/createRows'
import { CatalogPicker } from './CatalogPicker'

afterEach(cleanup)

function FeatHarness({ onChange }: { onChange?: (row: FeatEntry) => void }) {
  const [row, setRow] = useState(createEmptyFeat)
  return (
    <CatalogPicker
      kind="feat"
      value={row}
      catalogLabel="CRB feat"
      nameLabel="Feat name"
      onPick={(next) => {
        setRow(next)
        onChange?.(next)
      }}
    />
  )
}

function ItemHarness({ onChange }: { onChange?: (row: ItemEntry) => void }) {
  const [row, setRow] = useState(createEmptyItem)
  return (
    <CatalogPicker
      kind="item"
      value={row}
      catalogLabel="CRB item"
      nameLabel="Item name"
      onPick={(next) => {
        setRow(next)
        onChange?.(next)
      }}
    />
  )
}

// The search label is itself localized, so tests ask for it the same way
// the player's screen reader would rather than hard-coding English.
const SEARCH_LABEL: Record<Locale, string> = {
  en: 'Search catalog',
  es: 'Buscar catálogo',
}

const CUSTOM_LABEL: Record<Locale, string> = {
  en: 'Custom',
  es: 'Personalizado',
}

function open(label = 'CRB feat') {
  fireEvent.click(screen.getByLabelText(label))
  return screen.getByRole('dialog')
}

function renderAt(locale: Locale, ui: React.ReactElement) {
  return render(<I18nProvider initialLocale={locale}>{ui}</I18nProvider>)
}

function search(dialog: HTMLElement, locale: Locale, text: string) {
  fireEvent.change(within(dialog).getByLabelText(SEARCH_LABEL[locale]), {
    target: { value: text },
  })
}

describe('catalog picker in a localized UI (Phase 5.2)', () => {
  it('labels rows in English when the UI is English', () => {
    const LOCALE = 'en' as const
    renderAt(LOCALE, <FeatHarness />)
    const dialog = open()
    search(dialog, LOCALE, 'Power Attack')
    expect(
      within(dialog).getByRole('option', { name: /Power Attack/ }),
    ).toBeInTheDocument()
    expect(within(dialog).queryByText('Ataque poderoso')).toBeNull()
  })

  it('labels rows in Spanish when the UI is Spanish', () => {
    const LOCALE = 'es' as const
    renderAt(LOCALE, <FeatHarness />)
    const dialog = open()
    search(dialog, LOCALE, 'Ataque poderoso')
    const option = within(dialog).getByRole('option', {
      name: /Ataque poderoso/,
    })
    expect(option).toBeInTheDocument()
    // The English name stays on the row so the player can still recognise it.
    expect(within(option).getByText('Power Attack')).toBeInTheDocument()
  })

  it('still finds a row by its English name with the Spanish UI on', () => {
    const LOCALE = 'es' as const
    renderAt(LOCALE, <FeatHarness />)
    const dialog = open()
    search(dialog, LOCALE, 'Power Attack')
    expect(
      within(dialog).getByRole('option', { name: /Ataque poderoso/ }),
    ).toBeInTheDocument()
  })

  it('finds an accented row typed without accents', () => {
    const LOCALE = 'es' as const
    renderAt(LOCALE, <FeatHarness />)
    const dialog = open()
    search(dialog, LOCALE, 'punteria mortal')
    expect(
      within(dialog).getByRole('option', { name: /Puntería mortal/ }),
    ).toBeInTheDocument()
  })

  it('writes the English pack name to the document, not the translation', () => {
    // The saved character must read the same on a machine set to English.
    let picked: ItemEntry | null = null
    const LOCALE = 'es' as const
    renderAt(LOCALE, <ItemHarness onChange={(row) => (picked = row)} />)
    const dialog = open('CRB item')
    search(dialog, LOCALE, 'Espada larga')
    fireEvent.click(
      within(dialog).getByRole('option', { name: 'Espada larga' }),
    )
    expect(picked!.item.id).toBe('weapon.longsword')
    expect(picked!.item.name).toBe('Longsword')
  })

  it('shows the picked row on the trigger in the active locale', () => {
    const LOCALE = 'es' as const
    renderAt(LOCALE, <ItemHarness />)
    const dialog = open('CRB item')
    search(dialog, LOCALE, 'Espada larga')
    fireEvent.click(
      within(dialog).getByRole('option', { name: 'Espada larga' }),
    )
    expect(screen.getByLabelText('CRB item')).toHaveTextContent('Espada larga')
    // ...while the editable name field keeps the document's own value.
    expect(screen.getByLabelText('Item name')).toHaveValue('Longsword')
  })

  it('leaves a custom row the player typed alone', () => {
    renderAt('es', <ItemHarness />)
    const field = screen.getByLabelText('Item name')
    fireEvent.change(field, { target: { value: 'Hacha casera' } })
    expect(field).toHaveValue('Hacha casera')
    // No catalog id, so the trigger keeps showing the custom label.
    expect(screen.getByLabelText('CRB item')).toHaveTextContent(CUSTOM_LABEL.es)
  })
})
