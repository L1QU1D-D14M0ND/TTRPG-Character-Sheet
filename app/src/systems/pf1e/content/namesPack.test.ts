import { describe, expect, it } from 'vitest'
import { listRepoFiles, readRepoJson } from '../../../test/readRepoFile'
import {
  displayName,
  localizedIds,
  localizedName,
  LOCALIZED_NAME_ROWS,
} from './namesPack'
import {
  listArchetypes,
  listClassProgressions,
  listEvolutions,
  listFeats,
  listFeatures,
  listItems,
  listRaces,
  listSpells,
} from './packRegistry'
import './crbPack'
import './apgPack'

function allCatalogRows(): { id: string; name: string }[] {
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

describe('localized catalog names (Phase 5.2)', () => {
  it('covers every registered catalog row', () => {
    // The point of the slice: a Spanish player must not meet a half-English
    // list. A new mechanic row has to arrive with its translation.
    const untranslated = allCatalogRows()
      .filter((row) => localizedName(row.id, 'es') === null)
      .map((row) => `${row.id} (${row.name})`)
    expect(untranslated).toEqual([])
  })

  it('translates every row to something other than its English name', () => {
    // A row copied verbatim is almost always an untranslated placeholder.
    // Proper nouns that are genuinely the same in both languages are listed
    // here so the check stays meaningful rather than being switched off.
    const SAME_IN_BOTH = new Set([
      'weapon.kukri',
      'weapon.kama',
      'weapon.nunchaku',
      'weapon.sai',
      'weapon.siangham',
      'weapon.shuriken',
      'weapon.bolas',
      'weapon.ranseur',
      'spell.geas-quest',
      'spell.lesser-geas',
    ])
    const copied = allCatalogRows()
      .filter(
        (row) =>
          !SAME_IN_BOTH.has(row.id) && localizedName(row.id, 'es') === row.name,
      )
      .map((row) => row.id)
    expect(copied).toEqual([])
  })

  it('does not translate ids of rows that no catalog ships', () => {
    // A stale translation is a silent lie about coverage: the count looks
    // right while a real row goes untranslated.
    const known = new Set(allCatalogRows().map((row) => row.id))
    const orphans = localizedIds().filter((id) => !known.has(id))
    expect(orphans).toEqual([])
  })

  it('returns null for English, unknown ids, and empty ids', () => {
    expect(localizedName('weapon.longsword', 'en')).toBeNull()
    expect(localizedName('weapon.not-a-real-id', 'es')).toBeNull()
    expect(localizedName(null, 'es')).toBeNull()
    expect(localizedName(undefined, 'es')).toBeNull()
    expect(localizedName('', 'es')).toBeNull()
  })

  it('falls back to the English name when no translation exists', () => {
    expect(displayName('weapon.longsword', 'Longsword', 'en')).toBe('Longsword')
    expect(displayName('weapon.not-a-real-id', 'Homebrew Axe', 'es')).toBe(
      'Homebrew Axe',
    )
    expect(displayName(null, 'Custom', 'es')).toBe('Custom')
  })

  it('reads curated names for rows across both mechanic packs', () => {
    expect(localizedName('weapon.longsword', 'es')).toBe('Espada larga')
    expect(localizedName('class.wizard', 'es')).toBe('Mago')
    expect(localizedName('spell.fireball', 'es')).toBe('Bola de fuego')
    expect(localizedName('feat.power-attack', 'es')).toBe('Ataque poderoso')
    expect(localizedName('race.half-elf', 'es')).toBe('Semielfo')
    // APG, so the pack is not CRB-only.
    expect(localizedName('class.summoner', 'es')).toBe('Conjurador')
    expect(localizedName('archetype.synthesist', 'es')).toBe('Sintetista')
  })

  it('keeps composed spell families consistent with their base spell', () => {
    // "Mass Cure Light Wounds" is built from "Cure Light Wounds", so the two
    // cannot drift apart the way two hand-typed strings would.
    expect(localizedName('spell.cure-light-wounds', 'es')).toBe(
      'Curar heridas leves',
    )
    expect(localizedName('spell.mass-cure-light-wounds', 'es')).toBe(
      'Curar heridas leves en masa',
    )
    expect(localizedName('spell.summon-monster-i', 'es')).toBe(
      'Convocar monstruo I',
    )
    expect(localizedName('spell.summon-monster-ix', 'es')).toBe(
      'Convocar monstruo IX',
    )
  })

  it('gives distinct Spanish names to rows with distinct English names', () => {
    // Two different mechanics collapsing onto one label is unusable in a
    // picker. The one legitimate clash mirrors an English clash.
    const byName = new Map<string, string[]>()
    for (const row of allCatalogRows()) {
      const es = localizedName(row.id, 'es')!
      byName.set(es, [...(byName.get(es) ?? []), row.name])
    }
    const clashes = [...byName.entries()]
      .filter(([, names]) => new Set(names).size > 1)
      .map(([es, names]) => `${es}: ${names.join(' / ')}`)
    expect(clashes).toEqual([])
  })

  it('ships one row per id', () => {
    const ids = LOCALIZED_NAME_ROWS.map((row) => row.id)
    expect(ids.length).toBe(new Set(ids).size)
  })

  it('stays mechanics-only and carries no OGL notice', () => {
    const pack = readRepoJson('content/pf1e/names/pack.json') as {
      contentKind?: unknown
      oglNoticeRequired?: unknown
    }
    expect(pack.contentKind).toBe('mechanics-only')
    expect(pack.oglNoticeRequired).toBe(false)
    // A name is not prose, so the notice files must not appear here.
    const files = listRepoFiles('content/pf1e/names')
    expect(files).toEqual(['content/pf1e/names/es.json', 'content/pf1e/names/pack.json'])
  })
})
