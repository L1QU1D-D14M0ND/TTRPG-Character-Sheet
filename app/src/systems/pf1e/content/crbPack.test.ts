import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptyClass,
  createEmptyFeat,
  createEmptyFeature,
  createEmptyItem,
  createEmptySpellListEntry,
} from '../character/createRows'
import { STANDARD_SKILLS } from '../character/standardSkills'
import { parseCharacterJson } from '../character/saveLoad'
import {
  applyClassProgression,
  applyCrbFeat,
  applyCrbFeature,
  applyCrbItem,
  applyCrbRace,
  applyCrbSpell,
  classSkillKeySet,
  lookupCrbClass,
  lookupCrbFeat,
  lookupCrbFeature,
  lookupCrbItem,
  lookupCrbRace,
  lookupCrbSpell,
  stampClassSkills,
  CRB_CLASSES,
  CRB_FEATS,
  CRB_FEATURES,
  CRB_ITEMS,
  CRB_RACES,
  CRB_SPELLS,
} from './crbPack'
import { readRepoFile, readRepoJson } from '../../../test/readRepoFile'
import {
  babFromProgression,
  saveFromProgression,
} from '../engine/progressions'
import { compute } from '../engine/compute'

describe('CRB pack batch 1: class progression catalog', () => {
  it('lists the 11 CRB base classes in chapter order', () => {
    expect(CRB_CLASSES.map((row) => row.id)).toEqual([
      'class.barbarian',
      'class.bard',
      'class.cleric',
      'class.druid',
      'class.fighter',
      'class.monk',
      'class.paladin',
      'class.ranger',
      'class.rogue',
      'class.sorcerer',
      'class.wizard',
    ])
  })

  it('Fighter and Wizard tags match the CRB class tables', () => {
    const fighter = lookupCrbClass('class.fighter')
    const wizard = lookupCrbClass('class.wizard')
    expect(fighter).toMatchObject({
      hitDie: 10,
      babProgression: 'full',
      saves: { fort: 'good', ref: 'poor', will: 'poor' },
    })
    expect(wizard).toMatchObject({
      hitDie: 6,
      babProgression: 'half',
      saves: { fort: 'poor', ref: 'poor', will: 'good' },
    })
    expect(babFromProgression(fighter!.babProgression, 5)).toBe(5)
    expect(babFromProgression(wizard!.babProgression, 5)).toBe(2)
    expect(saveFromProgression(fighter!.saves.fort, 5)).toBe(4)
    expect(saveFromProgression(wizard!.saves.will, 5)).toBe(4)
  })

  it('returns null for an unknown class id (isolate the row)', () => {
    expect(lookupCrbClass('class.alchemist')).toBeNull()
    expect(lookupCrbClass(null)).toBeNull()
    expect(lookupCrbClass('')).toBeNull()
  })

  it('applies catalog tags without changing levels or favored totals', () => {
    const row = createEmptyClass()
    row.levels = 5
    row.favored = { hp: 5, skillRanks: 1 }
    const fighter = applyClassProgression(row, 'class.fighter')
    expect(fighter.levels).toBe(5)
    expect(fighter.favored).toEqual({ hp: 5, skillRanks: 1 })
    expect(fighter.hitDie).toBe(10)
    expect(fighter.babProgression).toBe('full')
    expect(fighter.saves).toEqual({ fort: 'good', ref: 'poor', will: 'poor' })
    expect(fighter.class.id).toBe('class.fighter')
    expect(fighter.class.name).toBe('Fighter')
    expect(fighter.skillPointsPerLevel).toBe(2)
  })

  it('unknown apply clears id and leaves progressions', () => {
    const row = createEmptyClass()
    row.hitDie = 12
    row.babProgression = 'full'
    const custom = applyClassProgression(row, 'class.alchemist')
    expect(custom.class.id).toBeNull()
    expect(custom.hitDie).toBe(12)
    expect(custom.babProgression).toBe('full')
  })

  it('goldens use catalog ids that resolve', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const wizard = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const mixed = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    expect(lookupCrbClass(fighter.classes[0]?.class.id)).not.toBeNull()
    expect(lookupCrbClass(wizard.classes[0]?.class.id)).not.toBeNull()
    expect(lookupCrbClass(mixed.classes[0]?.class.id)?.id).toBe('class.fighter')
    expect(lookupCrbClass(mixed.classes[1]?.class.id)?.id).toBe('class.wizard')
  })

  it('pack manifest records batches 1–21 and W1–W7', () => {
    const pack = readRepoJson('content/pf1e/crb/pack.json') as {
      status: string
      batches: Array<{ id: number | string }>
    }
    expect(pack.status).toBe('batches-1-21-w1-w2-w3-w4-w5-w6-w7-complete')
    expect(pack.batches.map((batch) => batch.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 'W1',
      'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 20, 21,
    ])
  })
})

