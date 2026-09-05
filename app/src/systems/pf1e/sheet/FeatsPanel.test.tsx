// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
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

function renderPanel() {
  render(
    <I18nProvider>
      <Harness />
    </I18nProvider>,
  )
}

/** Row edits must touch exactly one row, which is what the hand-rolled
 *  copy-and-splice code was doing 83 times over. */
describe('FeatsPanel row editing', () => {
  afterEach(cleanup)

  it('edits only the targeted feat when several exist', () => {
    renderPanel()
    const addFeat = screen.getByRole('button', { name: 'Add feat' })
    fireEvent.click(addFeat)
    fireEvent.click(addFeat)
    fireEvent.click(addFeat)

    const names = screen.getAllByLabelText('Feat name')
    expect(names).toHaveLength(3)

    fireEvent.change(names[0], { target: { value: 'First' } })
    fireEvent.change(names[1], { target: { value: 'Second' } })
    fireEvent.change(names[2], { target: { value: 'Third' } })

    const after = screen.getAllByLabelText('Feat name') as HTMLInputElement[]
    expect(after.map((i) => i.value)).toEqual(['First', 'Second', 'Third'])
  })

  it('keeps sibling rows intact when editing level and summary', () => {
    renderPanel()
    const addFeat = screen.getByRole('button', { name: 'Add feat' })
    fireEvent.click(addFeat)
    fireEvent.click(addFeat)

    fireEvent.change(screen.getAllByLabelText('Feat name')[0], {
      target: { value: 'Keep me' },
    })
    fireEvent.change(screen.getAllByLabelText('Level')[1], {
      target: { value: '7' },
    })
    fireEvent.change(screen.getAllByLabelText('Summary')[1], {
      target: { value: 'Second summary' },
    })

    const names = screen.getAllByLabelText('Feat name') as HTMLInputElement[]
    const levels = screen.getAllByLabelText('Level') as HTMLInputElement[]
    const summaries = screen.getAllByLabelText('Summary') as HTMLInputElement[]
    expect(names[0].value).toBe('Keep me')
    expect(levels[0].value).toBe('1')
    expect(summaries[0].value).toBe('')
    expect(levels[1].value).toBe('7')
    expect(summaries[1].value).toBe('Second summary')
  })

  it('clamps level to at least 1', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Add feat' }))
    const level = screen.getAllByLabelText('Level')[0] as HTMLInputElement
    fireEvent.change(level, { target: { value: '0' } })
    expect(level.value).toBe('1')
    fireEvent.change(level, { target: { value: '-4' } })
    expect(level.value).toBe('1')
  })

  it('removes the clicked feat and no other', () => {
    renderPanel()
    const addFeat = screen.getByRole('button', { name: 'Add feat' })
    fireEvent.click(addFeat)
    fireEvent.click(addFeat)
    fireEvent.click(addFeat)
    const names = screen.getAllByLabelText('Feat name')
    fireEvent.change(names[0], { target: { value: 'A' } })
    fireEvent.change(names[1], { target: { value: 'B' } })
    fireEvent.change(names[2], { target: { value: 'C' } })

    // Remove the middle row via its own row's button.
    const middleRow = (
      screen.getAllByLabelText('Feat name')[1] as HTMLElement
    ).closest('tr')!
    fireEvent.click(within(middleRow).getByRole('button', { name: 'Remove' }))

    const after = screen.getAllByLabelText('Feat name') as HTMLInputElement[]
    expect(after.map((i) => i.value)).toEqual(['A', 'C'])
  })

  it('edits and removes features independently of feats', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Add feat' }))
    fireEvent.change(screen.getAllByLabelText('Feat name')[0], {
      target: { value: 'Untouched feat' },
    })

    const addFeature = screen.getByRole('button', { name: 'Add feature' })
    fireEvent.click(addFeature)
    fireEvent.click(addFeature)
    const featureNames = screen.getAllByLabelText('Feature name')
    fireEvent.change(featureNames[0], { target: { value: 'F1' } })
    fireEvent.change(featureNames[1], { target: { value: 'F2' } })

    const firstFeatureRow = (
      screen.getAllByLabelText('Feature name')[0] as HTMLElement
    ).closest('tr')!
    fireEvent.click(
      within(firstFeatureRow).getByRole('button', { name: 'Remove' }),
    )

    expect(
      (screen.getAllByLabelText('Feature name') as HTMLInputElement[]).map(
        (i) => i.value,
      ),
    ).toEqual(['F2'])
    // The feat table is untouched by feature edits.
    expect(
      (screen.getAllByLabelText('Feat name')[0] as HTMLInputElement).value,
    ).toBe('Untouched feat')
  })
})
