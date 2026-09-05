/**
 * Row edits for spreadsheet panels.
 *
 * Every editable table cell has to rebuild its row list immutably, which was
 * written out by hand ~83 times across both systems as
 * `const xs = [...c.xs]; xs[i] = { ...xs[i], field: v }; return { ...c, xs }`.
 * That is easy to get subtly wrong (mutating in place, or splicing the wrong
 * index) and the mistake is invisible in review.
 *
 * These helpers are generic over the row and the document, so they stay in the
 * shared kernel without either system importing the other (ADR 0004).
 */

/** Replace one row, leaving every other row untouched. Out-of-range is a no-op. */
export function replaceAt<T>(rows: readonly T[], index: number, next: T): T[] {
  if (index < 0 || index >= rows.length) return [...rows]
  const copy = [...rows]
  copy[index] = next
  return copy
}

/** Apply a patch to one row's fields. Out-of-range is a no-op. */
export function patchAt<T>(
  rows: readonly T[],
  index: number,
  patch: Partial<T>,
): T[] {
  if (index < 0 || index >= rows.length) return [...rows]
  const copy = [...rows]
  copy[index] = { ...copy[index], ...patch }
  return copy
}

/** Derive one row from its current value. Out-of-range is a no-op. */
export function updateAt<T>(
  rows: readonly T[],
  index: number,
  mutator: (row: T) => T,
): T[] {
  if (index < 0 || index >= rows.length) return [...rows]
  const copy = [...rows]
  copy[index] = mutator(copy[index])
  return copy
}

/** Drop one row. Out-of-range is a no-op. */
export function removeAt<T>(rows: readonly T[], index: number): T[] {
  if (index < 0 || index >= rows.length) return [...rows]
  return rows.filter((_, i) => i !== index)
}

/** Append one row. */
export function appendRow<T>(rows: readonly T[], row: T): T[] {
  return [...rows, row]
}