describe('CRB pack batch 8: Human race catalog', () => {
  it('includes Human with catalog size medium', () => {
    expect(lookupCrbRace('race.human')).toMatchObject({
      id: 'race.human',
      name: 'Human',
      size: 'medium',
    })
  })

  it('returns null for an unknown race id', () => {
    expect(lookupCrbRace('race.tiefling')).toBeNull()
    expect(lookupCrbRace(null)).toBeNull()
    expect(lookupCrbRace('')).toBeNull()
  })

  it('stamps Human id and name without rewriting ability scores', () => {
    const character = createEmptyCharacter()
    character.identity.size = 'small'
    character.abilities.str.score = 16
    const before = structuredClone(character.abilities)
    const identity = applyCrbRace(character.identity, 'race.human')
    expect(identity.race.id).toBe('race.human')
    expect(identity.race.name).toBe('Human')
    expect(identity.size).toBe('medium')
    expect(character.abilities).toEqual(before)
    expect(character.abilities.str.score).toBe(16)
  })

  it('unknown apply clears id and leaves the typed name and size', () => {
    const character = createEmptyCharacter()
    character.identity.size = 'small'
    character.identity.race = { id: 'race.human', name: 'Half-Elf' }
    const identity = applyCrbRace(character.identity, 'race.tiefling')
    expect(identity.race.id).toBeNull()
    expect(identity.race.name).toBe('Half-Elf')
    expect(identity.size).toBe('small')
  })

  it('goldens resolve race.human and keep scores as typed', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const wizard = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const mixed = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    expect(lookupCrbRace(fighter.identity.race.id)?.id).toBe('race.human')
    expect(lookupCrbRace(wizard.identity.race.id)?.id).toBe('race.human')
    expect(lookupCrbRace(mixed.identity.race.id)?.id).toBe('race.human')
    expect(fighter.abilities.str.score).toBe(18)
    expect(wizard.abilities.int.score).toBe(18)
  })
})

