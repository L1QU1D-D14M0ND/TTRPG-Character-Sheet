import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { createEmptyAttack, createEmptyClass, createEmptySpellcasting } from '../character/createRows'
import { compute } from './compute'
import {
  abilityModifierFromScore,
  quadrupedCarryMultiplier,
  sizeCarryMultiplier,
} from './abilities'
import { loadThresholds, mediumBipedHeavyLoad } from './encumbrance'
import {
  babFromProgression,
  iterativeAttacks,
  saveFromProgression,
} from './progressions'
import { bonusSpellsFromAbility, spellDc } from './spellcasting'
import { ranksExceedLevel } from './vitals'

describe('abilityModifierFromScore', () => {
  it('uses floor((score-10)/2)', () => {
    expect(abilityModifierFromScore(18)).toBe(4)
    expect(abilityModifierFromScore(9)).toBe(-1)
    expect(abilityModifierFromScore(10)).toBe(0)
    expect(abilityModifierFromScore(11)).toBe(0)
  })
})

describe('progressions', () => {
  it('uses CRB BAB tables', () => {
    expect(babFromProgression('full', 5)).toBe(5)
    expect(babFromProgression('threeQuarter', 5)).toBe(3)
    expect(babFromProgression('half', 5)).toBe(2)
  })

  it('uses CRB save tables', () => {
    expect(saveFromProgression('good', 5)).toBe(4)
    expect(saveFromProgression('poor', 5)).toBe(1)
    expect(saveFromProgression('good', 1)).toBe(2)
    expect(saveFromProgression('poor', 1)).toBe(0)
  })

  it('starts extra attacks at BAB +6, not +5', () => {
    expect(iterativeAttacks(5)).toEqual([5])
    expect(iterativeAttacks(6)).toEqual([6, 1])
    expect(iterativeAttacks(11)).toEqual([11, 6, 1])
    expect(iterativeAttacks(16)).toEqual([16, 11, 6, 1])
  })
})

describe('encumbrance', () => {
  it('matches the CRB Strength heavy-load table', () => {
    expect(mediumBipedHeavyLoad(10)).toBe(100)
    expect(mediumBipedHeavyLoad(16)).toBe(230)
    expect(mediumBipedHeavyLoad(18)).toBe(300)
    expect(mediumBipedHeavyLoad(20)).toBe(400)
    const t = loadThresholds(18, 'medium')
    expect(t).toEqual({ light: 100, medium: 200, heavy: 300 })
  })
})

describe('spell DC and bonus slots', () => {
  it('uses 10 + spell level + ability mod', () => {
    expect(spellDc(0, 4)).toBe(14)
    expect(spellDc(3, 4)).toBe(17)
  })

  it('matches the CRB bonus-spells table', () => {
    expect(bonusSpellsFromAbility(18, 0)).toBe(0)
    expect(bonusSpellsFromAbility(18, 1)).toBe(1)
    expect(bonusSpellsFromAbility(18, 4)).toBe(1)
    expect(bonusSpellsFromAbility(18, 5)).toBe(0)
    expect(bonusSpellsFromAbility(20, 1)).toBe(2)
    expect(bonusSpellsFromAbility(10, 1)).toBe(0)
  })

  it('computes caster level and honors a DC override', () => {
    const character = createEmptyCharacter()
    const wizard = createEmptyClass()
    wizard.id = 'class-row-wizard'
    wizard.class = { id: 'class.wizard', name: 'Wizard' }
    wizard.levels = 5
    wizard.babProgression = 'half'
    wizard.saves = { fort: 'poor', ref: 'poor', will: 'good' }
    character.classes = [wizard]
    character.abilities.int.score = 18
    const entry = createEmptySpellcasting()
    entry.id = 'cast-test'
    entry.classRowId = 'class-row-wizard'
    character.spellcasting = [entry]
    const view = compute(character)
    expect(view.spellcasting['cast-test'].casterLevel).toBe(5)
    expect(view.spellcasting['cast-test'].dcByLevel[1]).toBe(15)

    character.overrides['derived.spellcasting.cast-test.dcByLevel.1'] = {
      value: 16,
    }
    const overridden = compute(character)
    expect(overridden.spellcasting['cast-test'].dcByLevel[1]).toBe(16)
    expect(overridden.overriddenPaths).toContain(
      'derived.spellcasting.cast-test.dcByLevel.1',
    )
  })
})

