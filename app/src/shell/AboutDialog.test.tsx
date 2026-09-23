// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../shared/i18n'
import { AboutDialog } from './AboutDialog'

describe('AboutDialog', () => {
  afterEach(cleanup)

  it('renders nothing when closed', () => {
    const { container } = render(
      <I18nProvider initialLocale="en">
        <AboutDialog open={false} onClose={() => {}} />
      </I18nProvider>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog with accessible title, license, and disclaimer when open', () => {
    const onClose = vi.fn()
    render(
      <I18nProvider initialLocale="en">
        <AboutDialog open={true} onClose={onClose} />
      </I18nProvider>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'about-dialog-title')

    expect(screen.getByRole('heading', { name: /about ttrpg character sheet/i })).toBeInTheDocument()
    expect(screen.getByText(/licensed under the mit license/i)).toBeInTheDocument()
    expect(screen.getByText(/trademark & non-affiliation notice/i)).toBeInTheDocument()
    expect(screen.getByText(/not affiliated with, endorsed, sponsored, or approved by paizo inc/i)).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('dismisses on Escape key', () => {
    const onClose = vi.fn()
    render(
      <I18nProvider initialLocale="en">
        <AboutDialog open={true} onClose={onClose} />
      </I18nProvider>,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders localized in Spanish', () => {
    render(
      <I18nProvider initialLocale="es">
        <AboutDialog open={true} onClose={() => {}} />
      </I18nProvider>,
    )

    expect(screen.getByRole('heading', { name: /acerca de ttrpg character sheet/i })).toBeInTheDocument()
    expect(screen.getByText(/distribuido bajo la licencia mit/i)).toBeInTheDocument()
    expect(screen.getByText(/aviso de marcas y no afiliación/i)).toBeInTheDocument()
    expect(screen.getByText(/no está afiliada, respaldada, patrocinada ni aprobada por paizo inc/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument()
  })
})
