import { describe, expect, it } from 'vitest'
import { createEmptyCharacter as createPf1e } from '../systems/pf1e/character'
import { compute as computePf1e } from '../systems/pf1e/engine'
import { createEmptyCharacter as createPf2e } from '../systems/pf2e/character'
import { compute as computePf2e } from '../systems/pf2e/engine'

/**
 * Override paths are untrusted: they arrive verbatim from a loaded `.json` the
 * app did not write. A path segment that names a record entry used to be looked
 * up by plain indexing, so `__proto__` and `constructor` resolved to values
 * inherited from `Object.prototype`. `derived.attacks.__proto__.attack` then
 * looked like a real attack row and crashed compute on its missing fields,
 * which takes down the whole sheet on load; `skillTotals.__proto__` was
 * reported as applied while writing nothing.
 *
 * Unsafe segments must be ordinary unknown paths: ignored, reported, inert.
 */
const UNSAFE = ['__proto__', 'constructor', 'prototype']

describe('unsafe override path segments', () => {
  it.each(UNSAFE)('PF1e ignores record paths named %s', (key) => {
    const character = createPf1e()
    const paths = [
      `derived.skillTotals.${key}`,
      `derived.attacks.${key}.attack`,
      `derived.spellcasting.${key}.casterLevel`,
      `derived.spellcasting.${key}.dcByLevel.1`,
    ]
    for (const path of paths) character.overrides[path] = { value: 7 }

    const view = computePf1e(character)

    expect(view.overriddenPaths).toEqual([])
    expect(view.ignoredOverridePaths).toEqual(paths)
  })

  it.each(UNSAFE)('PF2e ignores record paths named %s', (key) => {
    const character = createPf2e()
    const paths = [
      `derived.skillTotals.${key}`,
      `derived.strikes.${key}.attack`,
      `derived.spellcasting.${key}.dc`,
    ]
    for (const path of paths) character.overrides[path] = { value: 7 }

    const view = computePf2e(character)

    expect(view.overriddenPaths).toEqual([])
    expect(view.ignoredOverridePaths).toEqual(paths)
  })

  it('leaves Object.prototype untouched', () => {
    const character = createPf1e()
    character.overrides['derived.skillTotals.__proto__'] = { value: 99 }
    character.overrides['derived.attacks.__proto__.attack'] = { value: 99 }
    computePf1e(character)

    expect(({} as Record<string, unknown>).attack).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call({}, '99')).toBe(false)
  })

  it('still applies a legitimate skill override', () => {
    const character = createPf1e()
    const skillKey = character.skills[0]!.key
    character.overrides[`derived.skillTotals.${skillKey}`] = { value: 17 }

    const view = computePf1e(character)

    expect(view.skillTotals[skillKey]).toBe(17)
    expect(view.overriddenPaths).toEqual([`derived.skillTotals.${skillKey}`])
  })
})
