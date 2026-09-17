// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { pickCatalog } from '../../../test/pickCatalog'
import { createEmptyCharacter } from '../character'
import { computeCharacter } from '../engine'
import { InventoryPanel } from './InventoryPanel'
import type { SheetUpdate } from './update'

function InventoryHarness() {
  const [character, setCharacter] = useState(createEmptyCharacter)
  const derived = useMemo(() => computeCharacter(character), [character])
  const update: SheetUpdate = (mutator) => {
    setCharacter((current) => mutator(current))
  }
  return (
    <InventoryPanel character={character} derived={derived} update={update} />
  )
}

describe('InventoryPanel weapon properties', () => {
  afterEach(cleanup)

  it('stamps a single brace tag and allows adding a second', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Spear')
    expect(screen.getByText('brace')).toBeInTheDocument()
    expect(screen.queryByText('reach')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Add property'), {
      target: { value: 'trip' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add property' }))
    expect(screen.getByText('brace')).toBeInTheDocument()
    expect(screen.getByText('trip')).toBeInTheDocument()
  })

  it('stamps trip and monk together on a kama', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Kama')
    expect(screen.getByText('trip')).toBeInTheDocument()
    expect(screen.getByText('monk')).toBeInTheDocument()
    expect(screen.queryByText('reach')).not.toBeInTheDocument()
    expect(screen.queryByText('brace')).not.toBeInTheDocument()
  })

  it('stamps reach and trip together on a guisarme', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Guisarme')
    expect(screen.getByText('reach')).toBeInTheDocument()
    expect(screen.getByText('trip')).toBeInTheDocument()
  })

  it('stamps disarm and monk together on a nunchaku', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Nunchaku')
    expect(screen.getByText('disarm')).toBeInTheDocument()
    expect(screen.getByText('monk')).toBeInTheDocument()
    expect(screen.queryByText('reach')).not.toBeInTheDocument()
    expect(screen.queryByText('trip')).not.toBeInTheDocument()
  })

  it('stamps a single monk tag on a siangham', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Siangham')
    expect(screen.getByText('monk')).toBeInTheDocument()
    expect(screen.queryByText('trip')).not.toBeInTheDocument()
    expect(screen.queryByText('disarm')).not.toBeInTheDocument()
  })

  it('stamps reach, trip, disarm, and nonlethal together on a whip', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Whip')
    expect(screen.getByText('reach')).toBeInTheDocument()
    expect(screen.getByText('trip')).toBeInTheDocument()
    expect(screen.getByText('disarm')).toBeInTheDocument()
    expect(screen.getByText('nonlethal')).toBeInTheDocument()
  })

  it('stamps a single double tag on a two-bladed sword', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Two-bladed sword')
    expect(screen.getByText('double')).toBeInTheDocument()
    expect(screen.queryByText('trip')).not.toBeInTheDocument()
    expect(screen.queryByText('brace')).not.toBeInTheDocument()
  })

  it('stamps monk and double together on a quarterstaff', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Quarterstaff')
    expect(screen.getByText('monk')).toBeInTheDocument()
    expect(screen.getByText('double')).toBeInTheDocument()
  })

  it('stamps a single nonlethal tag on a sap', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Sap')
    expect(screen.getByText('nonlethal')).toBeInTheDocument()
    expect(screen.queryByText('trip')).not.toBeInTheDocument()
    expect(screen.queryByText('reach')).not.toBeInTheDocument()
  })

  it('stamps reach and brace together on a longspear', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Longspear')
    expect(screen.getByText('reach')).toBeInTheDocument()
    expect(screen.getByText('brace')).toBeInTheDocument()
  })

  it('can drop back to a single tag', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Spear')
    fireEvent.change(screen.getByLabelText('Add property'), {
      target: { value: 'flaming' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add property' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove property brace' }))
    expect(screen.queryByText('brace')).not.toBeInTheDocument()
    expect(screen.getByText('flaming')).toBeInTheDocument()
  })

  it('allows toggling masterwork and selecting enhancement on a weapon', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Longsword')

    const mwkCheckbox = screen.getByLabelText('Masterwork') as HTMLInputElement
    expect(mwkCheckbox.checked).toBe(false)
    fireEvent.click(mwkCheckbox)
    expect(mwkCheckbox.checked).toBe(true)
    expect(screen.getByText('MWK')).toBeInTheDocument()

    const enhancementSelect = screen.getByLabelText('Enhancement') as HTMLSelectElement
    fireEvent.change(enhancementSelect, { target: { value: '2' } })
    expect(enhancementSelect.value).toBe('2')
    expect(screen.getByText('+2', { selector: '.magic-badge' })).toBeInTheDocument()
    expect(mwkCheckbox.checked).toBe(true)
  })

  it('allows adding properties via the special ability select', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Longsword')

    const selectAbility = screen.getByLabelText('Add special ability…')
    fireEvent.change(selectAbility, { target: { value: 'flaming' } })
    expect(screen.getByText('flaming')).toBeInTheDocument()
  })

  it('supports magic overlay and properties on armor and shields', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Full plate')

    const enhancementSelect = screen.getByLabelText('Enhancement')
    fireEvent.change(enhancementSelect, { target: { value: '1' } })
    expect(screen.getByText('+1', { selector: '.magic-badge' })).toBeInTheDocument()

    const selectAbility = screen.getByLabelText('Add special ability…')
    fireEvent.change(selectAbility, { target: { value: 'fortification-light' } })
    expect(screen.getByText('fortification-light')).toBeInTheDocument()
  })

  it('supports second head enhancement and masterwork on double weapons', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Two-bladed sword')

    const secondHeadMwk = screen.getByLabelText('Second head masterwork') as HTMLInputElement
    expect(secondHeadMwk.checked).toBe(false)
    fireEvent.click(secondHeadMwk)
    expect(secondHeadMwk.checked).toBe(true)

    const secondHeadEnhancement = screen.getByLabelText('Second head enhancement') as HTMLSelectElement
    fireEvent.change(secondHeadEnhancement, { target: { value: '1' } })
    expect(secondHeadEnhancement.value).toBe('1')
  })

  it('feeds the base price field into the suggested market price', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    pickCatalog('CRB item', 'Longsword')
    fireEvent.change(screen.getByLabelText('Enhancement'), {
      target: { value: '2' },
    })

    // Catalog rows carry no price, so the overlay alone is 300 mwk + 2^2 * 2000.
    expect(
      screen.getByText('Suggested market price: 8,300 gp'),
    ).toBeInTheDocument()

    const price = screen.getByLabelText('Base price (gp)')
    fireEvent.change(price, { target: { value: '15' } })

    // CRB +2 longsword: 15 base + 300 mwk + 8,000 enhancement.
    expect(
      screen.getByText('Suggested market price: 8,315 gp'),
    ).toBeInTheDocument()

    fireEvent.change(price, { target: { value: '' } })
    expect(
      screen.getByText('Suggested market price: 8,300 gp'),
    ).toBeInTheDocument()
  })

  it('stamps catalog picks onto only the targeted item row', () => {
    render(
      <I18nProvider>
        <InventoryHarness />
      </I18nProvider>,
    )
    const add = screen.getByRole('button', { name: 'Add item' })
    fireEvent.click(add)
    fireEvent.click(add)
    const rows = screen.getAllByLabelText('Item name').map((el) => el.closest('tr')!)
    pickCatalog('CRB item', 'Spear', rows[0])
    pickCatalog('CRB item', 'Kama', rows[1])
    expect(within(rows[0]).getByText('brace')).toBeInTheDocument()
    expect(within(rows[0]).queryByText('trip')).not.toBeInTheDocument()
    expect(within(rows[1]).getByText('trip')).toBeInTheDocument()
    expect(within(rows[1]).getByText('monk')).toBeInTheDocument()
    expect(within(rows[1]).queryByText('brace')).not.toBeInTheDocument()
  })
})

