import { describe, expect, it } from 'vitest'
import { parseLoadedSheet } from './loadSheet'
import { readRepoFile } from '../test/readRepoFile'
import { createEmptyCharacter as createPf1e } from '../systems/pf1e/character'
import { serializeCharacter as serializePf1e } from '../systems/pf1e/character'
import { createEmptyCharacter as createPf2e } from '../systems/pf2e/character'
import { serializeCharacter as serializePf2e } from '../systems/pf2e/character'

describe('parseLoadedSheet', () => {
  it('loads a PF2e golden without system as pf2e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/fighter-5.json'),
    )
    expect(loaded.system).toBe('pf2e')
    if (loaded.system === 'pf2e') {
      expect(loaded.character.identity.class.id).toBe('class.fighter')
    }
  })

  it('loads the PF2e Bard 5 golden as pf2e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/bard-5.json'),
    )
    expect(loaded.system).toBe('pf2e')
    if (loaded.system === 'pf2e') {
      expect(loaded.character.identity.class.id).toBe('class.bard')
      expect(loaded.character.spellcasting[0]?.castType).toBe('spontaneous')
    }
  })

  it('loads the PF2e Cleric 5 golden as pf2e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/cleric-5.json'),
    )
    expect(loaded.system).toBe('pf2e')
    if (loaded.system === 'pf2e') {
      expect(loaded.character.identity.class.id).toBe('class.cleric')
      expect(loaded.character.spellcasting[0]?.tradition).toBe('divine')
      expect(loaded.character.spellcasting[0]?.castType).toBe('prepared')
    }
  })

  it('loads the PF2e Ranger 5 golden as pf2e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/ranger-5.json'),
    )
    expect(loaded.system).toBe('pf2e')
    if (loaded.system === 'pf2e') {
      expect(loaded.character.identity.class.id).toBe('class.ranger')
      expect(loaded.character.companions[0]?.kind).toBe('animalCompanion')
    }
  })

  it('loads a PF1e golden as pf1e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    expect(loaded.system).toBe('pf1e')
    if (loaded.system === 'pf1e') {
      expect(loaded.character.classes[0]?.class.id).toBe('class.fighter')
    }
  })

  it('loads the PF1e multiclass golden as pf1e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    expect(loaded.system).toBe('pf1e')
    if (loaded.system === 'pf1e') {
      expect(loaded.character.classes.map((row) => row.class.id)).toEqual([
        'class.fighter',
        'class.wizard',
      ])
    }
  })

  it('loads the PF1e Synthesist golden as pf1e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/pf1e/synthesist-5.json'),
    )
    expect(loaded.system).toBe('pf1e')
    if (loaded.system === 'pf1e') {
      expect(loaded.character.classes[0]?.class.id).toBe('class.summoner')
      expect(loaded.character.classes[0]?.archetype?.id).toBe(
        'archetype.synthesist',
      )
      expect(loaded.character.companions[0]?.kind).toBe('eidolon')
    }
  })

  it('loads the PF1e Cleric 5 golden as pf1e with daily resources', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/pf1e/cleric-5.json'),
    )
    expect(loaded.system).toBe('pf1e')
    if (loaded.system === 'pf1e') {
      expect(loaded.character.classes[0]?.class.id).toBe('class.cleric')
      expect(loaded.character.play.dailyResources.length).toBe(2)
    }
  })

  it('loads the PF1e Prestige Duelist golden as pf1e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5-duelist-2.json'),
    )
    expect(loaded.system).toBe('pf1e')
    if (loaded.system === 'pf1e') {
      expect(loaded.character.classes[1]?.prestige).toBe(true)
    }
  })

  it('loads the PF1e Ranger companion golden as pf1e', () => {
    const loaded = parseLoadedSheet(
      readRepoFile('fixtures/characters/golden/pf1e/ranger-5-companion.json'),
    )
    expect(loaded.system).toBe('pf1e')
    if (loaded.system === 'pf1e') {
      expect(loaded.character.companions.length).toBe(2)
      expect(loaded.character.companions[0]?.kind).toBe('animalCompanion')
      expect(loaded.character.companions[1]?.kind).toBe('familiar')
    }
  })

  it('round-trips empty sheets for both systems', () => {
    const pf1e = parseLoadedSheet(serializePf1e(createPf1e()))
    const pf2e = parseLoadedSheet(serializePf2e(createPf2e()))
    expect(pf1e.system).toBe('pf1e')
    expect(pf2e.system).toBe('pf2e')
  })
})
