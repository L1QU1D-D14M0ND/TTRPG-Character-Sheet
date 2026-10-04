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
})
