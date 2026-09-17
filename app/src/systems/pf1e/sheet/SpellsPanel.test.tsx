// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { pickCatalog } from '../../../test/pickCatalog'
import { createEmptyCharacter } from '../character'
import {
  createEmptyClass,
  createEmptySpellcasting,
} from '../character/createRows'
import { computeCharacter } from '../engine'
import { SpellsPanel } from './SpellsPanel'
import type { SheetUpdate } from './update'

function wizardFive() {
  const character = createEmptyCharacter()
  const wizard = createEmptyClass()
  wizard.id = 'class-row-wizard'
  wizard.levels = 5
  wizard.class = { id: 'class.wizard', name: 'Wizard' }
  wizard.hitDie = 6
  wizard.babProgression = 'half'
  wizard.saves = { fort: 'poor', ref: 'poor', will: 'good' }
  character.classes = [wizard]
  character.abilities.int.score = 18
  const entry = createEmptySpellcasting()
  entry.id = 'cast-wizard'
  entry.name = 'Wizard'
  entry.classRowId = 'class-row-wizard'
  character.spellcasting = [entry]
  return character
}

function SpellsHarness({ initial = wizardFive() }: { initial?: ReturnType<typeof wizardFive> }) {
  const [character, setCharacter] = useState(initial)
  const derived = useMemo(() => computeCharacter(character), [character])
  const update: SheetUpdate = (mutator) => {
    setCharacter((current) => mutator(current))
  }
  return (
    <SpellsPanel character={character} derived={derived} update={update} />
  )
}

describe('SpellsPanel slot max hybrid', () => {
  afterEach(cleanup)

  it('shows class table plus bonus, then a custom amount, then empty resets', () => {
    render(
      <I18nProvider>
        <SpellsHarness />
      </I18nProvider>,
    )

    const firstMax = screen.getByRole('button', {
      name: 'Max slots for level 1: 4. Click to customize.',
    })
    expect(firstMax).toHaveTextContent('4')
    expect(firstMax).not.toHaveClass('overridden')

    fireEvent.click(firstMax)
    const editor = screen.getByLabelText('Max slots for level 1')
    fireEvent.change(editor, { target: { value: '7' } })
    fireEvent.blur(editor)

    const custom = screen.getByRole('button', {
      name: 'Max slots for level 1: 7. Click to customize.',
    })
    expect(custom).toHaveTextContent('7')
    expect(custom).toHaveClass('overridden')

    fireEvent.click(custom)
    const reset = screen.getByLabelText('Max slots for level 1')
    fireEvent.change(reset, { target: { value: '' } })
    fireEvent.blur(reset)

    const restored = screen.getByRole('button', {
      name: 'Max slots for level 1: 4. Click to customize.',
    })
    expect(restored).toHaveTextContent('4')
    expect(restored).not.toHaveClass('overridden')
  })

  it('stamps a catalog spell onto the spell list', () => {
    render(
      <I18nProvider>
        <SpellsHarness />
      </I18nProvider>,
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Add spell' })[1])
    pickCatalog('CRB spell', 'Fireball')
    const spellRow = (
      screen.getByLabelText('Spell name') as HTMLElement
    ).closest('tr')!
    expect(
      (within(spellRow).getByLabelText('Spell name') as HTMLInputElement).value,
    ).toBe('Fireball')
    expect(
      (within(spellRow).getByLabelText('Level') as HTMLInputElement).value,
    ).toBe('3')
  })
})
