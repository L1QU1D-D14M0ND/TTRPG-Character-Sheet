import { useCallback, useEffect, useRef, type ReactNode } from 'react'

/**
 * The one modal shell for the app: backdrop, `role="dialog"` card, Escape and
 * backdrop dismissal, and the keyboard contract screen-reader and
 * keyboard-only players depend on.
 *
 * Every dialog previously reimplemented the Escape listener and none of them
 * managed focus, so opening one left the keyboard focus behind on the trigger
 * in the page underneath: Tab walked the sheet behind the modal, and closing
 * the modal dropped focus on `<body>`. This component moves focus in, keeps
 * Tab inside while open, and restores focus to the element that opened it.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Visibility is checked with attributes and computed style rather than
 * `offsetParent`, which is always null under jsdom and would otherwise make
 * the trap untestable (and empty) in the test environment.
 */
function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
    return false
  }
  const style = el.ownerDocument.defaultView?.getComputedStyle(el)
  return style ? style.display !== 'none' && style.visibility !== 'hidden' : true
}

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisible)
}

export function ModalDialog({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean
  /** Escape, backdrop click, and the trap's dismissal path all route here. */
  onClose: () => void
  /** id of the heading inside `children` that names this dialog. */
  labelledBy: string
  /** Extra classes on the card, e.g. sizing. */
  className?: string
  children: ReactNode
}) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const trapTab = useCallback((event: KeyboardEvent) => {
    const card = cardRef.current
    if (!card) return
    const items = focusableWithin(card)
    if (items.length === 0) {
      event.preventDefault()
      card.focus()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement as HTMLElement | null
    if (event.shiftKey && (active === first || !card.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !card.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    restoreRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    // Prefer whatever the dialog marked as its entry point (e.g. a search
    // box), then the first focusable control, then the card itself.
    const card = cardRef.current
    if (card) {
      const preferred = card.querySelector<HTMLElement>('[data-autofocus]')
      const target = preferred ?? focusableWithin(card)[0] ?? card
      target.focus()
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key === 'Tab') trapTab(event)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      const restore = restoreRef.current
      restoreRef.current = null
      if (restore?.isConnected) restore.focus()
    }
  }, [open, onClose, trapTab])

  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={cardRef}
        className={className ? `dialog-card ${className}` : 'dialog-card'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