describe('CRB pack batch 9: class skills', () => {
  it('lists Fighter and Wizard class skills and 2 skill points per level', () => {
    const fighter = lookupCrbClass('class.fighter')
    const wizard = lookupCrbClass('class.wizard')
    expect(fighter?.skillPointsPerLevel).toBe(2)
    expect(wizard?.skillPointsPerLevel).toBe(2)
    expect(fighter?.classSkills).toEqual([
      'climb',
      'handle-animal',
      'intimidate',
      'ride',
      'survival',
      'swim',
      'knowledge-dungeoneering',
      'knowledge-engineering',
    ])
    expect(wizard?.classSkills).toContain('spellcraft')
    expect(wizard?.classSkills).toContain('knowledge-arcana')
    expect(wizard?.classSkills).not.toContain('climb')
    expect(fighter?.classSkills).not.toContain('spellcraft')
  })

  it('stamps Fighter class-skill checkboxes and leaves ranks alone', () => {
    const character = createEmptyCharacter()
    const row = applyClassProgression(createEmptyClass(), 'class.fighter')
    const skills = stampClassSkills(character.skills, [row])
    const flagged = skills.filter((skill) => skill.classSkill).map((skill) => skill.key)
    expect(flagged).toEqual([
      'climb',
      'handle-animal',
      'intimidate',
      'ride',
      'survival',
      'swim',
      'knowledge-dungeoneering',
      'knowledge-engineering',
    ])
    expect(skills.every((skill) => skill.ranks === 0)).toBe(true)
  })

  it('unions Fighter and Wizard class skills', () => {
    const fighter = applyClassProgression(createEmptyClass(), 'class.fighter')
    const wizard = applyClassProgression(createEmptyClass(), 'class.wizard')
    const keys = classSkillKeySet([fighter, wizard])
    expect(keys.has('climb')).toBe(true)
    expect(keys.has('spellcraft')).toBe(true)
    expect(keys.has('perception')).toBe(false)
  })

  it('does not rewrite Craft/Perform/Profession extras', () => {
    const character = createEmptyCharacter()
    character.skills.push({
      key: 'craft-weapons',
      name: 'Craft (weapons)',
      ability: 'int',
      ranks: 1,
      classSkill: true,
      armorPenaltyApplies: false,
      misc: 0,
    })
    const row = applyClassProgression(createEmptyClass(), 'class.wizard')
    const skills = stampClassSkills(character.skills, [row])
    const craft = skills.find((skill) => skill.key === 'craft-weapons')
    expect(craft?.classSkill).toBe(true)
    expect(craft?.ranks).toBe(1)
    expect(skills.find((skill) => skill.key === 'climb')?.classSkill).toBe(false)
  })

  it('matches golden class-skill flags after a stamp', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const stamped = stampClassSkills(fighter.skills, fighter.classes)
    for (const skill of fighter.skills) {
      const next = stamped.find((row) => row.key === skill.key)
      expect(next?.classSkill).toBe(skill.classSkill)
    }
  })
})

