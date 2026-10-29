import { describe, expect, it } from 'vitest'
import en from '../../locales/en.json'
import es from '../../locales/es.json'
import type { MessageTree } from './catalog'
import {
  listArchetypes,
  listClassProgressions,
  listEvolutions,
  listFeats,
  listFeatures,
  listItems,
  listRaces,
  listSpells,
} from '../../systems/pf1e/content/packRegistry'
import { localizedName } from '../../systems/pf1e/content/namesPack'
import '../../systems/pf1e/content/crbPack'
import '../../systems/pf1e/content/apgPack'

/**
 * Phase 5.2 boundary: catalog names are pack content and travel with the row
 * through the pack registry. `en.json` / `es.json` translate the application's
 * own chrome. Letting a catalog name into a UI catalog puts one row's label in
 * two places that can disagree, and makes the locale runtime a second content
 * pipeline. See `content/pf1e/names/README.md`.
 */

function values(tree: MessageTree, trail = ''): { key: string; text: string }[] {
  return Object.entries(tree).flatMap(([key, node]) => {
    const path = trail ? `${trail}.${key}` : key
    return typeof node === 'string'
      ? [{ key: path, text: node }]
      : values(node, path)
  })
}

const UI_STRINGS = [
  ...values(en as MessageTree).map((entry) => ({ ...entry, locale: 'en' })),
  ...values(es as MessageTree).map((entry) => ({ ...entry, locale: 'es' })),
]

function catalogRows() {
  return [
    ...listClassProgressions(),
    ...listRaces(),
    ...listItems(),
    ...listFeats(),
    ...listFeatures(),
    ...listSpells(),
    ...listArchetypes(),
    ...listEvolutions(),
  ]
}

/**
 * Short labels are excluded because they are real words ("Luz", "Escudo",
 * "Red") that chrome legitimately uses for its own buttons; a collision
 * there is a coincidence, not a leaked catalog row. The long names are the
 * ones that can only have come from the catalog.
 */
const MIN_TELLTALE_LENGTH = 7

/**
 * Chrome strings that legitimately name a mechanic and predate this slice.
 * Each is the app talking about its own control, not a catalog row that
 * leaked into the locale runtime:
 *
 *  - the Attack Helper's toggles are named after the feats they model, and
 *    the tool offers them whether or not the character has the feat row;
 *  - a size and a school are sheet fields with fixed value lists, not rows
 *    in any catalog;
 *  - "Craft" / "Fabricar" is a Budget Calculator mode, and "Appearance" /
 *    "Apariencia" is a notes heading, both unrelated to the same-named feat
 *    and spell.
 *
 * Allowlisted by key, so changing one of these strings to some *other*
 * catalog name still fails.
 */
const CHROME_THAT_NAMES_A_MECHANIC = new Set([
  'shell.attackHelper.powerAttack',
  'shell.attackHelper.deadlyAim',
  'shell.attackHelper.combatExpertise',
  'shell.budget.modeCraft',
  'notes.appearance',
  'pf1e.combat.dodge',
  'pf1e.identity.sizes.medium',
  'pf1e.identity.schools.divination',
])

const CANDIDATES = UI_STRINGS.filter(
  (entry) => !CHROME_THAT_NAMES_A_MECHANIC.has(entry.key),
)

describe('UI locale catalogs stay free of catalog names', () => {
  it('actually found strings and rows to compare', () => {
    expect(UI_STRINGS.length).toBeGreaterThan(100)
    expect(catalogRows().length).toBeGreaterThan(900)
  })

  it('has no UI string equal to an English catalog name', () => {
    const names = new Set(
      catalogRows()
        .map((row) => row.name)
        .filter((name) => name.length >= MIN_TELLTALE_LENGTH),
    )
    const leaked = CANDIDATES.filter((entry) => names.has(entry.text)).map(
      (entry) => `${entry.locale}:${entry.key} = ${entry.text}`,
    )
    expect(leaked).toEqual([])
  })

  it('has no UI string equal to a curated Spanish catalog name', () => {
    const names = new Set(
      catalogRows()
        .map((row) => localizedName(row.id, 'es'))
        .filter(
          (name): name is string =>
            name !== null && name.length >= MIN_TELLTALE_LENGTH,
        ),
    )
    const leaked = CANDIDATES.filter((entry) => names.has(entry.text)).map(
      (entry) => `${entry.locale}:${entry.key} = ${entry.text}`,
    )
    expect(leaked).toEqual([])
  })

  it('keeps every allowlisted key real, so the list cannot rot', () => {
    // An allowlist that outlives its key quietly exempts nothing and hides
    // the fact that the exemption is no longer reviewed.
    const keys = new Set(UI_STRINGS.map((entry) => entry.key))
    const stale = [...CHROME_THAT_NAMES_A_MECHANIC].filter(
      (key) => !keys.has(key),
    )
    expect(stale).toEqual([])
  })

  it('keeps the two UI catalogs structurally parallel', () => {
    // A catalog name added to one locale only would show up here as well.
    const enKeys = values(en as MessageTree).map((entry) => entry.key)
    const esKeys = new Set(values(es as MessageTree).map((entry) => entry.key))
    expect(enKeys.filter((key) => !esKeys.has(key))).toEqual([])
  })
})
