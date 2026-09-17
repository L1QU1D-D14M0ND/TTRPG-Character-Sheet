import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from './createEmptyCharacter'
import {
  createEmptyAttack,
  createEmptyClass,
  createEmptyCondition,
  createEmptyDailyResource,
  createEmptyEidolon,
  createEmptyFeat,
  createEmptyFeature,
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from './createRows'
import {
  CharacterLoadError,
  CharacterSaveError,
  parseCharacterJson,
  serializeCharacter,
} from './saveLoad'
import { readRepoFile } from '../../../test/readRepoFile'
import { validateCharacterDocument } from './validate'
import { STANDARD_SKILLS } from './standardSkills'

describe('PF1e character JSON Schema validation', () => {
  it('writes system pf1e on a new sheet', () => {
    const empty = createEmptyCharacter()
    expect(empty.system).toBe('pf1e')
    expect(empty.skills).toHaveLength(STANDARD_SKILLS.length)
    expect(serializeCharacter(empty)).toContain('"system": "pf1e"')
  })

  it('rejects a non-pf1e system id', () => {
    const empty = createEmptyCharacter()
    const data = JSON.parse(serializeCharacter(empty)) as Record<string, unknown>
    data.system = 'pf2e'
    expect(() => parseCharacterJson(JSON.stringify(data))).toThrow(
      /Invalid character sheet/,
    )
  })

  it('rejects a file without system', () => {
    const empty = createEmptyCharacter()
    const data = JSON.parse(serializeCharacter(empty)) as Record<string, unknown>
    delete data.system
    expect(() => parseCharacterJson(JSON.stringify(data))).toThrow(
      /system/,
    )
  })

  it('accepts the Fighter 5, Wizard 5, Fighter 2 / Wizard 3, Synthesist 5, and Wizard 7 goldens', () => {
    expect(() =>
      parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
      ),
    ).not.toThrow()
    expect(() =>
      parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
      ),
    ).not.toThrow()
    expect(() =>
      parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
      ),
    ).not.toThrow()
    expect(() =>
      parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/synthesist-5.json'),
      ),
    ).not.toThrow()
    expect(() =>
      parseCharacterJson(
        readRepoFile(
          'fixtures/characters/golden/pf1e/wizard-transmutation-7.json',
        ),
      ),
    ).not.toThrow()
  })

  it('accepts createEmptyCharacter()', () => {
    const empty = createEmptyCharacter()
    expect(() => validateCharacterDocument(empty)).not.toThrow()
    expect(() => serializeCharacter(empty)).not.toThrow()
  })

  it('accepts empty feat, class, and play rows added from factories', () => {
    const doc = createEmptyCharacter()
    doc.classes.push(createEmptyClass())
    doc.attacks.push(createEmptyAttack())
    const entry = createEmptySpellcasting()
    entry.cantrips.push(createEmptySpellListEntry(0))
    entry.spells.push(createEmptySpellListEntry(1))
    doc.spellcasting.push(entry)
    doc.feats.push(createEmptyFeat())
    doc.features.push(createEmptyFeature())
    doc.companions.push(createEmptyEidolon())
    doc.conditions.push(createEmptyCondition())
    doc.play.dailyResources.push(createEmptyDailyResource())
    expect(() => serializeCharacter(doc)).not.toThrow()
  })

  it('rejects invalid JSON', () => {
    expect(() => parseCharacterJson('{')).toThrow(CharacterLoadError)
  })

  it('rejects the wrong schemaVersion', () => {
    const empty = createEmptyCharacter()
    const data = JSON.parse(serializeCharacter(empty)) as { schemaVersion: number }
    data.schemaVersion = 2
    expect(() => parseCharacterJson(JSON.stringify(data))).toThrow(
      /Invalid character sheet/,
    )
  })

  it('rejects unknown top-level properties', () => {
    const empty = createEmptyCharacter()
    const data = JSON.parse(serializeCharacter(empty)) as Record<string, unknown>
    data.campaignOptions = { mythic: true }
    expect(() => parseCharacterJson(JSON.stringify(data))).toThrow(
      CharacterLoadError,
    )
  })

  it('accepts ignoreWeight and treats an omitted flag as count-weight', () => {
    const withFlag = createEmptyCharacter()
    withFlag.inventory.ignoreWeight = true
    expect(() => validateCharacterDocument(withFlag)).not.toThrow()
    const reloaded = parseCharacterJson(serializeCharacter(withFlag))
    expect(reloaded.inventory.ignoreWeight).toBe(true)

    const omitted = JSON.parse(serializeCharacter(createEmptyCharacter())) as {
      inventory: { ignoreWeight?: boolean }
    }
    delete omitted.inventory.ignoreWeight
    expect(() => parseCharacterJson(JSON.stringify(omitted))).not.toThrow()
  })

  it('strips derived on save and still validates', () => {
    const doc = createEmptyCharacter()
    doc.derived = { maxHp: 99, ac: 99 }
    const saved = serializeCharacter(doc)
    expect(saved).not.toContain('"derived"')
    const reloaded = parseCharacterJson(saved)
    expect(reloaded.derived).toBeUndefined()
  })

  it('refuses to save a document that does not match the schema', () => {
    const doc = createEmptyCharacter()
    doc.classes.push({ ...createEmptyClass(), levels: 0 })
    expect(() => serializeCharacter(doc)).toThrow(CharacterSaveError)
  })
})
