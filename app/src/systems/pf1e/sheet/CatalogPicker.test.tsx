// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { createEmptyFeat } from '../character'
import type { FeatEntry, SpellListEntry } from '../character/types'
import { createEmptySpellListEntry } from '../character/createRows'
import { CatalogPicker } from './CatalogPicker'

function FeatHarness({ initial }: { initial?: FeatEntry }) {
  const [row, setRow] = useState(() => initial ?? createEmptyFeat())
  return (
    <CatalogPicker
      kind="feat"
      value={row}
      catalogLabel="CRB feat"
      nameLabel="Feat name"
      onPick={setRow}
    />
  )
}

function SpellHarness() {
  const [row, setRow] = useState<SpellListEntry>(() =>
    createEmptySpellListEntry(),
  )
  return (
    <CatalogPicker
      kind="spell"
      value={row}
      catalogLabel="CRB spell"
      nameLabel="Spell name"
      onPick={setRow}
    />
  )
}

describe('CatalogPicker', () => {
  afterEach(cleanup)

  it('stamps a catalog feat on pick and keeps the name editable', () => {
    render(
      <I18nProvider>
        <FeatHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByLabelText('CRB feat'))
    fireEvent.click(screen.getByRole('option', { name: 'Power Attack' }))
    const name = screen.getByLabelText('Feat name') as HTMLInputElement
    expect(name.value).toBe('Power Attack')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.change(name, { target: { value: 'PA' } })
    expect(name.value).toBe('PA')
  })

  it('Custom clears the catalog id', () => {
    render(
      <I18nProvider>
        <FeatHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByLabelText('CRB feat'))
    fireEvent.click(screen.getByRole('option', { name: 'Power Attack' }))
    fireEvent.click(screen.getByLabelText('CRB feat'))
    fireEvent.click(screen.getByRole('option', { name: 'Custom' }))
    expect(screen.getByLabelText('CRB feat')).toHaveTextContent('Custom')
    expect(
      (screen.getByLabelText('Feat name') as HTMLInputElement).value,
    ).toBe('Power Attack')
  })

  it('filters the spell list as the search field is typed', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider>
        <SpellHarness />
      </I18nProvider>,
    )
    await user.click(screen.getByLabelText('CRB spell'))
    const search = screen.getByLabelText('Search catalog')
    await user.type(search, 'fireb')
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('option', { name: 'Fireball' }),
    ).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('option', { name: 'Magic Missile' }),
    ).not.toBeInTheDocument()
  })

  it('closes on Escape', () => {
    render(
      <I18nProvider>
        <FeatHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByLabelText('CRB feat'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
