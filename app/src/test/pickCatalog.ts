import { fireEvent, screen, within } from '@testing-library/react'

/** Drive the ADR 0009 catalog picker from a panel test. */
export function pickCatalog(
  catalogLabel: string,
  optionName: string,
  scope?: HTMLElement,
) {
  const root = scope ? within(scope) : screen
  fireEvent.click(root.getByLabelText(catalogLabel))
  const dialog = screen.getByRole('dialog')
  fireEvent.click(within(dialog).getByRole('option', { name: optionName }))
}
