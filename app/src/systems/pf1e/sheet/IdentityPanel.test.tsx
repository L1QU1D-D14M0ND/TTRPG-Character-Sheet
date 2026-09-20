// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { pickCatalog } from '../../../test/pickCatalog'
import { createEmptyCharacter, createEmptyClass, type CharacterDocument } from '../character'
import { computeCharacter } from '../engine'
import { applyClassProgression } from '../content'
import { IdentityPanel } from './IdentityPanel'
import type { SheetUpdate } from './update'

function IdentityHarness({
  initialWizard = false,
  onCharacterChange,
}: {
  initialWizard?: boolean
  onCharacterChange?: (c: CharacterDocument) => void
}) {
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
    setCharacter((current) => {
      const next = mutator(current)
      onCharacterChange?.(next)
      return next
    })
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

  it('stamps catalog race and size on pick and keeps name editable', () => {
    render(
      <I18nProvider>
        <IdentityHarness />
      </I18nProvider>,
    )

    pickCatalog('CRB race', 'Elf')
    expect(screen.getByLabelText('Race name')).toHaveValue('Elf')
    expect(screen.getByLabelText('Size')).toHaveValue('medium')

    pickCatalog('CRB race', 'Halfling')
    expect(screen.getByLabelText('Race name')).toHaveValue('Halfling')
    expect(screen.getByLabelText('Size')).toHaveValue('small')

    fireEvent.change(screen.getByLabelText('Race name'), {
      target: { value: 'Ghostwise Halfling' },
    })
    expect(screen.getByLabelText('Race name')).toHaveValue('Ghostwise Halfling')
    expect(screen.getByLabelText('CRB race')).toHaveTextContent('Halfling')
  })

  it('stamps class progression and class skills on pick', () => {
    let doc: CharacterDocument | undefined
    render(
      <I18nProvider>
        <IdentityHarness onCharacterChange={(c) => { doc = c }} />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add class' }))
    const row = screen.getByLabelText('Class name').closest('tr')!

    pickCatalog('Class catalog', 'Fighter', row)
    expect(within(row).getByLabelText('Class name')).toHaveValue('Fighter')
    expect(within(row).getByLabelText('HD')).toHaveValue(10)
    expect(within(row).getByLabelText('BAB')).toHaveValue('full')
    expect(within(row).getByLabelText('Fort')).toHaveValue('good')
    expect(within(row).getByLabelText('Ref')).toHaveValue('poor')
    expect(doc?.skills.find((s) => s.key === 'climb')?.classSkill).toBe(true)
    expect(doc?.skills.find((s) => s.key === 'spellcraft')?.classSkill).toBe(false)

    pickCatalog('Class catalog', 'Summoner', row)
    expect(within(row).getByLabelText('Class name')).toHaveValue('Summoner')
    expect(within(row).getByLabelText('HD')).toHaveValue(8)
    expect(within(row).getByLabelText('BAB')).toHaveValue('threeQuarter')
    expect(within(row).getByLabelText('Will')).toHaveValue('good')
    expect(doc?.skills.find((s) => s.key === 'climb')?.classSkill).toBe(false)
    expect(doc?.skills.find((s) => s.key === 'spellcraft')?.classSkill).toBe(true)
  })

  it('isolates catalog class picks across multiple class rows', () => {
    render(
      <I18nProvider>
        <IdentityHarness />
      </I18nProvider>,
    )

    const addClass = screen.getByRole('button', { name: 'Add class' })
    fireEvent.click(addClass)
    fireEvent.click(addClass)

    const rows = screen
      .getAllByLabelText('Class name')
      .map((el) => el.closest('tr')!)

    pickCatalog('Class catalog', 'Fighter', rows[0])
    pickCatalog('Class catalog', 'Wizard', rows[1])

    expect(within(rows[0]).getByLabelText('Class name')).toHaveValue('Fighter')
    expect(within(rows[0]).getByLabelText('HD')).toHaveValue(10)
    expect(within(rows[1]).getByLabelText('Class name')).toHaveValue('Wizard')
    expect(within(rows[1]).getByLabelText('HD')).toHaveValue(6)
  })

  it('stamps Synthesist archetype for Summoner and triggers eidolon companion', () => {
    let doc: CharacterDocument | undefined
    render(
      <I18nProvider>
        <IdentityHarness onCharacterChange={(c) => { doc = c }} />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add class' }))
    const row = screen.getByLabelText('Class name').closest('tr')!

    pickCatalog('Class catalog', 'Summoner', row)
    expect(within(row).getByLabelText('APG archetype')).toHaveTextContent('No archetype')

    pickCatalog('APG archetype', 'Synthesist', row)
    expect(within(row).getByLabelText('APG archetype')).toHaveTextContent('Synthesist')
    expect(within(row).getByLabelText('Archetype name')).toHaveValue('Synthesist')
    expect(doc?.companions.some((c) => c.kind === 'eidolon')).toBe(true)
    expect(screen.getByText('Synthesist')).toBeInTheDocument()

    pickCatalog('APG archetype', 'No archetype', row)
    expect(within(row).getByLabelText('APG archetype')).toHaveTextContent('No archetype')
    expect(within(row).getByLabelText('Archetype name')).toHaveValue('')
    expect(doc?.classes[0]?.archetype).toBeUndefined()
  })
})
