// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../shared/i18n'
import { Encyclopedia } from '../../../shell/sidebar/tools/encyclopedia/Encyclopedia'
import { buildPf1eEncyclopedia } from './pf1eEncyclopedia'
import { OGC_ENTRIES } from '../content/ogcPack'

/**
 * Drives the real sidebar tool against the real OGC pack, so these assertions
 * describe what a player actually sees rather than a synthetic fixture.
 */
function renderTool() {
  render(
    <I18nProvider initialLocale="en">
      <Encyclopedia groups={buildPf1eEncyclopedia()} />
    </I18nProvider>,
  )
}

afterEach(cleanup)

describe('PF1e encyclopedia, as rendered', () => {
  it('never tells the player a packed group is unpacked', () => {
    renderTool()
    // Only Afflictions and Actions genuinely ship nothing today.
    const unpacked = screen.getAllByText('No entries packed yet.')
    expect(unpacked).toHaveLength(2)
  })

  it('shows the small spell and feature groups despite 123 feats between them', () => {
    renderTool()
    // Feats are the overwhelming majority of the pack and sort between the
    // other two groups. Spending the cap in group order starved Features
    // entirely; every one of its rows must survive.
    expect(screen.getByRole('button', { name: 'Fireball' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Evolution Surge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Arcane Bond' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Physical Enhancement' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Telekinetic Fist' })).toBeInTheDocument()
    // And feats are represented too, from the top of the alphabet.
    expect(screen.getByRole('button', { name: 'Acrobatic' })).toBeInTheDocument()
  })

  it('lists the visible feats in alphabetical order', () => {
    renderTool()
    const feats = screen
      .getAllByRole('button')
      .map((button) => button.textContent ?? '')
      .filter((name) => name === 'Acrobatic' || name === 'Alertness' || name === 'Agile Maneuvers')
    expect(feats).toEqual(['Acrobatic', 'Agile Maneuvers', 'Alertness'])
  })

  it('finds a late-alphabet entry by search and shows its summary', () => {
    renderTool()
    // 'Wind Stance' sorts past the 60-row cap, so this also proves the
    // overflow note is not hiding rows the player cannot reach.
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'wind stance' } })
    const row = screen.getByRole('button', { name: 'Wind Stance' })
    fireEvent.click(row)
    const packed = OGC_ENTRIES.find((entry) => entry.id === 'feat.wind-stance')
    expect(screen.getByText(packed!.body)).toBeInTheDocument()
  })

  it('accounts for every packed entry: shown plus held back equals the pack', () => {
    renderTool()
    const shown = screen
      .getAllByRole('button')
      .filter((button) => button.textContent !== '').length
    const note = screen.queryByText(/more matches/)
    const heldBack = note
      ? Number(/^(\d+)/.exec(note.textContent ?? '')?.[1] ?? '0')
      : 0
    expect(shown + heldBack).toBe(OGC_ENTRIES.length)
  })
})
