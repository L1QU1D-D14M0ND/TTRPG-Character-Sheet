// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { ModalDialog } from './ModalDialog'

function Harness({ withSearch = false }: { withSearch?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      <ModalDialog
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="harness-title"
      >
        <h2 id="harness-title">Harness</h2>
        {withSearch ? <input aria-label="search" data-autofocus="" /> : null}
        <button type="button">first</button>
        <button type="button">last</button>
      </ModalDialog>
    </>
  )
}

describe('ModalDialog', () => {
  afterEach(cleanup)

  it('renders nothing while closed', () => {
    const { container } = render(
      <ModalDialog open={false} onClose={() => {}} labelledBy="x">
        <h2 id="x">Hidden</h2>
      </ModalDialog>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('exposes the accessible dialog contract', () => {
    render(
      <ModalDialog open onClose={() => {}} labelledBy="x" className="wide">
        <h2 id="x">Shown</h2>
      </ModalDialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'x')
    expect(dialog).toHaveClass('dialog-card', 'wide')
  })

  it('closes on Escape and on backdrop click, but not on card click', () => {
    const onClose = vi.fn()
    render(
      <ModalDialog open onClose={onClose} labelledBy="x">
        <h2 id="x">Shown</h2>
      </ModalDialog>,
    )

    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('moves focus into the dialog and back to the opener on close', () => {
    render(<Harness />)
    const opener = screen.getByRole('button', { name: 'open' })
    opener.focus()
    fireEvent.click(opener)

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'first' }),
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('prefers the data-autofocus control for initial focus', () => {
    render(<Harness withSearch />)
    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    expect(document.activeElement).toBe(screen.getByLabelText('search'))
  })

  it('keeps Tab inside the dialog in both directions', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    const first = screen.getByRole('button', { name: 'first' })
    const last = screen.getByRole('button', { name: 'last' })

    last.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })
})
