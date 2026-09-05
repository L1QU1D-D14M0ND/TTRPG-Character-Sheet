import { describe, expect, it } from 'vitest'
import { CharacterValidationError } from '../../../shared/validate'
import { loadCatalog } from './loadCatalog'
import itemsSchema from '../../../../../schemas/content/pf1e/items.schema.json'

/**
 * Production skips pack validation because packs are CI-verified build inputs
 * (see loadCatalog.ts). Tests run with DEV=true, so a hand-edited pack must
 * still fail loudly here — that is the whole safety story for the skip.
 */
describe('loadCatalog', () => {
  it('rejects a malformed pack in dev/test', () => {
    expect(import.meta.env.DEV).toBe(true)
    expect(() =>
      loadCatalog(itemsSchema, [{ id: 'weapon.bad' }], 'probe.json'),
    ).toThrow(CharacterValidationError)
  })

  it('names the offending file so the failure is actionable', () => {
    expect(() =>
      loadCatalog(itemsSchema, [{ nope: true }], 'content/pf1e/probe.json'),
    ).toThrow(/content\/pf1e\/probe\.json/)
  })

  it('returns valid rows unchanged', () => {
    const rows = [
      { id: 'item.probe', name: 'Probe', kind: 'item', pounds: 2 },
    ]
    expect(loadCatalog(itemsSchema, rows, 'probe.json')).toBe(rows)
  })
})
