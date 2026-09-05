// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { createEmptyCharacter } from '../character'
import { FeatsPanel } from './FeatsPanel'
import type { SheetUpdate } from './update'

function Harness() {
  const [character, setCharacter] = useState(createEmptyCharacter)
  const update: SheetUpdate = (mutator) => {
    setCharacter((current) => mutator(current))
  }
  return <FeatsPanel character={character} update={update} />
}

/** PF2e panels are not localized yet and their inputs carry no aria-labels,
 *  so rows are addressed positionally through their table. */
function rowsOf(table: HTMLElement): HTMLElement[] {
  return Array.from(table.querySelectorAll('tbody tr')) as HTMLElement[]
}

function textInputs(row: HTMLElement): HTMLInputElement[] {
  return Array.from(
    row.querySelectorAll('input:not([type=number])'),
  ) as HTMLInputElement[]
}

describe('PF2e FeatsPanel row editing', () => {
  afterEach(cleanup)

  it('edits only the targeted feat row', () => {
    render(<Harness />)
    const add = screen.getByRole('button', { name: 'Add feat' })
    fireEvent.click(add)
    fireEvent.click(add)
    fireEvent.click(add)

    const table = screen.getAllByRole('table')[0]
    const rows = rowsOf(table)
    expect(rows).toHaveLength(3)

    fireEvent.change(textInputs(rows[0])[0], { target: { value: 'A' } })
    fireEvent.change(textInputs(rows[1])[0], { target: { value: 'B' } })
    fireEvent.change(textInputs(rows[2])[0], { target: { value: 'C' } })

    const after = rowsOf(screen.getAllByRole('table')[0])
    expect(after.map((r) => textInputs(r)[0].value)).toEqual(['A', 'B', 'C'])
  })

  it('removes the clicked feat and leaves siblings intact', () => {
    render(<Harness />)
    const add = screen.getByRole('button', { name: 'Add feat' })
    fireEvent.click(add)
    fireEvent.click(add)
    fireEvent.click(add)

    let rows = rowsOf(screen.getAllByRole('table')[0])
    fireEvent.change(textInputs(rows[0])[0], { target: { value: 'A' } })
    fireEvent.change(textInputs(rows[1])[0], { target: { value: 'B' } })
    fireEvent.change(textInputs(rows[2])[0], { target: { value: 'C' } })

    rows = rowsOf(screen.getAllByRole('table')[0])
    fireEvent.click(within(rows[1]).getByRole('button', { name: 'Remove' }))

    const after = rowsOf(screen.getAllByRole('table')[0])
    expect(after.map((r) => textInputs(r)[0].value)).toEqual(['A', 'C'])
  })

  it('edits features without disturbing feats', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Add feat' }))
    fireEvent.change(textInputs(rowsOf(screen.getAllByRole('table')[0])[0])[0], {
      target: { value: 'Untouched' },
    })

    const addFeature = screen.getByRole('button', { name: 'Add feature' })
    fireEvent.click(addFeature)
    fireEvent.click(addFeature)

    const featureRows = rowsOf(screen.getAllByRole('table')[1])
    fireEvent.change(textInputs(featureRows[0])[0], { target: { value: 'F1' } })
    fireEvent.change(textInputs(featureRows[1])[0], { target: { value: 'F2' } })

    fireEvent.click(
      within(rowsOf(screen.getAllByRole('table')[1])[0]).getByRole('button', {
        name: 'Remove',
      }),
    )

    expect(
      rowsOf(screen.getAllByRole('table')[1]).map(
        (r) => textInputs(r)[0].value,
      ),
    ).toEqual(['F2'])
    expect(
      textInputs(rowsOf(screen.getAllByRole('table')[0])[0])[0].value,
    ).toBe('Untouched')
  })

  it('removes the clicked action and no other', () => {
    render(<Harness />)
    const add = screen.getByRole('button', { name: 'Add action' })
    fireEvent.click(add)
    fireEvent.click(add)

    const actionsTable = screen.getAllByRole('table')[2]
    const rows = rowsOf(actionsTable)
    fireEvent.change(textInputs(rows[0])[0], { target: { value: 'Act1' } })
    fireEvent.change(textInputs(rows[1])[0], { target: { value: 'Act2' } })

    fireEvent.click(
      within(rowsOf(screen.getAllByRole('table')[2])[0]).getByRole('button', {
        name: 'Remove',
      }),
    )

    expect(
      rowsOf(screen.getAllByRole('table')[2]).map(
        (r) => textInputs(r)[0].value,
      ),
    ).toEqual(['Act2'])
  })
})
