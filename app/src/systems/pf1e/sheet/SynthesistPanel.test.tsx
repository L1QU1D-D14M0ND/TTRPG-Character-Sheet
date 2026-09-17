// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { fireEvent, render, screen, cleanup, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { pickCatalog } from '../../../test/pickCatalog'
import {
  createEmptyCharacter,
  createEmptyClass,
  ensureEidolonCompanion,
} from '../character'
import { applyApgArchetype, applyClassProgression } from '../content'
import { computeCharacter } from '../engine'
import { SynthesistPanel } from './SynthesistPanel'
import type { SheetUpdate } from './update'

function synthesistCharacter() {
  const character = createEmptyCharacter()
  const summoner = applyClassProgression(createEmptyClass(), 'class.summoner')
  character.classes = [applyApgArchetype(summoner, 'archetype.synthesist')]
  character.companions = ensureEidolonCompanion(character.companions)
  return character
}

function Harness() {
  const [character, setCharacter] = useState(synthesistCharacter)
  const derived = useMemo(() => computeCharacter(character), [character])
  const update: SheetUpdate = (mutator) => {
    setCharacter((current) => mutator(current))
  }
  return (
    <SynthesistPanel
      character={character}
      derived={derived}
      update={update}
    />
  )
}

describe('SynthesistPanel catalog', () => {
  afterEach(cleanup)

  it('stamps catalog evolutions onto only the targeted row', () => {
    render(
      <I18nProvider>
        <Harness />
      </I18nProvider>,
    )
    const add = screen.getByRole('button', { name: 'Add evolution' })
    fireEvent.click(add)
    fireEvent.click(add)
    const rows = screen
      .getAllByLabelText('Evolution name')
      .map((el) => el.closest('tr')!)
    pickCatalog('APG evolution', 'Bite', rows[0])
    pickCatalog('APG evolution', 'Claws', rows[1])
    expect(within(rows[0]).getByLabelText('Evolution name')).toHaveValue('Bite')
    expect(within(rows[1]).getByLabelText('Evolution name')).toHaveValue(
      'Claws',
    )
  })
})
