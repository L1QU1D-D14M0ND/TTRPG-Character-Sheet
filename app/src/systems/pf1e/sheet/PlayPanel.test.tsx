// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { createEmptyCharacter } from '../character'
import { computeCharacter } from '../engine'
import { PlayPanel } from './PlayPanel'
import type { SheetUpdate } from './update'

function PlayHarness() {
  const [character, setCharacter] = useState(createEmptyCharacter)
  const derived = useMemo(() => computeCharacter(character), [character])
  const update: SheetUpdate = (mutator) => {
    setCharacter((current) => mutator(current))
  }
  return (
    <PlayPanel
      character={character}
      derived={derived}
      update={update}
      onOpenHpBreakdown={() => {}}
    />
  )
}

describe('PlayPanel', () => {
  afterEach(cleanup)

  it('adds, edits, and removes resistances in vitals', () => {
    render(
      <I18nProvider>
        <PlayHarness />
      </I18nProvider>,
    )

    expect(
      screen.getByText('No resistances or damage reduction.'),
    ).toBeInTheDocument()

    // Add a resistance (e.g. cold 5)
    fireEvent.click(screen.getByRole('button', { name: 'Add resistance' }))
    const typeInput = screen.getByLabelText('Type') as HTMLInputElement
    const valueInput = screen.getByLabelText('Value') as HTMLInputElement
    const notesInput = screen.getByLabelText('Notes') as HTMLInputElement

    fireEvent.change(typeInput, { target: { value: 'cold' } })
    fireEvent.change(valueInput, { target: { value: '5' } })
    fireEvent.change(notesInput, { target: { value: 'resist cold' } })

    expect(typeInput.value).toBe('cold')
    expect(valueInput.value).toBe('5')
    expect(notesInput.value).toBe('resist cold')

    // Remove the resistance
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(
      screen.getByText('No resistances or damage reduction.'),
    ).toBeInTheDocument()
  })
})
