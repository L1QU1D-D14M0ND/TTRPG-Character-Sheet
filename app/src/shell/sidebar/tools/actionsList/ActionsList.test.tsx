// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../../../shared/i18n'
import { ActionsList } from './ActionsList'
import type { ActionGroup } from './types'

const GROUPS: ActionGroup[] = [
  {
    id: 'standard',
    title: 'Standard Actions',
    items: [
      {
        id: 'attack',
        label: 'Attack (longsword)',
        kind: 'attack',
        actionEconomyGroup: 'standard',
        actionCost: 'Standard',
        availability: 'available',
        detail: '+9 / 1d8+4',
      },
      {
        id: 'cast',
        label: 'Cast a spell',
        kind: 'spell',
        actionEconomyGroup: 'standard',
        availability: 'hindered',
        reason: 'arcane spell failure 20%',
      },
    ],
  },
  {
    id: 'full',
    title: 'Full-Round Actions',
    items: [
      {
        id: 'full-attack',
        label: 'Full attack',
        kind: 'attack',
        actionEconomyGroup: 'full',
        availability: 'unavailable',
        reason: 'only one attack at BAB +5',
      },
    ],
  },
]

function renderList(groups: ActionGroup[] = GROUPS) {
  return render(
    <I18nProvider>
      <ActionsList groups={groups} />
    </I18nProvider>,
  )
}

describe('ActionsList', () => {
  afterEach(cleanup)

  it('renders every group with its item count and reason chips', () => {
    renderList()

    expect(screen.getByText('Standard Actions')).toBeInTheDocument()
    expect(screen.getByText('Full-Round Actions')).toBeInTheDocument()
    // Count badge renders alongside the title.
    expect(screen.getByText('(2)')).toBeInTheDocument()
    expect(screen.getByText('Attack (longsword)')).toBeInTheDocument()
    expect(screen.getByText('+9 / 1d8+4')).toBeInTheDocument()
    expect(
      screen.getByText(/arcane spell failure 20%/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/only one attack at BAB \+5/),
    ).toBeInTheDocument()
  })

  it('hides unavailable rows and drops groups left empty by the filter', () => {
    renderList()

    fireEvent.click(screen.getByLabelText(/Hide unavailable actions/i))

    expect(screen.queryByText('Full attack')).not.toBeInTheDocument()
    // The whole group disappears once its only row is filtered out.
    expect(screen.queryByText('Full-Round Actions')).not.toBeInTheDocument()
    // Hindered rows are not unavailable, so they stay.
    expect(screen.getByText('Cast a spell')).toBeInTheDocument()
  })

  it('collapses and re-expands a group without losing its rows', () => {
    renderList()

    const header = screen.getByRole('button', { name: /Standard Actions/ })
    expect(header).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Attack (longsword)')).not.toBeInTheDocument()

    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Attack (longsword)')).toBeInTheDocument()
  })

  it('shows the empty message when the filter removes every group', () => {
    renderList([
      {
        id: 'only',
        title: 'Only Group',
        items: [
          {
            id: 'x',
            label: 'Blocked',
            kind: 'other',
            actionEconomyGroup: 'only',
            availability: 'unavailable',
            reason: 'nope',
          },
        ],
      },
    ])

    fireEvent.click(screen.getByLabelText(/Hide unavailable actions/i))
    expect(
      screen.getByText(/No actions available on this character sheet/i),
    ).toBeInTheDocument()
  })

  it('shows the empty message when a system supplies no groups at all', () => {
    renderList([])
    expect(
      screen.getByText(/No actions available on this character sheet/i),
    ).toBeInTheDocument()
  })
})
