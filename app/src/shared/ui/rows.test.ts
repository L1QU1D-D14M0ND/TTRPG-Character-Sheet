import { describe, expect, it } from 'vitest'
import {
  appendRow,
  patchAt,
  removeAt,
  replaceAt,
  updateAt,
} from './rows'

interface Row {
  id: string
  n: number
}

const rows: Row[] = [
  { id: 'a', n: 1 },
  { id: 'b', n: 2 },
  { id: 'c', n: 3 },
]

describe('row helpers', () => {
  it('replaceAt swaps one row and leaves the others identical', () => {
    const next = replaceAt(rows, 1, { id: 'b2', n: 9 })
    expect(next.map((r) => r.id)).toEqual(['a', 'b2', 'c'])
    // Untouched rows keep their identity, so React can skip them.
    expect(next[0]).toBe(rows[0])
    expect(next[2]).toBe(rows[2])
  })

  it('patchAt merges fields without dropping the rest of the row', () => {
    const next = patchAt(rows, 0, { n: 42 })
    expect(next[0]).toEqual({ id: 'a', n: 42 })
    expect(next[1]).toBe(rows[1])
  })

  it('updateAt derives the new row from the old one', () => {
    const next = updateAt(rows, 2, (row) => ({ ...row, n: row.n * 10 }))
    expect(next[2]).toEqual({ id: 'c', n: 30 })
  })

  it('removeAt drops exactly one row', () => {
    expect(removeAt(rows, 1).map((r) => r.id)).toEqual(['a', 'c'])
    expect(removeAt(rows, 0).map((r) => r.id)).toEqual(['b', 'c'])
    expect(removeAt(rows, 2).map((r) => r.id)).toEqual(['a', 'b'])
  })

  it('appendRow adds to the end', () => {
    expect(appendRow(rows, { id: 'd', n: 4 }).map((r) => r.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
  })

  it('never mutates the input array or its rows', () => {
    const original = structuredClone(rows)
    replaceAt(rows, 1, { id: 'x', n: 0 })
    patchAt(rows, 1, { n: 0 })
    updateAt(rows, 1, (r) => ({ ...r, n: 0 }))
    removeAt(rows, 1)
    appendRow(rows, { id: 'z', n: 0 })
    expect(rows).toEqual(original)
  })

  it('treats an out-of-range index as a no-op copy', () => {
    for (const index of [-1, 3, 99]) {
      expect(patchAt(rows, index, { n: 0 })).toEqual(rows)
      expect(removeAt(rows, index)).toEqual(rows)
      expect(replaceAt(rows, index, { id: 'x', n: 0 })).toEqual(rows)
      expect(updateAt(rows, index, () => ({ id: 'x', n: 0 }))).toEqual(rows)
      // Still a fresh array, so callers can assign it unconditionally.
      expect(removeAt(rows, index)).not.toBe(rows)
    }
  })
})
