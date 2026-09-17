import { describe, expect, it } from 'vitest'
import { createEmptyItem } from '../character/createRows'
import {
  applyCrbItem,
  computeSuggestedMagicPrice,
} from './index'
import {
  addItemProperty,
  removeItemProperty,
} from '../character/itemProperties'
import characterSchema from '../../../../../schemas/pf1e/character.schema.json'
import { createSchemaValidator } from '../../../shared/validate'
import { parseCharacterJson } from '../character/saveLoad'
import { readRepoFile } from '../../../test/readRepoFile'

const validateCharacter = createSchemaValidator(characterSchema)

describe('CRB magic weapons and armor', () => {
  describe('Specific magic items in catalog', () => {
    it('stamps specific magic weapon holy avenger inheriting longsword base stats', () => {
      const row = applyCrbItem(createEmptyItem(), 'weapon.holy-avenger')
      expect(row.item.id).toBe('weapon.holy-avenger')
      expect(row.item.name).toBe('Holy avenger')
      expect(row.pounds).toBe(4)
      expect(row.weapon).toMatchObject({
        damageDice: '1d8',
        damageType: 'slashing',
        critRange: 19,
        critMultiplier: 2,
        enhancementBonus: 2,
        properties: ['holy'],
      })
    })

    it('stamps specific magic weapon flame tongue with flaming-burst', () => {
      const row = applyCrbItem(createEmptyItem(), 'weapon.flame-tongue')
      expect(row.weapon?.damageDice).toBe('1d8')
      expect(row.weapon?.enhancementBonus).toBe(1)
      expect(row.weapon?.properties).toEqual(['flaming-burst'])
    })

    it('stamps masterwork specific weapons like adamantine dagger', () => {
      const row = applyCrbItem(createEmptyItem(), 'weapon.adamantine-dagger')
      expect(row.weapon?.damageDice).toBe('1d4')
      expect(row.weapon?.critRange).toBe(19)
      expect(row.weapon?.masterwork).toBe(true)
      expect(row.weapon?.enhancementBonus).toBeUndefined()
    })

    it('stamps celestial armor inheriting chainmail base stats with custom stats', () => {
      const row = applyCrbItem(createEmptyItem(), 'armor.celestial-armor')
      expect(row.item.name).toBe('Celestial armor')
      expect(row.pounds).toBe(20)
      expect(row.armor).toMatchObject({
        acBonus: 6,
        maxDex: 8,
        armorCheckPenalty: -2,
        spellFailurePercent: 15,
        enhancementBonus: 3,
      })
    })

    it('stamps lion shield inheriting heavy steel shield stats with +2 enhancement', () => {
      const row = applyCrbItem(createEmptyItem(), 'shield.lions-shield')
      expect(row.item.name).toBe("Lion's shield")
      expect(row.pounds).toBe(15)
      expect(row.shield).toMatchObject({
        acBonus: 2,
        armorCheckPenalty: -1,
        spellFailurePercent: 15,
        enhancementBonus: 2,
      })
    })
  })

  describe('Property helpers and price calculation', () => {
    it('normalizes, adds, and removes item properties', () => {
      const props1 = addItemProperty(undefined, 'Flaming')
      expect(props1).toEqual(['flaming'])
      const props2 = addItemProperty(props1, 'Keen')
      expect(props2).toEqual(['flaming', 'keen'])
      const props3 = addItemProperty(props2, 'flaming')
      expect(props3).toEqual(['flaming', 'keen'])
      const props4 = removeItemProperty(props3, 'flaming')
      expect(props4).toEqual(['keen'])
      const empty = removeItemProperty(props4, 'keen')
      expect(empty).toBeUndefined()
    })

    it('calculates suggested price for masterwork mundane weapon', () => {
      const price = computeSuggestedMagicPrice({
        kind: 'weapon',
        basePriceGp: 15, // Longsword base
        masterwork: true,
      })
      // 15 + 300 = 315 gp
      expect(price).toBe(315)
    })

    it('calculates suggested price for +1 flaming longsword', () => {
      const price = computeSuggestedMagicPrice({
        kind: 'weapon',
        basePriceGp: 15,
        enhancementBonus: 1,
        properties: ['flaming'], // +1 equivalent, total bonus +2
      })
      // 15 base + 300 mwk + (2^2 * 2000) = 15 + 300 + 8000 = 8315 gp
      expect(price).toBe(8315)
    })

    it('calculates suggested price for +1 slick full plate', () => {
      const price = computeSuggestedMagicPrice({
        kind: 'armor',
        basePriceGp: 1500,
        enhancementBonus: 1,
        properties: ['slick'], // flat 3,750 gp
      })
      // 1500 base + 150 mwk + (1^2 * 1000) + 3750 = 6400 gp
      expect(price).toBe(6400)
    })

    it('returns null suggested price for unenhanced mundane item', () => {
      const price = computeSuggestedMagicPrice({
        kind: 'weapon',
        basePriceGp: 15,
      })
      expect(price).toBeNull()
    })
  })

  describe('Character schema validation with magic items', () => {
    it('validates a character with magic weapons, armor, and shields', () => {
      const fighter = parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
      )
      // Add magic overlay to longsword
      fighter.inventory.items[1] = {
        ...fighter.inventory.items[1]!,
        weapon: {
          ...fighter.inventory.items[1]!.weapon!,
          enhancementBonus: 2,
          masterwork: true,
          properties: ['flaming', 'keen'],
        },
      }
      // Add magic overlay to chainmail
      fighter.inventory.items[0] = {
        ...fighter.inventory.items[0]!,
        armor: {
          ...fighter.inventory.items[0]!.armor!,
          enhancementBonus: 1,
          masterwork: true,
          properties: ['fortification-light'],
        },
      }
      expect(validateCharacter(fighter)).toBe(true)
    })

    it('validates a double weapon with enhanced second head', () => {
      const fighter = parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
      )
      fighter.inventory.items[1] = {
        id: 'item-two-bladed-sword',
        item: { id: 'weapon.two-bladed-sword', name: 'Two-bladed sword' },
        quantity: 1,
        pounds: 10,
        location: 'equipped',
        weapon: {
          damageDice: '1d8',
          damageType: 'slashing',
          critRange: 19,
          critMultiplier: 2,
          enhancementBonus: 1,
          masterwork: true,
          properties: ['double', 'flaming'],
          secondHead: {
            damageDice: '1d8',
            damageType: 'slashing',
            critRange: 19,
            critMultiplier: 2,
            enhancementBonus: 2,
            masterwork: true,
            properties: ['frost'],
          },
        },
      }
      expect(validateCharacter(fighter)).toBe(true)
    })

    it('rejects invalid enhancement bonus > 5 in schema', () => {
      const fighter = parseCharacterJson(
        readRepoFile('fixtures/characters/golden/pf1e/fighter-5.json'),
      )
      fighter.inventory.items[1] = {
        ...fighter.inventory.items[1]!,
        weapon: {
          ...fighter.inventory.items[1]!.weapon!,
          enhancementBonus: 6 as any,
        },
      }
      expect(validateCharacter(fighter)).toBe(false)
    })
  })
})