describe('CRB pack batch 10: weapons and armor catalog', () => {
  it('lists the golden item ids', () => {
    expect(CRB_ITEMS.map((row) => row.id)).toEqual([
      'weapon.gauntlet',
      'weapon.dagger',
      'weapon.punching-dagger',
      'weapon.spiked-gauntlet',
      'weapon.light-mace',
      'weapon.sickle',
      'weapon.club',
      'weapon.heavy-mace',
      'weapon.morningstar',
      'weapon.shortspear',
      'weapon.longspear',
      'weapon.quarterstaff',
      'weapon.spear',
      'weapon.blowgun',
      'weapon.heavy-crossbow',
      'weapon.light-crossbow',
      'weapon.dart',
      'weapon.javelin',
      'weapon.sling',
      'weapon.throwing-axe',
      'weapon.light-hammer',
      'weapon.handaxe',
      'weapon.kukri',
      'weapon.light-pick',
      'weapon.sap',
      'weapon.starknife',
      'weapon.short-sword',
      'weapon.battleaxe',
      'weapon.flail',
      'weapon.longsword',
      'weapon.heavy-pick',
      'weapon.rapier',
      'weapon.scimitar',
      'weapon.trident',
      'weapon.warhammer',
      'weapon.falchion',
      'weapon.glaive',
      'weapon.greataxe',
      'weapon.greatclub',
      'weapon.heavy-flail',
      'weapon.greatsword',
      'weapon.guisarme',
      'weapon.halberd',
      'weapon.lance',
      'weapon.ranseur',
      'weapon.scythe',
      'weapon.longbow',
      'weapon.composite-longbow',
      'weapon.shortbow',
      'weapon.composite-shortbow',
      'weapon.kama',
      'weapon.nunchaku',
      'weapon.sai',
      'weapon.siangham',
      'weapon.bastard-sword',
      'weapon.dwarven-waraxe',
      'weapon.whip',
      'weapon.orc-double-axe',
      'weapon.elven-curve-blade',
      'weapon.dire-flail',
      'weapon.gnome-hooked-hammer',
      'weapon.two-bladed-sword',
      'weapon.dwarven-urgrosh',
      'weapon.bolas',
      'weapon.hand-crossbow',
      'weapon.repeating-heavy-crossbow',
      'weapon.repeating-light-crossbow',
      'weapon.net',
      'weapon.shuriken',
      'weapon.halfling-sling-staff',
      'armor.chain-shirt',
      'armor.chainmail',
      'armor.padded',
      'armor.leather',
      'armor.studded-leather',
      'armor.hide',
      'armor.scale-mail',
      'armor.breastplate',
      'armor.splint-mail',
      'armor.banded-mail',
      'armor.half-plate',
      'armor.full-plate',
      'shield.buckler',
      'shield.light-wooden',
      'shield.light-steel',
      'shield.heavy-wooden',
      'shield.heavy-steel',
      'shield.tower',
      'item.armor-spikes',
      'item.shield-spikes',
      'weapon.locked-gauntlet',
      'item.spellbook',
      'item.blowgun-darts',
      'item.crossbow-bolts',
      'item.sling-bullets',
      'item.arrows',
      'item.repeating-crossbow-bolts',
      'weapon.adamantine-dagger',
      'weapon.silver-dagger',
      'weapon.cold-iron-longsword',
      'weapon.dagger-of-venom',
      'weapon.flame-tongue',
      'weapon.holy-avenger',
      'weapon.sun-blade',
      'weapon.luck-blade',
      'weapon.sword-of-subtlety',
      'weapon.sword-of-the-planes',
      'weapon.nine-lives-stealer',
      'weapon.frost-brand',
      'weapon.mace-of-smiting',
      'weapon.dwarven-thrower',
      'armor.mithral-shirt',
      'armor.dragonhide-plate',
      'armor.elven-chain',
      'armor.rhino-hide',
      'armor.celestial-armor',
      'armor.plate-armor-of-the-deep',
      'armor.breastplate-of-command',
      'shield.caster-shield',
      'shield.spined-shield',
      'shield.lions-shield',
      'shield.winged-shield',
      'shield.absorbing-shield',
    ])
    expect(lookupCrbItem('armor.chainmail')).toMatchObject({
      name: 'Chainmail',
      pounds: 40,
      armor: { acBonus: 6, maxDex: 2, armorCheckPenalty: -5 },
    })
    expect(lookupCrbItem('weapon.longsword')).toMatchObject({
      name: 'Longsword',
      pounds: 4,
      weapon: { damageDice: '1d8', critRange: 19, critMultiplier: 2 },
    })
  })

  it('returns null for an unknown item id', () => {
    expect(lookupCrbItem('item.bedroll')).toBeNull()
    expect(lookupCrbItem(null)).toBeNull()
    expect(lookupCrbItem('')).toBeNull()
  })

  it('stamps documentary fields without changing quantity or location', () => {
    const row = createEmptyItem()
    row.quantity = 2
    row.location = 'equipped'
    const chainmail = applyCrbItem(row, 'armor.chainmail')
    expect(chainmail.quantity).toBe(2)
    expect(chainmail.location).toBe('equipped')
    expect(chainmail.item.id).toBe('armor.chainmail')
    expect(chainmail.item.name).toBe('Chainmail')
    expect(chainmail.pounds).toBe(40)
    expect(chainmail.armor).toEqual({
      acBonus: 6,
      maxDex: 2,
      armorCheckPenalty: -5,
      spellFailurePercent: 30,
    })
    expect(chainmail.weapon).toBeUndefined()
  })

  it('clears the other subobject when switching kind', () => {
    const chainmail = applyCrbItem(createEmptyItem(), 'armor.chainmail')
    const longsword = applyCrbItem(chainmail, 'weapon.longsword')
    expect(longsword.weapon?.damageDice).toBe('1d8')
    expect(longsword.armor).toBeUndefined()
    const gear = applyCrbItem(longsword, 'item.spellbook')
    expect(gear.weapon).toBeUndefined()
    expect(gear.armor).toBeUndefined()
    expect(gear.shield).toBeUndefined()
    expect(gear.pounds).toBe(3)
    const buckler = applyCrbItem(gear, 'shield.buckler')
    expect(buckler.shield?.acBonus).toBe(1)
    expect(buckler.armor).toBeUndefined()
    expect(buckler.weapon).toBeUndefined()
  })

  it('unknown apply clears id and leaves the rest of the row', () => {
    const row = applyCrbItem(createEmptyItem(), 'weapon.longsword')
    const custom = applyCrbItem(row, 'item.bedroll')
    expect(custom.item.id).toBeNull()
    expect(custom.item.name).toBe('Longsword')
    expect(custom.pounds).toBe(4)
    expect(custom.weapon?.damageDice).toBe('1d8')
  })

  it('goldens use catalog ids that resolve', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const wizard = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const mixed = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    for (const character of [fighter, wizard, mixed]) {
      for (const row of character.inventory.items) {
        expect(lookupCrbItem(row.item.id)).not.toBeNull()
      }
    }
    expect(lookupCrbItem(fighter.inventory.items[0]?.item.id)?.id).toBe(
      'armor.chainmail',
    )
    expect(lookupCrbItem(wizard.inventory.items[0]?.item.id)?.id).toBe(
      'weapon.quarterstaff',
    )
    expect(lookupCrbItem(mixed.inventory.items[0]?.item.id)?.id).toBe(
      'armor.chain-shirt',
    )
  })
})

