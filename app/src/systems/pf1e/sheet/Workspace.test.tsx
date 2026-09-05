// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { createEmptyCharacter } from '../character'
import { computeCharacter } from '../engine'
import { Pf1eWorkspace } from './Workspace'
import type { SheetUpdate } from './update'

function App() {
  const [character, setCharacter] = useState(createEmptyCharacter)
  const update: SheetUpdate = (mutator) => setCharacter((c) => mutator(c))
  return (
    <Pf1eWorkspace
      character={character}
      derived={computeCharacter(character)}
      update={update}
    />
  )
}

function renderWorkspace() {
  render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  )
}

/**
 * The skills grid is the widest row-editing surface in the app and it drives
 * `patchAt` through the real workspace rather than a panel in isolation, so it
 * guards the row-helper refactor against cross-row bleed.
 */
describe('PF1e workspace skills grid', () => {
  afterEach(cleanup)

  it('applies a rank edit to only the edited skill row', () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole('button', { name: /skills/i }))

    const acrobatics = screen.getByLabelText(
      'Acrobatics Ranks',
    ) as HTMLInputElement
    const appraise = screen.getByLabelText('Appraise Ranks') as HTMLInputElement
    const bluff = screen.getByLabelText('Bluff Ranks') as HTMLInputElement

    fireEvent.change(acrobatics, { target: { value: '5' } })
    fireEvent.change(bluff, { target: { value: '3' } })

    expect(
      (screen.getByLabelText('Acrobatics Ranks') as HTMLInputElement).value,
    ).toBe('5')
    expect(
      (screen.getByLabelText('Appraise Ranks') as HTMLInputElement).value,
    ).toBe('0')
    expect((screen.getByLabelText('Bluff Ranks') as HTMLInputElement).value).toBe(
      '3',
    )
    expect(appraise.value).toBe('0')
  })

  it('clamps a negative rank to zero in the document', () => {
    // The clamp lives in state, not the DOM: React re-renders with ranks 0,
    // which equals the previous value, so the browser keeps showing the typed
    // "-3". Assert the document, which is what Save and the engine read.
    let latest = 0
    function Probe() {
      const [character, setCharacter] = useState(createEmptyCharacter)
      latest = character.skills[0].ranks
      const update: SheetUpdate = (mutator) => setCharacter((c) => mutator(c))
      return (
        <Pf1eWorkspace
          character={character}
          derived={computeCharacter(character)}
          update={update}
        />
      )
    }
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /skills/i }))
    const acrobatics = screen.getByLabelText(
      'Acrobatics Ranks',
    ) as HTMLInputElement

    fireEvent.change(acrobatics, { target: { value: '4' } })
    expect(latest).toBe(4)
    fireEvent.change(acrobatics, { target: { value: '-3' } })
    expect(latest).toBe(0)
  })

  it('toggles class skill on one row without touching its neighbours', () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole('button', { name: /skills/i }))

    const acrobatics = screen.getByLabelText(
      'Acrobatics Class',
    ) as HTMLInputElement
    const appraise = screen.getByLabelText(
      'Appraise Class',
    ) as HTMLInputElement
    const wasAcrobatics = acrobatics.checked
    const wasAppraise = appraise.checked

    fireEvent.click(acrobatics)

    expect(
      (screen.getByLabelText('Acrobatics Class') as HTMLInputElement)
        .checked,
    ).toBe(!wasAcrobatics)
    expect(
      (screen.getByLabelText('Appraise Class') as HTMLInputElement)
        .checked,
    ).toBe(wasAppraise)
  })
})
