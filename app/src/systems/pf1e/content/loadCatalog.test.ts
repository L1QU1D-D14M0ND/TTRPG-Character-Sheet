import { describe, expect, it } from 'vitest'
import { CharacterValidationError } from '../../../shared/validate'
import Ajv from 'ajv/dist/2020.js'
import { loadCatalog, VALIDATE_PACKS_AT_RUNTIME } from './loadCatalog'
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

  it('defaults to validating whenever DEV is set', () => {
    expect(VALIDATE_PACKS_AT_RUNTIME).toBe(import.meta.env.DEV)
  })

  describe('production branch', () => {
    it('passes bundled rows straight through without compiling a schema', () => {
      const rows = [{ id: 'item.probe', name: 'Probe', kind: 'item', pounds: 2 }]
      let compiles = 0
      const real = Ajv.prototype.compile
      Ajv.prototype.compile = function (
        this: unknown,
        ...args: [never]
      ): ReturnType<typeof real> {
        compiles++
        return real.apply(this as never, args)
      }
      try {
        expect(loadCatalog(itemsSchema, rows, 'probe.json', false)).toBe(rows)
      } finally {
        Ajv.prototype.compile = real
      }
      // The whole point of the skip: no Ajv work on the startup path.
      expect(compiles).toBe(0)
    })

    it('does not throw on a pack CI would have rejected', () => {
      // Production trusts the CI-verified bundle rather than re-checking it.
      expect(() =>
        loadCatalog(itemsSchema, [{ totally: 'invalid' }], 'probe.json', false),
      ).not.toThrow()
    })
  })
})
