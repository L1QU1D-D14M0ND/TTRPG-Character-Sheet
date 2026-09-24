import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptyClass,
  createEmptyFeat,
  createEmptyItem,
  createEmptySpellListEntry,
} from '../character/createRows'
import { applyCrbFeat } from '../content'
import {
  catalogId,
  catalogName,
  groupsFor,
  matchesName,
  SEARCH_ROW_THRESHOLD,
  setCatalogName,
  showsSearch,
  stamp,
  visibleCatalog,
  VISIBLE_ROW_LIMIT,
} from './catalogPicker'

describe('catalog picker kinds', () => {
  it('matches names case-insensitively and ignores surrounding space', () => {
    expect(matchesName('Fireball', 'fire')).toBe(true)
    expect(matchesName('Fireball', ' BALL ')).toBe(true)
    expect(matchesName('Fireball', 'missile')).toBe(false)
    expect(matchesName('Fireball', '')).toBe(true)
  })

  it('shows search only for kinds larger than the threshold', () => {
    expect(SEARCH_ROW_THRESHOLD).toBe(12)
    expect(showsSearch('feature')).toBe(false)
    expect(showsSearch('evolution')).toBe(false)
    expect(showsSearch('race')).toBe(false)
    expect(showsSearch('archetype')).toBe(false)
    expect(showsSearch('class')).toBe(false)
    expect(showsSearch('feat')).toBe(true)
    expect(showsSearch('item')).toBe(true)
    expect(showsSearch('spell')).toBe(true)
  })

  it('stamps a feat host and can rename it without changing id', () => {
    const stamped = stamp('feat', createEmptyFeat(), 'feat.power-attack')
    expect(stamped.feat.id).toBe('feat.power-attack')
    expect(stamped.feat.name).toBe('Power Attack')
    expect(stamped.category).toBe('combat')
    const renamed = setCatalogName('feat', stamped, 'Custom PA')
    expect(renamed.feat.id).toBe('feat.power-attack')
    expect(renamed.feat.name).toBe('Custom PA')
  })

  it('clears the catalog id on Custom without dropping the typed name', () => {
    const row = applyCrbFeat(createEmptyFeat(), 'feat.power-attack')
    const custom = stamp('feat', row, null)
    expect(catalogId('feat', custom)).toBeNull()
    expect(custom.feat.name).toBe('Power Attack')
  })

  it('stamps item overlay fields from the catalog', () => {
    const stamped = stamp('item', createEmptyItem(), 'weapon.kama')
    expect(stamped.item.name).toBe('Kama')
    expect(stamped.weapon?.properties).toEqual(['trip', 'monk'])
  })

  it('stamps race host with name and size, supports rename and Custom clear', () => {
    const base = createEmptyCharacter().identity
    const elf = stamp('race', base, 'race.elf')
    expect(catalogId('race', elf)).toBe('race.elf')
    expect(catalogName('race', elf)).toBe('Elf')
    expect(elf.size).toBe('medium')

    const halfling = stamp('race', base, 'race.halfling')
    expect(catalogId('race', halfling)).toBe('race.halfling')
    expect(catalogName('race', halfling)).toBe('Halfling')
    expect(halfling.size).toBe('small')

    const renamed = setCatalogName('race', elf, 'High Elf')
    expect(catalogId('race', renamed)).toBe('race.elf')
    expect(catalogName('race', renamed)).toBe('High Elf')
    expect(renamed.size).toBe('medium')

    const custom = stamp('race', elf, null)
    expect(catalogId('race', custom)).toBeNull()
    expect(catalogName('race', custom)).toBe('Elf')
    expect(custom.size).toBe('medium')
  })

  it('stamps class progressions and supports renaming and Custom clear', () => {
    const base = createEmptyClass()
    const fighter = stamp('class', base, 'class.fighter')
    expect(catalogId('class', fighter)).toBe('class.fighter')
    expect(catalogName('class', fighter)).toBe('Fighter')
    expect(fighter.hitDie).toBe(10)
    expect(fighter.babProgression).toBe('full')
    expect(fighter.saves.fort).toBe('good')
    expect(fighter.saves.ref).toBe('poor')

    const summoner = stamp('class', base, 'class.summoner')
    expect(catalogId('class', summoner)).toBe('class.summoner')
    expect(catalogName('class', summoner)).toBe('Summoner')
    expect(summoner.hitDie).toBe(8)
    expect(summoner.babProgression).toBe('threeQuarter')
    expect(summoner.saves.will).toBe('good')
    expect(summoner.skillPointsPerLevel).toBe(2)

    const renamed = setCatalogName('class', fighter, 'Champion')
    expect(catalogId('class', renamed)).toBe('class.fighter')
    expect(catalogName('class', renamed)).toBe('Champion')

    const custom = stamp('class', fighter, null)
    expect(catalogId('class', custom)).toBeNull()
    expect(catalogName('class', custom)).toBe('Fighter')
  })

  it('stamps archetype on class, supports rename, and clears on null', () => {
    const summoner = stamp('class', createEmptyClass(), 'class.summoner')
    const synthesist = stamp('archetype', summoner, 'archetype.synthesist')
    expect(catalogId('archetype', synthesist)).toBe('archetype.synthesist')
    expect(catalogName('archetype', synthesist)).toBe('Synthesist')
    expect(synthesist.archetype?.source).toEqual({ book: 'APG' })

    const renamed = setCatalogName('archetype', synthesist, 'Merged One')
    expect(catalogId('archetype', renamed)).toBe('archetype.synthesist')
    expect(catalogName('archetype', renamed)).toBe('Merged One')
    expect(renamed.archetype?.source).toEqual({ book: 'APG' })

    const cleared = stamp('archetype', synthesist, null)
    expect(catalogId('archetype', cleared)).toBeNull()
    expect(catalogName('archetype', cleared)).toBe('')
    expect(cleared.archetype).toBeUndefined()
  })

  it('stamps spells from CRB and APG across optgroups', () => {
    const groups = groupsFor('spell')
    expect(groups.length).toBe(2)
    expect(groups[0]?.labelKey).toBe('pf1e.identity.optgroupCrb')
    expect(groups[1]?.labelKey).toBe('pf1e.identity.optgroupApg')
    expect(groups[0]?.rows.some((r) => r.id === 'spell.mage-armor')).toBe(true)
    expect(
      groups[1]?.rows.some((r) => r.id === 'spell.rejuvenate-eidolon-lesser'),
    ).toBe(true)

    const base = createEmptySpellListEntry()
    const crb = stamp('spell', base, 'spell.mage-armor')
    expect(catalogId('spell', crb)).toBe('spell.mage-armor')
    expect(catalogName('spell', crb)).toBe('Mage Armor')
    expect(crb.spellLevel).toBe(1)

    const apg = stamp('spell', base, 'spell.summon-eidolon')
    expect(catalogId('spell', apg)).toBe('spell.summon-eidolon')
    expect(catalogName('spell', apg)).toBe('Summon Eidolon')
    expect(apg.spellLevel).toBe(2)
  })

  it('caps the rendered rows and reports how many it held back', () => {
    const groups = groupsFor('spell')
    const total = groups.reduce((sum, g) => sum + g.rows.length, 0)
    expect(total).toBeGreaterThan(VISIBLE_ROW_LIMIT)

    const visible = visibleCatalog(groups, '', null)
    const shown = visible.groups.reduce((sum, g) => sum + g.rows.length, 0)
    expect(shown).toBe(VISIBLE_ROW_LIMIT)
    expect(visible.hidden).toBe(total - VISIBLE_ROW_LIMIT)
    expect(visible.empty).toBe(false)
  })

  it('keeps the selected row visible even when it sorts past the cap', () => {
    const groups = groupsFor('spell')
    // An APG spell lives in the second group, far beyond the first page.
    const visible = visibleCatalog(groups, '', 'spell.summon-eidolon')
    const ids = visible.groups.flatMap((g) => g.rows.map((r) => r.id))
    expect(ids).toContain('spell.summon-eidolon')
    // The pinned row is extra, so the cap still governs the rest.
    expect(ids.length).toBe(VISIBLE_ROW_LIMIT + 1)
  })

  it('drops the overflow note once a query fits under the cap', () => {
    const visible = visibleCatalog(groupsFor('spell'), 'fireball', null)
    expect(visible.hidden).toBe(0)
    expect(visible.empty).toBe(false)
    expect(visible.groups.flatMap((g) => g.rows).map((r) => r.name)).toContain(
      'Fireball',
    )
  })

  it('reports empty rather than hidden when nothing matches', () => {
    const visible = visibleCatalog(groupsFor('spell'), 'zzzz-not-a-spell', null)
    expect(visible.empty).toBe(true)
    expect(visible.hidden).toBe(0)
    expect(visible.groups).toEqual([])
  })
})