describe('compute empty sheet', () => {
  it('uses scores of 10 and no class rows', () => {
    const character = createEmptyCharacter()
    const view = compute(character)
    expect(view.level).toBe(0)
    expect(view.abilityModifiers.str).toBe(0)
    expect(view.bab).toBe(0)
    expect(view.babIteratives).toEqual([0])
    expect(view.maxHp).toBe(0)
    expect(view.ac).toBe(10)
    expect(view.touchAc).toBe(10)
    expect(view.flatFootedAc).toBe(10)
    expect(view.cmb).toBe(0)
    expect(view.cmd).toBe(10)
    expect(view.flatFootedCmd).toBe(10)
    expect(view.fortitude).toBe(0)
    expect(view.skillTotals.athletics).toBeUndefined()
    expect(view.skillTotals.climb).toBe(0)
    expect(view.skillTotals['disable-device']).toBeNull()
    expect(view.skillTotals.fly).toBeNull()
    expect(view.loadCategory).toBe('light')
    expect(view.spellcasting).toEqual({})
  })

  it('applies a maxHp override and records the path', () => {
    const character = createEmptyCharacter()
    character.overrides['derived.maxHp'] = { value: 42, reason: 'test' }
    const view = compute(character)
    expect(view.maxHp).toBe(42)
    expect(view.overriddenPaths).toContain('derived.maxHp')
  })

  it('ignores unknown override paths', () => {
    const character = createEmptyCharacter()
    character.overrides['derived.notAField'] = { value: 1 }
    const view = compute(character)
    expect(view.ignoredOverridePaths).toContain('derived.notAField')
  })

  it('stacks Fighter 2 / Wizard 3 BAB and saves', () => {
    const character = createEmptyCharacter()
    const fighter = createEmptyClass()
    fighter.class = { id: 'class.fighter', name: 'Fighter' }
    fighter.levels = 2
    fighter.hitDie = 10
    fighter.babProgression = 'full'
    fighter.saves = { fort: 'good', ref: 'poor', will: 'poor' }
    const wizard = createEmptyClass()
    wizard.class = { id: 'class.wizard', name: 'Wizard' }
    wizard.levels = 3
    wizard.hitDie = 6
    wizard.babProgression = 'half'
    wizard.saves = { fort: 'poor', ref: 'poor', will: 'good' }
    character.classes = [fighter, wizard]
    const view = compute(character)
    expect(view.level).toBe(5)
    expect(view.bab).toBe(3)
    expect(view.fortitude).toBe(4)
    expect(view.reflex).toBe(1)
    expect(view.will).toBe(3)
  })

  it('adds miscDamage even when damageAbility is null', () => {
    const character = createEmptyCharacter()
    const attack = createEmptyAttack()
    attack.id = 'atk-no-ability'
    attack.damageAbility = null
    attack.miscDamage = 2
    attack.damageDice = '1d4'
    character.attacks = [attack]
    const view = compute(character)
    expect(view.attacks['atk-no-ability'].damage).toBe('1d4+2')
  })

  it('shifts attack iteratives when the primary attack is overridden', () => {
    const character = createEmptyCharacter()
    const fighter = createEmptyClass()
    fighter.levels = 6
    fighter.babProgression = 'full'
    character.classes = [fighter]
    const attack = createEmptyAttack()
    attack.id = 'atk-override'
    character.attacks = [attack]
    const base = compute(character)
    expect(base.attacks['atk-override'].iteratives).toEqual([6, 1])

    character.overrides['derived.attacks.atk-override.attack'] = { value: 8 }
    const overridden = compute(character)
    expect(overridden.attacks['atk-override'].attack).toBe(8)
    expect(overridden.attacks['atk-override'].iteratives).toEqual([8, 3])
    expect(overridden.overriddenPaths).toContain(
      'derived.attacks.atk-override.attack',
    )
  })

  it('blanks untrained-only skills and Fly without a fly speed', () => {
    const character = createEmptyCharacter()
    const view = compute(character)
    expect(view.skillTotals['disable-device']).toBeNull()
    expect(view.skillTotals['handle-animal']).toBeNull()
    expect(view.skillTotals['use-magic-device']).toBeNull()
    expect(view.skillTotals['sleight-of-hand']).toBeNull()
    expect(view.skillTotals.spellcraft).toBeNull()
    expect(view.skillTotals.linguistics).toBeNull()
    expect(view.skillTotals.fly).toBeNull()
    expect(view.skillTotals.climb).toBe(0)
    expect(view.skillTotals['knowledge-arcana']).toBe(0)
  })

  it('shows Fly when a fly speed exists, even at 0 ranks', () => {
    const character = createEmptyCharacter()
    character.vitals = {
      ...character.vitals,
      speeds: [{ kind: 'fly', feet: 30 }],
    }
    character.abilities.dex.score = 14
    const view = compute(character)
    expect(view.skillTotals.fly).toBe(2)
  })

  it('uses tempScore for modifier, bonus slots, and carrying capacity', () => {
    const character = createEmptyCharacter()
    character.abilities.int = { score: 18, tempScore: 4, tempModifier: 1 }
    character.abilities.str = { score: 10, tempScore: 8 }
    const wizard = createEmptyClass()
    wizard.id = 'class-row-wizard'
    wizard.class = { id: 'class.wizard', name: 'Wizard' }
    wizard.levels = 5
    wizard.babProgression = 'half'
    character.classes = [wizard]
    const entry = createEmptySpellcasting()
    entry.id = 'cast-temp'
    entry.classRowId = 'class-row-wizard'
    character.spellcasting = [entry]
    const view = compute(character)
    expect(view.abilityModifiers.int).toBe(7)
    expect(view.spellcasting['cast-temp'].bonusSlotsByLevel[1]).toBe(2)
    expect(view.heavyLoad).toBe(300)
  })

  it('warns when skill ranks exceed character level', () => {
    expect(ranksExceedLevel(6, 5)).toBe(true)
    expect(ranksExceedLevel(5, 5)).toBe(false)
    expect(ranksExceedLevel(1, 0)).toBe(false)
  })

  it('does not rewrite iteratives when BAB is overridden', () => {
    const character = createEmptyCharacter()
    const fighter = createEmptyClass()
    fighter.levels = 6
    fighter.babProgression = 'full'
    character.classes = [fighter]
    character.overrides['derived.bab'] = { value: 11 }
    const view = compute(character)
    expect(view.bab).toBe(11)
    expect(view.babIteratives).toEqual([6, 1])
    expect(view.overriddenPaths).toContain('derived.bab')
    expect(view.overriddenPaths).not.toContain('derived.babIteratives')
  })

  it('applies a babIteratives override without changing BAB', () => {
    const character = createEmptyCharacter()
    const fighter = createEmptyClass()
    fighter.levels = 6
    fighter.babProgression = 'full'
    character.classes = [fighter]
    character.overrides['derived.babIteratives'] = { value: [8, 3] }
    const view = compute(character)
    expect(view.bab).toBe(6)
    expect(view.babIteratives).toEqual([8, 3])
    expect(view.overriddenPaths).toContain('derived.babIteratives')
  })

  it('shows Disable Device once trained', () => {
    const character = createEmptyCharacter()
    const skill = character.skills.find((row) => row.key === 'disable-device')
    expect(skill).toBeDefined()
    skill!.ranks = 1
    character.abilities.dex.score = 12
    const view = compute(character)
    expect(view.skillTotals['disable-device']).toBe(2)
  })

  it('blanks Fly without a fly speed even when ranked', () => {
    const character = createEmptyCharacter()
    const fly = character.skills.find((row) => row.key === 'fly')
    expect(fly).toBeDefined()
    fly!.ranks = 3
    const view = compute(character)
    expect(view.skillTotals.fly).toBeNull()
  })

  it('uses Dexterity modifier for CMB on Tiny or smaller creatures', () => {
    const character = createEmptyCharacter()
    character.identity.size = 'tiny'
    character.abilities.str.score = 6 // mod -2
    character.abilities.dex.score = 16 // mod +3
    const cls = createEmptyClass()
    cls.levels = 1
    cls.babProgression = 'full'
    character.classes = [cls]
    const view = compute(character)
    // BAB 1 + Dex (+3) + Tiny size (-2) = 2
    expect(view.cmb).toBe(2)
  })

  it('calculates caster level as level - 3 for Paladins and Rangers', () => {
    const character = createEmptyCharacter()
    const paladin = createEmptyClass()
    paladin.id = 'row-paladin'
    paladin.class = { id: 'class.paladin', name: 'Paladin' }
    paladin.levels = 4
    character.classes = [paladin]
    const entry = createEmptySpellcasting()
    entry.id = 'cast-paladin'
    entry.classRowId = 'row-paladin'
    character.spellcasting = [entry]
    const view = compute(character)
    expect(view.spellcasting['cast-paladin'].casterLevel).toBe(1)

    // At level 3, Paladin has CL 0
    paladin.levels = 3
    const view3 = compute(character)
    expect(view3.spellcasting['cast-paladin'].casterLevel).toBe(0)

    // Ranger at level 5 has CL 2
    paladin.class = { id: 'class.ranger', name: 'Ranger' }
    paladin.levels = 5
    const viewRanger = compute(character)
    expect(viewRanger.spellcasting['cast-paladin'].casterLevel).toBe(2)
  })

  it('calculates flat-footed CMD removing positive Dex and Dodge bonuses while preserving Dex penalties', () => {
    const character = createEmptyCharacter()
    const fighter = createEmptyClass()
    fighter.id = 'row-fighter'
    fighter.class = { id: 'class.fighter', name: 'Fighter' }
    fighter.babProgression = 'full'
    fighter.levels = 3 // BAB 3
    character.classes = [fighter]
    character.abilities.str.score = 14 // +2
    character.abilities.dex.score = 16 // +3
    character.armorClass.dodge = 1
    character.armorClass.deflection = 2
    character.combat.cmdMisc = 1

    const view = compute(character)
    // CMD = 10 + 3(bab) + 2(str) + 3(dex) + 1(dodge) + 2(defl) + 1(misc) = 22
    expect(view.cmd).toBe(22)
    // Flat-Footed CMD = 10 + 3(bab) + 2(str) + 0(dex loss) + 0(dodge loss) + 2(defl) + 1(misc) = 18
    expect(view.flatFootedCmd).toBe(18)

    // With negative Dex mod (-2)
    character.abilities.dex.score = 6
    const viewPenalized = compute(character)
    // CMD = 10 + 3(bab) + 2(str) - 2(dex) + 1(dodge) + 2(defl) + 1(misc) = 17
    expect(viewPenalized.cmd).toBe(17)
    // Flat-Footed CMD = 10 + 3(bab) + 2(str) - 2(dex preserved) + 2(defl) + 1(misc) = 16
    expect(viewPenalized.flatFootedCmd).toBe(16)
  })

  it('supports quadruped carrying capacity multipliers vs biped', () => {
    // Str 10: medium biped heavy load is 100 lb
    expect(mediumBipedHeavyLoad(10)).toBe(100)
    // Medium quadruped gets 1.5x -> 150 lb heavy load
    const bipedMed = loadThresholds(10, 'medium', false)
    const quadMed = loadThresholds(10, 'medium', true)
    expect(bipedMed.heavy).toBe(100)
    expect(quadMed.heavy).toBe(150)

    // Large quadruped gets 3x -> 300 lb heavy load (vs biped Large 2x -> 200 lb)
    const bipedLarge = loadThresholds(10, 'large', false)
    const quadLarge = loadThresholds(10, 'large', true)
    expect(bipedLarge.heavy).toBe(200)
    expect(quadLarge.heavy).toBe(300)

    expect(quadrupedCarryMultiplier('tiny')).toBe(0.75)
    expect(quadrupedCarryMultiplier('colossal')).toBe(24)
    expect(sizeCarryMultiplier('large', true)).toBe(3)
  })

  it('applies double armor check penalty to Swim skill', () => {
    const character = createEmptyCharacter()
    character.abilities.str.score = 14 // +2
    character.armorClass.armorCheckPenalty = -3

    const view = compute(character)
    // Normal skill with ACP (e.g., climb ranks 0): Str +2 - 3 = -1
    expect(view.skillTotals.climb).toBe(-1)
    // Swim has double ACP (-3 * 2 = -6): Str +2 - 6 = -4
    expect(view.skillTotals.swim).toBe(-4)
  })
})