const STANDARD_SKILL_KEY_SET = new Set(STANDARD_SKILLS.map((row) => row.key))

describe('CRB pack batch 11: remaining CRB classes', () => {
  it('uses the same progression tags as the CRB class tables', () => {
    const table = [
      {
        id: 'class.barbarian',
        hitDie: 12,
        babProgression: 'full',
        saves: { fort: 'good', ref: 'poor', will: 'poor' },
        skillPointsPerLevel: 4,
      },
      {
        id: 'class.bard',
        hitDie: 8,
        babProgression: 'threeQuarter',
        saves: { fort: 'poor', ref: 'good', will: 'good' },
        skillPointsPerLevel: 6,
      },
      {
        id: 'class.cleric',
        hitDie: 8,
        babProgression: 'threeQuarter',
        saves: { fort: 'good', ref: 'poor', will: 'good' },
        skillPointsPerLevel: 2,
      },
      {
        id: 'class.druid',
        hitDie: 8,
        babProgression: 'threeQuarter',
        saves: { fort: 'good', ref: 'poor', will: 'good' },
        skillPointsPerLevel: 4,
      },
      {
        id: 'class.monk',
        hitDie: 8,
        babProgression: 'threeQuarter',
        saves: { fort: 'good', ref: 'good', will: 'good' },
        skillPointsPerLevel: 4,
      },
      {
        id: 'class.paladin',
        hitDie: 10,
        babProgression: 'full',
        saves: { fort: 'good', ref: 'poor', will: 'good' },
        skillPointsPerLevel: 2,
      },
      {
        id: 'class.ranger',
        hitDie: 10,
        babProgression: 'full',
        saves: { fort: 'good', ref: 'good', will: 'poor' },
        skillPointsPerLevel: 6,
      },
      {
        id: 'class.rogue',
        hitDie: 8,
        babProgression: 'threeQuarter',
        saves: { fort: 'poor', ref: 'good', will: 'poor' },
        skillPointsPerLevel: 8,
      },
      {
        id: 'class.sorcerer',
        hitDie: 6,
        babProgression: 'half',
        saves: { fort: 'poor', ref: 'poor', will: 'good' },
        skillPointsPerLevel: 2,
      },
    ] as const

    for (const expected of table) {
      const found = lookupCrbClass(expected.id)
      expect(found).toMatchObject(expected)
      expect(babFromProgression(found!.babProgression, 5)).toBe(
        expected.babProgression === 'full'
          ? 5
          : expected.babProgression === 'threeQuarter'
            ? 3
            : 2,
      )
      expect(saveFromProgression(found!.saves.fort, 5)).toBe(
        expected.saves.fort === 'good' ? 4 : 1,
      )
    }
  })

  it('keeps class-skill keys on the seeded skill list', () => {
    for (const row of CRB_CLASSES) {
      expect(row.classSkills.length).toBeGreaterThan(0)
      expect(new Set(row.classSkills).size).toBe(row.classSkills.length)
      for (const key of row.classSkills) {
        expect(STANDARD_SKILL_KEY_SET.has(key)).toBe(true)
      }
    }
  })

  it('stamps Rogue class skills through the existing apply/stamp path', () => {
    const character = createEmptyCharacter()
    const row = applyClassProgression(createEmptyClass(), 'class.rogue')
    const skills = stampClassSkills(character.skills, [row])
    const flagged = skills
      .filter((skill) => skill.classSkill)
      .map((skill) => skill.key)
    expect(flagged).toContain('disable-device')
    expect(flagged).toContain('stealth')
    expect(flagged).not.toContain('spellcraft')
    expect(skills.every((skill) => skill.ranks === 0)).toBe(true)
    expect(row.hitDie).toBe(8)
    expect(row.skillPointsPerLevel).toBe(8)
  })

  it('unions a new CRB class with Fighter using the same checkbox stamp', () => {
    const fighter = applyClassProgression(createEmptyClass(), 'class.fighter')
    const rogue = applyClassProgression(createEmptyClass(), 'class.rogue')
    const keys = classSkillKeySet([fighter, rogue])
    expect(keys.has('climb')).toBe(true)
    expect(keys.has('disable-device')).toBe(true)
    expect(keys.has('spellcraft')).toBe(false)
  })
})

