// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { readRepoFile } from '../../test/readRepoFile'
import { I18nProvider } from '../../shared/i18n'
import { SidebarHost } from './SidebarHost'
import { pf1eModule } from '../../systems/pf1e/module'
import type { SidebarToolContext } from '../types'

/**
 * The per-tool component tests drive the shared UI with a stub `calculate` /
 * `compute`, which proves the UI contract but not the wiring. These tests run
 * a real golden character through the real PF1e tool modules and assert on
 * what the player actually sees, so a break anywhere along
 * document -> engine -> tool math -> UI is caught.
 */
const FIGHTER_5 = 'fixtures/characters/golden/pf1e/fighter-5.json'

function loadFighter() {
  const character = pf1eModule.parse(readRepoFile(FIGHTER_5))
  const derived = pf1eModule.compute(character)
  return { character, derived }
}

function renderTools() {
  const { character, derived } = loadFighter()
  const context: SidebarToolContext<unknown, unknown> = {
    system: 'pf1e',
    character,
    derived,
    update: () => {},
    focusTab: () => {},
  }
  render(
    <I18nProvider initialLocale="en">
      <SidebarHost
        tools={pf1eModule.sidebarTools ?? []}
        context={context}
        collapsed={false}
        onToggle={() => {}}
      />
    </I18nProvider>,
  )
  return { character, derived }
}

function openTool(name: RegExp) {
  fireEvent.click(screen.getByRole('button', { name }))
}

describe('PF1e sidebar tools on the Fighter 5 golden', () => {
  afterEach(cleanup)

  it('registers all three named tools', () => {
    renderTools()
    expect(screen.getByRole('button', { name: /Attack Helper/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Actions List/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Budget Calculator/i }),
    ).toBeInTheDocument()
  })

  it('Attack Helper offers the golden weapon and computes a real to-hit', () => {
    renderTools()
    openTool(/Attack Helper/i)

    const select = screen.getByRole('combobox')
    expect(within(select).getByText(/longsword/i)).toBeInTheDocument()

    // A Fighter 5 attack bonus is a signed number, not a placeholder.
    const toHit = screen.getByText(/^[+-]\d+$/)
    expect(toHit).toBeInTheDocument()
    expect(Number(toHit.textContent)).toBeGreaterThan(0)
  })

  it('Attack Helper applies Power Attack from the sheet and lowers the to-hit', () => {
    renderTools()
    openTool(/Attack Helper/i)

    // The golden Fighter has Power Attack, so the toggle must be offered.
    const powerAttack = screen.getByRole('checkbox', { name: /Power Attack/i })
    const before = Number(screen.getByText(/^[+-]\d+$/).textContent)

    fireEvent.click(powerAttack)

    const after = Number(screen.getByText(/^[+-]\d+$/).textContent)
    expect(after).toBeLessThan(before)
  })

  it('Actions List shows real action groups for the golden', () => {
    renderTools()
    openTool(/Actions List/i)

    expect(
      screen.queryByText(/No actions available/i),
    ).not.toBeInTheDocument()
    // Group headers carry a non-zero count.
    expect(screen.getAllByText(/\(\d+\)/).length).toBeGreaterThan(0)
  })

  it('Budget Calculator opens empty and reads the golden purse (175 gp)', () => {
    const { character } = renderTools()
    expect(character.inventory.currency?.gp).toBe(175)

    openTool(/Budget Calculator/i)

    // Regression guard: no invented seed items, and the purse is the real one.
    expect(screen.getByText(/No items in shopping list/i)).toBeInTheDocument()
    // Empty plan: gold on hand and net balance both read the full 175 gp.
    expect(screen.getAllByText('175 gp')).toHaveLength(2)
  })

  it('Budget Calculator costs a typed line against the real purse', () => {
    renderTools()
    openTool(/Budget Calculator/i)

    fireEvent.change(screen.getByLabelText(/Item name/i), {
      target: { value: 'Masterwork longsword' },
    })
    fireEvent.change(screen.getByLabelText(/Price/i), {
      target: { value: '315' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /Add to Shopping List/i }),
    )

    expect(screen.getByText('Masterwork longsword')).toBeInTheDocument()
    expect(screen.getByText('Cost: 315 gp')).toBeInTheDocument()
    // 175 gp purse against a 315 gp plan is a 140 gp shortfall.
    expect(screen.getByText(/short 140 gp/i)).toBeInTheDocument()
  })

  it('renders the tools in Spanish without leaking English chrome', () => {
    const { character, derived } = loadFighter()
    render(
      <I18nProvider initialLocale="es">
        <SidebarHost
          tools={pf1eModule.sidebarTools ?? []}
          context={{
            system: 'pf1e',
            character,
            derived,
            update: () => {},
            focusTab: () => {},
          }}
          collapsed={false}
          onToggle={() => {}}
        />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Calculadora/i }))
    expect(screen.getByLabelText(/Nombre del objeto/i)).toBeInTheDocument()
    expect(screen.queryByText(/Is Magic Item\?/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/click to switch/i)).not.toBeInTheDocument()
  })
})
