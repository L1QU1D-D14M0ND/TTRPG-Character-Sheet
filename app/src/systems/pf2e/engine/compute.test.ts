import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import { compute } from './compute'
import { proficiencyBonus } from './proficiency'
import { stackTyped } from './stacking'
import { armorCheckPenalty } from './ac'
import { maxHp } from './hp'
import {
  createEmptyCondition,
  createEmptyFeat,
  createEmptyItem,
  createEmptySpellcasting,
  createEmptyStrike,
  DEFAULT_ARMOR,
  DEFAULT_WEAPON,
} from '../character/createRows'

describe('proficiencyBonus', () => {
  it('does not add level when untrained', () => {
    expect(proficiencyBonus('untrained', 5)).toBe(0)
    expect(proficiencyBonus('untrained', 20)).toBe(0)
  })

  it('adds rank bonus plus level when trained or better', () => {
    expect(proficiencyBonus('trained', 5)).toBe(7)
    expect(proficiencyBonus('expert', 5)).toBe(9)
    expect(proficiencyBonus('master', 5)).toBe(11)
    expect(proficiencyBonus('legendary', 5)).toBe(13)
  })

  it('has no maximum level cap', () => {
    expect(proficiencyBonus('trained', 21)).toBe(23)
  })
})

describe('stackTyped', () => {
  it('keeps the highest bonus and worst penalty', () => {
    expect(stackTyped([2, 1, -1, -2])).toBe(0)
    expect(stackTyped([3, 1])).toBe(3)
  })
})