describe('CRB pack batch 12: feat catalog', () => {
  it('lists the golden feat ids', () => {
    const ids = CRB_FEATS.map((row) => row.id)
    for (const goldenId of [
      'feat.improved-initiative',
      'feat.power-attack',
      'feat.scribe-scroll',
      'feat.spell-focus',
      'feat.weapon-focus',
    ]) {
      expect(ids).toContain(goldenId)
    }
    expect(lookupCrbFeat('feat.power-attack')).toMatchObject({
      name: 'Power Attack',
      category: 'combat',
    })
    expect(lookupCrbFeat('feat.scribe-scroll')?.category).toBe('itemCreation')
  })

  it('returns null for an unknown feat id', () => {
    expect(lookupCrbFeat('feat.extra-evolution')).toBeNull()
    expect(lookupCrbFeat(null)).toBeNull()
    expect(lookupCrbFeat('')).toBeNull()
  })

  it('stamps id, name, and category without changing level or summary', () => {
    const row = createEmptyFeat()
    row.levelGained = 3
    row.summary = 'Keep this'
    const power = applyCrbFeat(row, 'feat.power-attack')
    expect(power.levelGained).toBe(3)
    expect(power.summary).toBe('Keep this')
    expect(power.feat.id).toBe('feat.power-attack')
    expect(power.feat.name).toBe('Power Attack')
    expect(power.category).toBe('combat')
  })

  it('unknown apply clears id and leaves the typed name', () => {
    const row = applyCrbFeat(createEmptyFeat(), 'feat.weapon-focus')
    row.feat.name = 'Weapon Focus (longsword)'
    const custom = applyCrbFeat(row, 'feat.extra-evolution')
    expect(custom.feat.id).toBeNull()
    expect(custom.feat.name).toBe('Weapon Focus (longsword)')
    expect(custom.category).toBe('combat')
  })

  it('goldens use catalog ids that resolve', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const wizard = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const mixed = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    for (const character of [fighter, wizard, mixed]) {
      for (const row of character.feats) {
        expect(lookupCrbFeat(row.feat.id)).not.toBeNull()
      }
    }
    expect(lookupCrbFeat(fighter.feats[0]?.feat.id)?.id).toBe('feat.weapon-focus')
    expect(lookupCrbFeat(wizard.feats[1]?.feat.id)?.id).toBe('feat.spell-focus')
  })
})

