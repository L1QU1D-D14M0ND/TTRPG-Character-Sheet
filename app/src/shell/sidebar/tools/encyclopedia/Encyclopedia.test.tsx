// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../../shared/i18n'
import { Encyclopedia } from './Encyclopedia'
import type { EncyclopediaGroup } from './types'

const GROUPS: EncyclopediaGroup[] = [
  {
    kind: 'spell',
    entries: [
      { id: 'spell.fireball', name: 'Fireball', body: 'A burst of fire.' },
    ],
  },
  { kind: 'feat', entries: [] },
  { kind: 'feature', entries: [] },
  { kind: 'affliction', entries: [] },
  { kind: 'action', entries: [] },
]

function renderEncyclopedia() {
  render(
    <I18nProvider initialLocale="en">
      <Encyclopedia groups={GROUPS} />
    </I18nProvider>,
  )
}

function renderGroups(groups: EncyclopediaGroup[]) {
  render(
    <I18nProvider initialLocale="en">
      <Encyclopedia groups={groups} />
    </I18nProvider>,
  )
}

function filled(kind: EncyclopediaGroup['kind'], prefix: string, count: number) {
  return {
    kind,
    entries: Array.from({ length: count }, (_, index) => ({
      id: `${prefix}.${index}`,
      name: `${prefix} ${index}`,
      body: 'Body.',
    })),
  }
}

afterEach(cleanup)

describe('Encyclopedia', () => {
  it('lists packed entries and keeps empty groups visible', () => {
    renderEncyclopedia()
    expect(screen.getByRole('button', { name: 'Fireball' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Afflictions' })).toBeInTheDocument()
    expect(screen.getAllByText('No entries packed yet.').length).toBeGreaterThan(0)
  })

  it('shows the body of the selected entry and does not offer an editor', () => {
    renderEncyclopedia()
    fireEvent.click(screen.getByRole('button', { name: 'Fireball' }))
    expect(screen.getByText('A burst of fire.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /body/i })).not.toBeInTheDocument()
  })

  it('hides entries that do not match the search', () => {
    renderEncyclopedia()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'shield' } })
    expect(screen.queryByRole('button', { name: 'Fireball' })).not.toBeInTheDocument()
  })

  it('lists entries by name, not in content-batch order', () => {
    renderGroups([
      {
        kind: 'feat',
        entries: [
          { id: 'feat.power-attack', name: 'Power Attack', body: 'Body.' },
          { id: 'feat.agile-maneuvers', name: 'Agile Maneuvers', body: 'Body.' },
          { id: 'feat.cleave', name: 'Cleave', body: 'Body.' },
        ],
      },
    ])
    const names = screen
      .getAllByRole('button')
      .map((button) => button.textContent)
    expect(names).toEqual(['Agile Maneuvers', 'Cleave', 'Power Attack'])
  })

  it('still shows a packed group when an earlier group exceeds the row cap', () => {
    renderGroups([
      filled('spell', 'Spell', 70),
      filled('feat', 'Feat', 5),
      { kind: 'feature', entries: [] },
    ])
    // Every packed feat stays reachable, and only the truly empty group
    // claims nothing is packed.
    expect(screen.getAllByRole('button', { name: /^Feat \d+$/ })).toHaveLength(5)
    expect(screen.getAllByText('No entries packed yet.')).toHaveLength(1)
  })

  it('reports held-back rows per group and in total', () => {
    renderGroups([filled('spell', 'Spell', 70), filled('feat', 'Feat', 5)])
    expect(
      screen.getByText('15 more in this group. Keep typing to narrow the list.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('15 more matches. Keep typing to narrow the list.'),
    ).toBeInTheDocument()
  })

  it('separates an unpacked group from one with no search match', () => {
    renderGroups([
      { kind: 'spell', entries: [{ id: 'spell.fireball', name: 'Fireball', body: 'Body.' }] },
      { kind: 'feat', entries: [] },
    ])
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(screen.getByText('No entries match your search.')).toBeInTheDocument()
    expect(screen.getByText('No entries packed yet.')).toBeInTheDocument()
  })
})
