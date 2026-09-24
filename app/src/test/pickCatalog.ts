import { fireEvent, screen, within } from '@testing-library/react'

/**
 * Drive the ADR 0009 catalog picker from a panel test.
 *
 * The picker renders a capped first page, so a row that sorts past the cap is
 * only reachable by narrowing with the search box. That is also what a player
 * does, so type the name when the option is not already on screen rather than
 * reaching around the UI.
 */
export function pickCatalog(
  catalogLabel: string,
  optionName: string,
  scope?: HTMLElement,
) {
  const root = scope ? within(scope) : screen
  fireEvent.click(root.getByLabelText(catalogLabel))
  const dialog = screen.getByRole('dialog')

  if (!within(dialog).queryByRole('option', { name: optionName })) {
    const search = within(dialog).queryByLabelText('Search catalog')
    if (search) fireEvent.change(search, { target: { value: optionName } })
  }

  fireEvent.click(within(dialog).getByRole('option', { name: optionName }))
}
