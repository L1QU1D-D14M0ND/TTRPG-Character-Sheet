// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../../shared/i18n'
import { AttackHelper } from './AttackHelper'
import type {
  AttackHelperOption,
  AttackHelperOutput,
  AttackHelperToggle,
} from './types'

const OPTIONS: AttackHelperOption[] = [
  { id: 'atk-1', name: 'Longsword', type: 'melee' },
  { id: 'atk-2', name: 'Longbow', type: 'ranged' },
]

const TOGGLES: AttackHelperToggle[] = [
  {
    id: 'power-attack',
    labelKey: 'shell.attackHelper.powerAttack',
    labelFallback: 'Power Attack',
    active: false,
    description: '-1 atk / +2 dmg',
  },
]

function output(overrides: Partial<AttackHelperOutput> = {}): AttackHelperOutput {
  return {
    attackBonusString: '+9',
    iterativeBonusStrings: ['+9'],
    damageExpression: '1d8+4',
    damageBreakdown: 'Str +4',
    critHint: '19-20/x2',
    triggers: [],
    inflicts: [],
    ...overrides,
  }
}

function renderHelper(props: {
  options?: AttackHelperOption[]
  getToggles?: (id: string) => AttackHelperToggle[]
  compute?: (id: string, active: Set<string>) => AttackHelperOutput | null
}) {
  return render(
    <I18nProvider>
      <AttackHelper
        options={props.options ?? OPTIONS}
        getToggles={props.getToggles ?? (() => TOGGLES)}
        compute={props.compute ?? (() => output())}
      />
    </I18nProvider>,
  )
}

describe('AttackHelper', () => {
  afterEach(cleanup)

  it('shows the empty message when the sheet has no attacks', () => {
    renderHelper({ options: [] })
    expect(
      screen.getByText(/No weapons or attacks configured/i),
    ).toBeInTheDocument()
  })

  it('renders the computed to-hit, damage, and crit for the first attack', () => {
    renderHelper({})

    expect(screen.getByText('+9')).toBeInTheDocument()
    expect(screen.getByText('1d8+4')).toBeInTheDocument()
    expect(screen.getByText('19-20/x2')).toBeInTheDocument()
    expect(screen.getByText('Str +4')).toBeInTheDocument()
  })

  it('translates toggle labels through the catalog rather than the fallback', () => {
    renderHelper({})
    // en.json supplies a real string for this key, so the fallback must not win.
    expect(screen.getByText('Power Attack')).toBeInTheDocument()
    expect(screen.getByText(/-1 atk \/ \+2 dmg/)).toBeInTheDocument()
  })

  it('passes checked toggles into compute and re-renders the result', () => {
    const compute = vi.fn((_id: string, active: Set<string>) =>
      output({ attackBonusString: active.has('power-attack') ? '+7' : '+9' }),
    )
    renderHelper({ compute })

    expect(screen.getByText('+9')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByText('+7')).toBeInTheDocument()
    const lastCall = compute.mock.calls.at(-1)!
    expect([...lastCall[1]]).toEqual(['power-attack'])
  })

  it('clears active toggles when the user switches weapons', () => {
    const compute = vi.fn(() => output())
    renderHelper({ compute })

    fireEvent.click(screen.getByRole('checkbox'))
    expect([...compute.mock.calls.at(-1)![1]]).toEqual(['power-attack'])

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'atk-2' },
    })

    const [attackId, active] = compute.mock.calls.at(-1)!
    expect(attackId).toBe('atk-2')
    expect([...active]).toEqual([])
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('shows the iterative sequence only when there is more than one attack', () => {
    const { unmount } = renderHelper({
      compute: () => output({ iterativeBonusStrings: ['+9'] }),
    })
    expect(screen.queryByText(/Full Attack Sequence/i)).not.toBeInTheDocument()
    unmount()

    renderHelper({
      compute: () => output({ iterativeBonusStrings: ['+9', '+4'] }),
    })
    expect(screen.getByText(/Full Attack Sequence/i)).toBeInTheDocument()
    expect(screen.getByText('+9 / +4')).toBeInTheDocument()
  })

  it('renders the mechanics card only when triggers or inflicts exist', () => {
    const { unmount } = renderHelper({ compute: () => output() })
    expect(screen.queryByText(/Mechanical Reminders/i)).not.toBeInTheDocument()
    unmount()

    renderHelper({
      compute: () =>
        output({
          triggers: ['provokes an attack of opportunity'],
          inflicts: ['bleed 1'],
        }),
    })
    expect(screen.getByText(/Mechanical Reminders/i)).toBeInTheDocument()
    expect(
      screen.getByText('provokes an attack of opportunity'),
    ).toBeInTheDocument()
    expect(screen.getByText('bleed 1')).toBeInTheDocument()
  })

  it('falls back to the first option when the selected attack disappears', () => {
    const compute = vi.fn(() => output())
    const { rerender } = render(
      <I18nProvider>
        <AttackHelper options={OPTIONS} getToggles={() => []} compute={compute} />
      </I18nProvider>,
    )

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'atk-2' },
    })
    expect(compute.mock.calls.at(-1)![0]).toBe('atk-2')

    // The user deletes that weapon on the Inventory tab.
    rerender(
      <I18nProvider>
        <AttackHelper
          options={[OPTIONS[0]!]}
          getToggles={() => []}
          compute={compute}
        />
      </I18nProvider>,
    )

    expect(compute.mock.calls.at(-1)![0]).toBe('atk-1')
  })

  it('keeps the no-dice-roller reminder visible', () => {
    renderHelper({})
    expect(screen.getByText(/no in-app dice roller/i)).toBeInTheDocument()
    expect(screen.getByText(/Roll physical dice at the table/i)).toBeInTheDocument()
  })
})
