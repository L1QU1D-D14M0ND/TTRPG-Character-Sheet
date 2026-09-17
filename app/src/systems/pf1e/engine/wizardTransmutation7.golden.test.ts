import { describe, expect, it } from 'vitest'
import { parseCharacterJson, serializeCharacter } from '../character/saveLoad'
import {
  lookupCrbFeat,
  lookupCrbFeature,
  lookupCrbItem,
  lookupCrbSpell,
} from '../content'
import { compute } from './compute'
import { signed } from './types'
import { readRepoFile } from '../../../test/readRepoFile'

describe('golden PF1e Wizard 7 Transmutation Specialist (Flare Nightingale)', () => {
  const character = parseCharacterJson(
    readRepoFile('fixtures/characters/golden/pf1e/wizard-transmutation-7.json'),
  )
  const view = compute(character)

  it('loads as a prepared Transmutation specialist wizard with derived level 7', () => {
    expect(character.schemaVersion).toBe(1)
    expect(character.system).toBe('pf1e')
    expect(character.identity.characterName).toBe('Flare Nightingale')
    expect(character.identity.race).toEqual({ id: 'race.human', name: 'Human' })
    expect(character.classes[0]?.class.id).toBe('class.wizard')
    expect(character.classes[0]?.arcaneSchool).toEqual({
      specialized: 'transmutation',
      opposition: ['necromancy', 'enchantment'],
    })
    expect(character.spellcasting[0]?.ability).toBe('int')
    expect(view.level).toBe(7)
  })

  it('resolves CRB catalog stamps for feats, spells, and features', () => {
    expect(lookupCrbFeat('feat.scribe-scroll')?.name).toBe('Scribe Scroll')
    expect(lookupCrbFeat('feat.improved-initiative')?.name).toBe(
      'Improved Initiative',
    )
    expect(lookupCrbFeat('feat.point-blank-shot')?.name).toBe('Point-Blank Shot')
    expect(lookupCrbFeat('feat.eschew-materials')?.name).toBe('Eschew Materials')
    expect(lookupCrbFeat('feat.craft-wondrous-item')?.name).toBe(
      'Craft Wondrous Item',
    )
    expect(lookupCrbFeat('feat.craft-magic-arms-and-armor')?.name).toBe(
      'Craft Magic Arms and Armor',
    )
    expect(lookupCrbFeat('feat.craft-construct')?.name).toBe('Craft Construct')
    expect(lookupCrbFeat('feat.heighten-spell')?.name).toBe('Heighten Spell')

    expect(lookupCrbSpell('spell.detect-magic')?.name).toBe('Detect Magic')
    expect(lookupCrbSpell('spell.mage-armor')?.name).toBe('Mage Armor')
    expect(lookupCrbSpell('spell.haste')?.name).toBe('Haste')
    expect(lookupCrbSpell('spell.greater-invisibility')?.name).toBe(
      'Greater Invisibility',
    )
    expect(lookupCrbSpell('spell.named-bullet')).toBeNull()

    expect(lookupCrbFeature('feature.arcane-bond')?.name).toBe('Arcane Bond')
    expect(lookupCrbFeature('feature.physical-enhancement')?.name).toBe(
      'Physical Enhancement',
    )
    expect(lookupCrbFeature('feature.telekinetic-fist')?.name).toBe(
      'Telekinetic Fist',
    )

    expect(lookupCrbItem('item.spellbook')?.name).toBe('Spellbook')
  })

  it('round-trips Save then Load preserving school and documentary structures', () => {
    const reloaded = parseCharacterJson(serializeCharacter(character))
    expect(reloaded.identity.characterName).toBe('Flare Nightingale')
    expect(reloaded.derived).toBeUndefined()
    expect(reloaded.system).toBe('pf1e')
    expect(reloaded.classes[0]?.arcaneSchool).toEqual({
      specialized: 'transmutation',
      opposition: ['necromancy', 'enchantment'],
    })
    expect(reloaded.vitals.speeds).toEqual([
      { kind: 'land', feet: 30 },
      { kind: 'fly', feet: 60, notes: 'with Fly spell' },
    ])
    expect(reloaded.vitals.senses).toEqual([
      { name: 'normal', rangeFeet: null },
    ])
    expect(reloaded.vitals.resistances).toEqual([
      { type: 'DR', value: 17, notes: 'RD 17 on sheet' },
    ])
    expect(reloaded.play?.dailyResources).toEqual([
      { id: 'res-mana', name: 'Mana', max: 25, remaining: 25, resetsOn: 'daily' },
      { id: 'res-hero-points', name: 'Hero Points', max: 3, remaining: 0, resetsOn: 'other' },
    ])
    expect(reloaded.features).toHaveLength(3)
    expect(reloaded.features?.[0]?.feature.id).toBe('feature.arcane-bond')
  })

  it('computes ability modifiers from scores', () => {
    expect(view.abilityModifiers).toEqual({
      str: 0,
      dex: 6,
      con: 1,
      int: 6,
      wis: 1,
      cha: 1,
    })
  })

  it('computes BAB, saves, HP with override, AC, and initiative', () => {
    expect(view.bab).toBe(3)
    expect(view.babIteratives).toEqual([3])
    expect(view.fortitude).toBe(3)
    expect(view.reflex).toBe(8)
    expect(view.will).toBe(6)
    expect(view.maxHp).toBe(57)
    expect(view.ac).toBe(17)
    expect(view.touchAc).toBe(17)
    expect(view.flatFootedAc).toBe(11)
    expect(view.initiative).toBe(10)
    expect(view.cmb).toBe(3)
    expect(view.cmd).toBe(20)
  })

  it('computes spellcasting with specialist school bonus slots', () => {
    const casting = view.spellcasting['cast-wizard']
    expect(casting.casterLevel).toBe(7)
    expect(casting.abilityMod).toBe(6)
    expect(casting.dcByLevel[0]).toBe(16)
    expect(casting.dcByLevel[1]).toBe(17)
    expect(casting.dcByLevel[2]).toBe(18)
    expect(casting.dcByLevel[3]).toBe(19)
    expect(casting.dcByLevel[4]).toBe(20)
    expect(casting.bonusSlotsByLevel.slice(0, 5)).toEqual([0, 2, 2, 1, 1])
    expect(casting.classSlotsByLevel.slice(0, 5)).toEqual([4, 4, 3, 2, 1])
    expect(casting.schoolSlotsByLevel.slice(0, 5)).toEqual([0, 1, 1, 1, 1])
    expect(casting.slotMaxByLevel.slice(0, 5)).toEqual([4, 7, 6, 4, 3])
    expect(character.spellcasting[0]?.slots).toEqual([
      { spellLevel: 0, max: null, remaining: 4 },
      { spellLevel: 1, max: null, remaining: 7 },
      { spellLevel: 2, max: null, remaining: 6 },
      { spellLevel: 3, max: null, remaining: 4 },
      { spellLevel: 4, max: null, remaining: 3 },
    ])
  })

  it('tracks daily resources and attack snapshot', () => {
    const mana = character.play?.dailyResources?.find((r) => r.name === 'Mana')
    expect(mana?.remaining).toBe(25)
    expect(mana?.max).toBe(25)
    const heroPoints = character.play?.dailyResources?.find(
      (r) => r.name === 'Hero Points',
    )
    expect(heroPoints?.remaining).toBe(0)
    expect(heroPoints?.max).toBe(3)

    expect(view.attacks['attack-hoja-oscura']).toEqual({
      attack: 11,
      damage: '1d6+2',
      iteratives: [11],
    })
    expect(signed(view.attacks['attack-hoja-oscura'].attack)).toBe('+11')
  })
})
