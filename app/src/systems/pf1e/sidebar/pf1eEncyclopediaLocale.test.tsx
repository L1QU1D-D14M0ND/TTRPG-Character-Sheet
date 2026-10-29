// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider, type Locale } from '../../../shared/i18n'
import { OGC_ENTRIES } from '../content/ogcPack'
import { pf1eSidebarTools } from './tools'

/**
 * Renders the *registered* sidebar tool rather than the Encyclopedia
 * component directly, so this covers the locale wiring in `tools.tsx` too:
 * the tool reads the active locale itself, and nothing passes it in.
 */
function renderTool(locale: Locale) {
  const tool = pf1eSidebarTools.find((row) => row.id === 'shell.encyclopedia')!
  render(
    <I18nProvider initialLocale={locale}>
      {tool.render({
        system: 'pf1e',
        character: {} as never,
        derived: {} as never,
        update: () => {},
      })}
    </I18nProvider>,
  )
}

afterEach(cleanup)

describe('PF1e encyclopedia, rendered in Spanish (Phase 5.2)', () => {
  it('lists an entry under its curated Spanish name', () => {
    renderTool('es')
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'bola de fuego' },
    })
    expect(
      screen.getByRole('button', { name: 'Bola de fuego' }),
    ).toBeInTheDocument()
  })

  it('finds that entry by its English name as well', () => {
    renderTool('es')
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Fireball' },
    })
    expect(
      screen.getByRole('button', { name: 'Bola de fuego' }),
    ).toBeInTheDocument()
  })

  it('shows both names and the English prose on the selected entry', () => {
    renderTool('es')
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Fireball' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Bola de fuego' }))
    const packed = OGC_ENTRIES.find((entry) => entry.id === 'spell.fireball')!
    expect(screen.getByText(packed.body)).toBeInTheDocument()
    expect(screen.getByText('(Fireball)')).toBeInTheDocument()
  })

  it('keeps the English UI entirely English', () => {
    renderTool('en')
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Fireball' },
    })
    expect(screen.getByRole('button', { name: 'Fireball' })).toBeInTheDocument()
    expect(screen.queryByText('Bola de fuego')).toBeNull()
  })
})
