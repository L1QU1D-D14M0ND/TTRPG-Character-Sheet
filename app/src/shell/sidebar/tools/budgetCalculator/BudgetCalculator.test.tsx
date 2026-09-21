// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../../shared/i18n'
import { BudgetCalculator } from './BudgetCalculator'
import type {
  BudgetItemCalculated,
  BudgetItemInput,
  BudgetSummary,
} from './types'

/** A stand-in for a system's budget math: buy = price × qty, craft = half. */
function fakeCalculate(items: BudgetItemInput[]): {
  items: BudgetItemCalculated[]
  summary: BudgetSummary
} {
  const calculated: BudgetItemCalculated[] = items.map((item) => {
    const buy = item.marketPrice * item.quantity
    const craft = buy / 2
    const canCraft = !item.featRequired
    return {
      id: item.id,
      name: item.name,
      marketPrice: item.marketPrice,
      quantity: item.quantity,
      mode: item.mode,
      isMagic: item.isMagic ?? false,
      lineCost: item.mode === 'craft' ? craft : buy,
      craftMaterialsCost: craft,
      craftTimeDays: item.mode === 'craft' ? 1 : 0,
      craftDc: item.isMagic ? 8 : null,
      canCraft,
      reasons: canCraft ? [] : [`missing ${item.featRequired}`],
    }
  })
  const buyAllTotal = calculated.reduce(
    (sum, i) => sum + i.marketPrice * i.quantity,
    0,
  )
  const craftAllTotal = calculated.reduce(
    (sum, i) => sum + i.craftMaterialsCost,
    0,
  )
  const mixedTotal = calculated.reduce((sum, i) => sum + i.lineCost, 0)
  const currentGold = 100
  return {
    items: calculated,
    summary: {
      buyAllTotal,
      craftAllTotal,
      mixedTotal,
      totalCraftDays: calculated.reduce((sum, i) => sum + i.craftTimeDays, 0),
      currentGold,
      remainingGold: currentGold - mixedTotal,
      isDeficit: mixedTotal > currentGold,
      blockedCraftCount: calculated.filter(
        (i) => i.mode === 'craft' && !i.canCraft,
      ).length,
    },
  }
}

function renderCalc(
  initialItems?: BudgetItemInput[],
  calculate = fakeCalculate,
  locale: 'en' | 'es' = 'en',
) {
  return render(
    <I18nProvider initialLocale={locale}>
      <BudgetCalculator calculate={calculate} initialItems={initialItems} />
    </I18nProvider>,
  )
}

function addItem(name: string, price = '10', qty = '1') {
  fireEvent.change(screen.getByLabelText(/Item name/i), {
    target: { value: name },
  })
  fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: price } })
  fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: qty } })
  fireEvent.click(screen.getByRole('button', { name: /Add to Shopping List/i }))
}

describe('BudgetCalculator', () => {
  afterEach(cleanup)

  it('starts empty rather than seeding invented shopping-list lines', () => {
    renderCalc()

    // The tool must not put items the player never chose onto their plan.
    expect(screen.queryByText('Longsword')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Cloak of Resistance +1'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/No items in shopping list/i),
    ).toBeInTheDocument()
  })

  it('adds a typed line and shows its computed cost', () => {
    renderCalc()
    addItem('Longsword', '15', '2')

    expect(screen.getByText('Longsword')).toBeInTheDocument()
    expect(screen.getByText('× 2')).toBeInTheDocument()
    // Buy-all, mixed, and the line itself all read 30 gp for a single line.
    expect(screen.getAllByText('30 gp').length).toBeGreaterThan(0)
    expect(
      screen.queryByText(/No items in shopping list/i),
    ).not.toBeInTheDocument()
  })

  it('gives each added line a distinct id even within the same millisecond', () => {
    const calculate = vi.fn(fakeCalculate)
    renderCalc([], calculate)

    // Freeze the clock so a Date.now()-based id would collide.
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    try {
      addItem('Potion A')
      addItem('Potion B')
    } finally {
      now.mockRestore()
    }

    const lastItems = calculate.mock.calls.at(-1)![0]
    expect(lastItems).toHaveLength(2)
    expect(new Set(lastItems.map((i) => i.id)).size).toBe(2)
    expect(screen.getByText('Potion A')).toBeInTheDocument()
    expect(screen.getByText('Potion B')).toBeInTheDocument()
  })

  it('ignores a blank item name', () => {
    const calculate = vi.fn(fakeCalculate)
    renderCalc([], calculate)

    fireEvent.change(screen.getByLabelText(/Item name/i), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Add to Shopping List/i }))

    expect(screen.getByText(/No items in shopping list/i)).toBeInTheDocument()
  })

  it('toggles a line between buy and craft and re-costs it', () => {
    renderCalc([
      {
        id: 'a',
        name: 'Longsword',
        marketPrice: 40,
        quantity: 1,
        mode: 'buy',
      },
    ])

    expect(screen.getByText('Cost: 40 gp')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /click to switch/i }))
    expect(screen.getByText('Cost: 20 gp')).toBeInTheDocument()
  })

  it('removes a line', () => {
    renderCalc([
      { id: 'a', name: 'Longsword', marketPrice: 15, quantity: 1, mode: 'buy' },
    ])

    fireEvent.click(screen.getByRole('button', { name: /Remove item/i }))
    expect(screen.queryByText('Longsword')).not.toBeInTheDocument()
    expect(screen.getByText(/No items in shopping list/i)).toBeInTheDocument()
  })

  it('surfaces craft blockers and the blocked-count warning', () => {
    renderCalc([
      {
        id: 'a',
        name: 'Cloak of Resistance +1',
        marketPrice: 1000,
        quantity: 1,
        mode: 'craft',
        isMagic: true,
        featRequired: 'Craft Wondrous Item',
      },
    ])

    expect(
      screen.getByText(/missing Craft Wondrous Item/),
    ).toBeInTheDocument()
    expect(screen.getByText(/1 craft item/i)).toBeInTheDocument()
  })

  it('reports a deficit when the plan costs more than the purse', () => {
    renderCalc([
      { id: 'a', name: 'Plate', marketPrice: 1500, quantity: 1, mode: 'buy' },
    ])

    // Purse is 100 gp in the fake, so the plan is 1400 gp short.
    expect(screen.getByText(/short 1400 gp/i)).toBeInTheDocument()
  })

  it('keeps the no-dice-roller reminder visible', () => {
    renderCalc()
    expect(screen.getByText(/no in-app dice roller/i)).toBeInTheDocument()
  })

  it('renders every user-facing string from the catalog in Spanish', () => {
    renderCalc(
      [{ id: 'a', name: 'Espada', marketPrice: 15, quantity: 2, mode: 'craft' }],
      fakeCalculate,
      'es',
    )

    // Form and per-line chrome must be translated, not hardcoded English.
    expect(screen.queryByText(/^Price \(gp\):$/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Qty:$/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Is Magic Item\?/)).not.toBeInTheDocument()
    expect(screen.queryByText(/click to switch/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Materials:/)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre del objeto/i)).toBeInTheDocument()
    expect(screen.getByText(/Modo: Fabricar/)).toBeInTheDocument()
    expect(screen.getByText(/Materiales: 15 po/)).toBeInTheDocument()
  })
})