describe('compute empty sheet', () => {
  it('uses boost sums, trained perception, and unarmored AC', () => {
    const character = createEmptyCharacter()
    const view = compute(character)
    expect(view.attributeModifiers.str).toBe(0)
    expect(view.perception).toBe(3)
    expect(view.fortitude).toBe(3)
    expect(view.reflex).toBe(3)
    expect(view.will).toBe(3)
    expect(view.classDC).toBe(13)
    expect(view.maxHp).toBe(0)
    expect(view.ac).toBe(13)
    expect(view.skillTotals.athletics).toBe(0)
    expect(view.skillTotals.acrobatics).toBe(0)
    expect(view.bulkUsed).toBe(0)
    expect(view.bulkCapacity).toBe(5)
    expect(view.investedCount).toBe(0)
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

  it('computes spell attack and DC and honors overrides', () => {
    const character = createEmptyCharacter()
    character.identity.level = 5
    character.attributes.int.boosts = [
      { kind: 'free', attribute: 'int', amount: 4 },
    ]
    const entry = createEmptySpellcasting()
    entry.id = 'cast-test'
    entry.attribute = 'int'
    entry.proficiency = { rank: 'trained', attribute: 'int', modifiers: {} }
    character.spellcasting = [entry]
    const view = compute(character)
    expect(view.spellcasting['cast-test']).toEqual({ attack: 11, dc: 21 })

    character.overrides['derived.spellcasting.cast-test.dc'] = { value: 22 }
    const overridden = compute(character)
    expect(overridden.spellcasting['cast-test'].dc).toBe(22)
    expect(overridden.overriddenPaths).toContain(
      'derived.spellcasting.cast-test.dc',
    )
  })
})

describe('hp and armor penalty helpers', () => {
  it('applies the 1 HP per level floor once class HP is set', () => {
    const character = createEmptyCharacter()
    character.vitals.classHpPerLevel = 1
    character.attributes.con.boosts = [
      { kind: 'flaw', attribute: 'con', amount: -2 },
    ]
    character.identity.level = 3
    expect(maxHp(character, -2)).toBe(3)
  })

  it('applies armor check penalty only when Strength is below the requirement', () => {
    const armor = {
      category: 'medium' as const,
      acBonus: 4,
      dexCap: 1,
      checkPenalty: -2,
      speedPenalty: -5,
      strength: 3,
    }
    expect(armorCheckPenalty(armor, 4)).toBe(0)
    expect(armorCheckPenalty(armor, 2)).toBe(-2)
    expect(armorCheckPenalty({ ...armor, strength: null }, 0)).toBe(0)
  })

  it('applies weapon potency rune to strike attack and striking rune to damage dice', () => {
    const character = createEmptyCharacter()
    const item = createEmptyItem()
    item.id = 'sword-1'
    item.weapon = {
      ...DEFAULT_WEAPON,
      potencyRune: 1,
      strikingRune: 'striking',
    }
    const strike = createEmptyStrike()
    strike.id = 'strike-1'
    strike.itemId = 'sword-1'
    strike.damageDice = '1d8'
    character.inventory.items = [item]
    character.strikes = [strike]

    const view = compute(character)
    expect(view.strikes['strike-1'].attack).toBe(1)
    expect(view.strikes['strike-1'].damage).toBe('2d8')

    // Greater striking gives 3 dice
    item.weapon.strikingRune = 'greaterStriking'
    item.weapon.potencyRune = 2
    const view2 = compute(character)
    expect(view2.strikes['strike-1'].attack).toBe(2)
    expect(view2.strikes['strike-1'].damage).toBe('3d8')
  })

  it('applies armor resilient rune bonus to Fortitude, Reflex, and Will saves', () => {
    const character = createEmptyCharacter()
    const armorItem = createEmptyItem()
    armorItem.id = 'armor-1'
    armorItem.armor = {
      ...DEFAULT_ARMOR,
      resilientRune: 'resilient',
    }
    character.inventory.items = [armorItem]
    character.armorClass.equippedArmorItemId = 'armor-1'

    const view = compute(character)
    // Level 1 trained save = 1 + 2 = 3; resilient rune grants +1 item bonus -> 4
    expect(view.fortitude).toBe(4)
    expect(view.reflex).toBe(4)
    expect(view.will).toBe(4)

    armorItem.armor.resilientRune = 'greaterResilient'
    const viewGreater = compute(character)
    expect(viewGreater.fortitude).toBe(5)
    expect(viewGreater.reflex).toBe(5)
    expect(viewGreater.will).toBe(5)
  })

  it('scales bulk capacity and maximum based on creature size', () => {
    const character = createEmptyCharacter()
    // Medium (default): Str 0 -> capacity 5, max 10
    const viewMedium = compute(character)
    expect(viewMedium.bulkCapacity).toBe(5)
    expect(viewMedium.bulkMaximum).toBe(10)

    // Tiny: half capacity -> 2.5, max -> 5
    character.identity.size = 'tiny'
    const viewTiny = compute(character)
    expect(viewTiny.bulkCapacity).toBe(2.5)
    expect(viewTiny.bulkMaximum).toBe(5)

    // Large: double capacity -> 10, max -> 20
    character.identity.size = 'large'
    const viewLarge = compute(character)
    expect(viewLarge.bulkCapacity).toBe(10)
    expect(viewLarge.bulkMaximum).toBe(20)

    // Huge: quadruple capacity -> 20, max -> 40
    character.identity.size = 'huge'
    const viewHuge = compute(character)
    expect(viewHuge.bulkCapacity).toBe(20)
    expect(viewHuge.bulkMaximum).toBe(40)
  })

  it('computes maxDying threshold considering Diehard feat and Doomed condition', () => {
    const character = createEmptyCharacter()
    // Default maxDying is 4
    expect(compute(character).maxDying).toBe(4)

    // Doomed 1 reduces threshold to 3
    character.vitals.doomed = 1
    expect(compute(character).maxDying).toBe(3)

    // Diehard feat increases threshold by 1 (4 - 1 + 1 = 4)
    const diehard = createEmptyFeat()
    diehard.feat = { id: 'feat.diehard', name: 'Diehard', rulesetSource: 'crb' }
    character.feats = [diehard]
    expect(compute(character).maxDying).toBe(4)

    // Without doomed, Diehard gives 5
    character.vitals.doomed = 0
    expect(compute(character).maxDying).toBe(5)

    // Condition entry "Doomed 2" reduces threshold from 5 to 3
    const cond = createEmptyCondition()
    cond.condition = { id: 'condition.doomed', name: 'Doomed', rulesetSource: 'crb' }
    cond.value = 2
    character.conditions = [cond]
    expect(compute(character).maxDying).toBe(3)
  })
})