describe('CRB pack features: Wizard school powers and arcane bond', () => {
  it('lists the Wizard school powers and arcane bond', () => {
    const ids = CRB_FEATURES.map((row) => row.id)
    expect(ids).toContain('feature.arcane-bond')
    expect(ids).toContain('feature.physical-enhancement')
    expect(ids).toContain('feature.telekinetic-fist')
    expect(lookupCrbFeature('feature.physical-enhancement')).toMatchObject({
      name: 'Physical Enhancement',
    })
  })

  it('stamps id and name without changing levelGained, summary, or notes', () => {
    const row = createEmptyFeature()
    row.levelGained = 5
    row.summary = 'Keep summary'
    row.notes = 'Custom notes'
    const stamped = applyCrbFeature(row, 'feature.physical-enhancement')
    expect(stamped.feature.id).toBe('feature.physical-enhancement')
    expect(stamped.feature.name).toBe('Physical Enhancement')
    expect(stamped.levelGained).toBe(5)
    expect(stamped.summary).toBe('Keep summary')
    expect(stamped.notes).toBe('Custom notes')
  })

  it('returns null for an unknown feature id', () => {
    expect(lookupCrbFeature('feature.unknown')).toBeNull()
    expect(lookupCrbFeature(null)).toBeNull()
    expect(lookupCrbFeature('')).toBeNull()
  })
})

describe('CRB pack batch 13: spell catalog', () => {
  it('lists the golden spell ids', () => {
    const ids = CRB_SPELLS.map((row) => row.id)
    for (const goldenId of [
      'spell.detect-magic',
      'spell.fireball',
      'spell.light',
      'spell.magic-missile',
    ]) {
      expect(ids).toContain(goldenId)
    }
    expect(lookupCrbSpell('spell.fireball')).toMatchObject({
      name: 'Fireball',
      spellLevel: 3,
    })
    expect(lookupCrbSpell('spell.detect-magic')?.spellLevel).toBe(0)
    expect(lookupCrbSpell('spell.magic-missile')?.spellLevel).toBe(1)
  })

  it('returns null for an unknown spell id', () => {
    expect(lookupCrbSpell('spell.unknown-spell-id')).toBeNull()
    expect(lookupCrbSpell(null)).toBeNull()
    expect(lookupCrbSpell('')).toBeNull()
  })

  it('stamps id, name, and level without changing prepared or summary', () => {
    const row = createEmptySpellListEntry(1)
    row.prepared = true
    row.summary = 'Keep this'
    row.usesPerDay = 2
    const fireball = applyCrbSpell(row, 'spell.fireball')
    expect(fireball.prepared).toBe(true)
    expect(fireball.summary).toBe('Keep this')
    expect(fireball.usesPerDay).toBe(2)
    expect(fireball.spell.id).toBe('spell.fireball')
    expect(fireball.spell.name).toBe('Fireball')
    expect(fireball.spellLevel).toBe(3)
  })

  it('unknown apply clears id and leaves the typed name and level', () => {
    const row = applyCrbSpell(createEmptySpellListEntry(), 'spell.fireball')
    row.spell.name = 'Fireball (empower)'
    const custom = applyCrbSpell(row, 'spell.unknown-spell-id')
    expect(custom.spell.id).toBeNull()
    expect(custom.spell.name).toBe('Fireball (empower)')
    expect(custom.spellLevel).toBe(3)
  })

  it('goldens use catalog ids that resolve', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const wizard = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/wizard-5.json'),
    )
    const mixed = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-2-wizard-3.json'),
    )
    expect(fighter.spellcasting).toEqual([])
    for (const character of [wizard, mixed]) {
      for (const entry of character.spellcasting) {
        for (const row of [...entry.cantrips, ...entry.spells]) {
          expect(lookupCrbSpell(row.spell.id)).not.toBeNull()
        }
      }
    }
    expect(lookupCrbSpell(wizard.spellcasting[0]?.cantrips[0]?.spell.id)?.id).toBe(
      'spell.detect-magic',
    )
    expect(lookupCrbSpell(wizard.spellcasting[0]?.spells[1]?.spell.id)?.id).toBe(
      'spell.fireball',
    )
    expect(lookupCrbSpell(mixed.spellcasting[0]?.spells[0]?.spell.id)?.id).toBe(
      'spell.magic-missile',
    )
  })
})

