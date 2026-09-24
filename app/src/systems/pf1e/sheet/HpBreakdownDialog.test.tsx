// @vitest-environment jsdom
import { useMemo, useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { createEmptyCharacter } from '../character'
import type { CharacterDocument } from '../character'
import { HpBreakdownDialog } from './HpBreakdownDialog'
import type { SheetUpdate } from './update'

/**
 * The HP breakdown is the one place a player types the die results the app
 * refuses to roll, so its editing rules (one HD at a time, max-at-first-level,
 * favored-class HP, dropping stale extra rolls) are the sheet's contract with
 * the table, not incidental UI.
 */
function withFighter(character: CharacterDocument, levels: number) {
  return {
    ...character,
    abilities: {
      ...character.abilities,
      con: { ...character.abilities.con, score: 14 },
    },
    classes: [
      {
        id: 'class-1',
        class: { id: 'class.fighter', name: 'Fighter', source: undefined },
        levels,
        hitDie: 10,
        babProgression: 'full' as const,
        saves: { fort: 'good' as const, ref: 'poor' as const, will: 'poor' as const },
        classSkills: [],
        skillPointsPerLevel: 2,
      },
    ],
  }
}

function Harness({
  levels = 2,
  hpRolled,
}: {
  levels?: number
  hpRolled?: number[]
}) {
  const [character, setCharacter] = useState<CharacterDocument>(() => {
    const base = withFighter(createEmptyCharacter(), levels)
    return hpRolled
      ? { ...base, vitals: { ...base.vitals, hpRolled } }
      : base
  })
  const [open, setOpen] = useState(false)
  const update: SheetUpdate = (mutator) => setCharacter((c) => mutator(c))
  const doc = useMemo(() => character, [character])
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open HP
      </button>
      <HpBreakdownDialog
        open={open}
        onClose={() => setOpen(false)}
        character={doc}
        update={update}
      />
    </>
  )
}


/** The Max HP total, read from its own row rather than by bare number text. */
function maxHp(): string {
  const header = [...document.querySelectorAll('th')].find(
    (th) => th.textContent?.trim() === 'Max HP',
  )
  return header?.nextElementSibling?.textContent?.trim() ?? ''
}

function renderDialog(levels = 2) {
  render(
    <I18nProvider initialLocale="en">
      <Harness levels={levels} />
    </I18nProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Open HP' }))
}

describe('HpBreakdownDialog', () => {
  afterEach(cleanup)

  it('is a focus-managed modal that restores focus on Escape', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider initialLocale="en">
        <Harness />
      </I18nProvider>,
    )
    const trigger = screen.getByRole('button', { name: 'Open HP' })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Close' }),
      ),
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('adds each rolled hit die to max HP with the Con modifier', () => {
    renderDialog()
    // Con 14 → +2 per hit die.
    fireEvent.change(screen.getByLabelText('HD 1 roll'), {
      target: { value: '10' },
    })
    expect(maxHp()).toBe('12')

    fireEvent.change(screen.getByLabelText('HD 2 roll'), {
      target: { value: '5' },
    })
    // 10+2 then 5+2 = 19 total.
    expect(maxHp()).toBe('19')
  })

  it('locks a hit die until the earlier ones are entered', () => {
    renderDialog()
    expect(screen.getByLabelText('HD 2 roll')).toBeDisabled()
    fireEvent.change(screen.getByLabelText('HD 1 roll'), {
      target: { value: '10' },
    })
    expect(screen.getByLabelText('HD 2 roll')).toBeEnabled()
  })

  it('maxes the first hit die from the button', () => {
    renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Max 1st' }))
    expect(
      (screen.getByLabelText('HD 1 roll') as HTMLInputElement)
        .value,
    ).toBe('10')
  })

  it('clears a roll when the field is emptied', () => {
    renderDialog()
    const first = screen.getByLabelText('HD 1 roll')
    fireEvent.change(first, { target: { value: '10' } })
    fireEvent.change(first, { target: { value: '' } })
    expect((first as HTMLInputElement).value).toBe('')
    expect(screen.getByLabelText('HD 2 roll')).toBeDisabled()
  })

  it('adds favored-class HP on top of the hit dice', () => {
    renderDialog()
    fireEvent.change(screen.getByLabelText('HD 1 roll'), {
      target: { value: '10' },
    })
    fireEvent.change(screen.getByLabelText('Fighter favored HP'), {
      target: { value: '2' },
    })
    expect(maxHp()).toBe('14')
  })

  it('lets a player drop an extra roll left over from a lost level', () => {
    // Two recorded rolls but only one class level: the second is surplus and
    // still counts toward Max HP until the player removes it.
    render(
      <I18nProvider initialLocale="en">
        <Harness levels={1} hpRolled={[10, 6]} />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open HP' }))

    expect(screen.getByLabelText('Extra HD roll 2')).toBeInTheDocument()
    expect(maxHp()).toBe('20')

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.queryByLabelText('Extra HD roll 2')).toBeNull()
    expect(maxHp()).toBe('12')
  })

  it('reports no hit dice when the sheet has no class levels', () => {
    render(
      <I18nProvider initialLocale="en">
        <Harness levels={0} />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open HP' }))
    expect(
      screen.getByText(/Add a class on Identity/i),
    ).toBeInTheDocument()
  })
})
