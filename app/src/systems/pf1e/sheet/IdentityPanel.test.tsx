// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { createEmptyCharacter, createEmptyClass } from '../character'
import { computeCharacter } from '../engine'
import { applyClassProgression } from '../content'
import { IdentityPanel } from './IdentityPanel'
import type { SheetUpdate } from './update'

function IdentityHarness({ initialWizard = false }: { initialWizard?: boolean }) {
  const [character, setCharacter] = useState(() => {
    const c = createEmptyCharacter()
    if (initialWizard) {
      const wizard = applyClassProgression(createEmptyClass(), 'class.wizard')
      wizard.levels = 7
      c.classes = [wizard]
    }
    return c
  })
  const derived = useMemo(() => computeCharacter(character), [character])
  const update: SheetUpdate = (mutator) => {
    setCharacter((current) => mutator(current))
  }
  return (
    <IdentityPanel character={character} derived={derived} update={update} />
  )
}

describe('IdentityPanel', () => {
  afterEach(cleanup)

  it('allows picking arcane school and opposition schools for Wizard', () => {
    render(
      <I18nProvider>
        <IdentityHarness initialWizard={true} />
      </I18nProvider>,
    )

    const schoolSelect = screen.getByLabelText('Arcane school') as HTMLSelectElement
    expect(schoolSelect.value).toBe('universalist')

    // Change to transmutation
    fireEvent.change(schoolSelect, { target: { value: 'transmutation' } })
    expect(schoolSelect.value).toBe('transmutation')

    // Opposition school checkboxes appear
    const necroCheck = screen.getByLabelText('Opposition school necromancy') as HTMLInputElement
    const enchCheck = screen.getByLabelText('Opposition school enchantment') as HTMLInputElement
    expect(necroCheck.checked).toBe(false)
    expect(enchCheck.checked).toBe(false)

    fireEvent.click(necroCheck)
    expect(necroCheck.checked).toBe(true)

    fireEvent.click(enchCheck)
    expect(enchCheck.checked).toBe(true)
  })

  it('adds and edits speeds and senses in vitals', () => {
    render(
      <I18nProvider>
        <IdentityHarness />
      </I18nProvider>,
    )

    // Initial land speed 30 is present from createEmptyCharacter
    const initialKind = screen.getByLabelText('Kind') as HTMLInputElement
    const initialFeet = screen.getByLabelText('Feet') as HTMLInputElement
    expect(initialKind.value).toBe('land')
    expect(initialFeet.value).toBe('30')

    // Add a second speed (fly 60)
    fireEvent.click(screen.getByRole('button', { name: 'Add speed' }))
    const kindInputs = screen.getAllByLabelText('Kind') as HTMLInputElement[]
    const feetInputs = screen.getAllByLabelText('Feet') as HTMLInputElement[]
    fireEvent.change(kindInputs[1], { target: { value: 'fly' } })
    fireEvent.change(feetInputs[1], { target: { value: '60' } })
    expect(kindInputs[1].value).toBe('fly')
    expect(feetInputs[1].value).toBe('60')

    // Add sense
    fireEvent.click(screen.getByRole('button', { name: 'Add sense' }))
    const senseNameInput = screen.getByLabelText('Name') as HTMLInputElement
    const rangeInput = screen.getByLabelText('Range (ft)') as HTMLInputElement
    fireEvent.change(senseNameInput, { target: { value: 'darkvision' } })
    fireEvent.change(rangeInput, { target: { value: '60' } })
    expect(senseNameInput.value).toBe('darkvision')
    expect(rangeInput.value).toBe('60')
  })
})