describe('CRB pack batch 14: remaining player races and size stamp', () => {
  it('lists the 7 CRB player races in chapter order', () => {
    expect(CRB_RACES.map((row) => row.id)).toEqual([
      'race.dwarf',
      'race.elf',
      'race.gnome',
      'race.half-elf',
      'race.half-orc',
      'race.halfling',
      'race.human',
    ])
    expect(lookupCrbRace('race.gnome')).toMatchObject({
      id: 'race.gnome',
      name: 'Gnome',
      size: 'small',
    })
    expect(lookupCrbRace('race.halfling')?.size).toBe('small')
    expect(lookupCrbRace('race.elf')?.size).toBe('medium')
    expect(lookupCrbRace('race.half-elf')?.size).toBe('medium')
  })

  it('stamps Gnome and Halfling as small without rewriting ability scores', () => {
    const character = createEmptyCharacter()
    character.identity.size = 'medium'
    character.abilities.dex.score = 16
    const before = structuredClone(character.abilities)
    const gnome = applyCrbRace(character.identity, 'race.gnome')
    expect(gnome.race.id).toBe('race.gnome')
    expect(gnome.race.name).toBe('Gnome')
    expect(gnome.size).toBe('small')
    const halfling = applyCrbRace(character.identity, 'race.halfling')
    expect(halfling.size).toBe('small')
    expect(character.abilities).toEqual(before)
  })

  it('does not grant Human extra skill ranks to Half-Elf', () => {
    const character = createEmptyCharacter()
    const fighter = applyClassProgression(createEmptyClass(), 'class.fighter')
    fighter.levels = 5
    character.classes = [fighter]
    character.identity = applyCrbRace(character.identity, 'race.half-elf')
    expect(character.identity.race.id).toBe('race.half-elf')
    expect(compute(character).skillRanksBudget).toBe(10)
    character.identity = applyCrbRace(character.identity, 'race.human')
    expect(compute(character).skillRanksBudget).toBe(15)
  })

  it('goldens stay Medium; Synthesist Half-Elf stays custom', () => {
    const fighter = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
    )
    const synthesist = parseCharacterJson(
      readRepoFile('fixtures/characters/golden/pf1e/synthesist-5.json'),
    )
    expect(fighter.identity.size).toBe('medium')
    expect(lookupCrbRace(fighter.identity.race.id)?.id).toBe('race.human')
    expect(synthesist.identity.race.id).toBeNull()
    expect(synthesist.identity.race.name).toBe('Half-Elf')
    expect(lookupCrbRace(synthesist.identity.race.id)).toBeNull()
    expect(lookupCrbRace('race.half-elf')).not.toBeNull()
  })
})
