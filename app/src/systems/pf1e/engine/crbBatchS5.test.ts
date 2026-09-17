import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from '../character/createRows'
import { applyCrbSpell, lookupCrbSpell } from '../content'
import { compute } from './compute'

const S5_SPELLS = [
  { id: "spell.animal-shapes", name: "Animal Shapes", spellLevel: 8 },
  { id: "spell.antipathy", name: "Antipathy", spellLevel: 8 },
  { id: "spell.binding", name: "Binding", spellLevel: 8 },
  { id: "spell.clenched-fist", name: "Clenched Fist", spellLevel: 8 },
  { id: "spell.cloak-of-chaos", name: "Cloak of Chaos", spellLevel: 8 },
  { id: "spell.clone", name: "Clone", spellLevel: 8 },
  { id: "spell.control-plants", name: "Control Plants", spellLevel: 8 },
  { id: "spell.create-greater-undead", name: "Create Greater Undead", spellLevel: 8 },
  { id: "spell.demand", name: "Demand", spellLevel: 8 },
  { id: "spell.dimensional-lock", name: "Dimensional Lock", spellLevel: 8 },
  { id: "spell.discern-location", name: "Discern Location", spellLevel: 8 },
  { id: "spell.earthquake", name: "Earthquake", spellLevel: 8 },
  { id: "spell.form-of-the-dragon-iii", name: "Form of the Dragon III", spellLevel: 8 },
  { id: "spell.giant-form-ii", name: "Giant Form II", spellLevel: 8 },
  { id: "spell.greater-planar-ally", name: "Greater Planar Ally", spellLevel: 8 },
  { id: "spell.greater-planar-binding", name: "Greater Planar Binding", spellLevel: 8 },
  { id: "spell.greater-prying-eyes", name: "Greater Prying Eyes", spellLevel: 8 },
  { id: "spell.greater-shadow-evocation", name: "Greater Shadow Evocation", spellLevel: 8 },
  { id: "spell.greater-shout", name: "Greater Shout", spellLevel: 8 },
  { id: "spell.greater-spell-immunity", name: "Greater Spell Immunity", spellLevel: 8 },
  { id: "spell.holy-aura", name: "Holy Aura", spellLevel: 8 },
  { id: "spell.horrid-wilting", name: "Horrid Wilting", spellLevel: 8 },
  { id: "spell.incendiary-cloud", name: "Incendiary Cloud", spellLevel: 8 },
  { id: "spell.iron-body", name: "Iron Body", spellLevel: 8 },
  { id: "spell.irresistible-dance", name: "Irresistible Dance", spellLevel: 8 },
  { id: "spell.mass-charm-monster", name: "Mass Charm Monster", spellLevel: 8 },
  { id: "spell.mass-cure-critical-wounds", name: "Mass Cure Critical Wounds", spellLevel: 8 },
  { id: "spell.mass-inflict-critical-wounds", name: "Mass Inflict Critical Wounds", spellLevel: 8 },
  { id: "spell.maze", name: "Maze", spellLevel: 8 },
  { id: "spell.mind-blank", name: "Mind Blank", spellLevel: 8 },
  { id: "spell.moment-of-prescience", name: "Moment of Prescience", spellLevel: 8 },
  { id: "spell.polar-ray", name: "Polar Ray", spellLevel: 8 },
  { id: "spell.polymorph-any-object", name: "Polymorph Any Object", spellLevel: 8 },
  { id: "spell.power-word-stun", name: "Power Word Stun", spellLevel: 8 },
  { id: "spell.prismatic-wall", name: "Prismatic Wall", spellLevel: 8 },
  { id: "spell.protection-from-spells", name: "Protection from Spells", spellLevel: 8 },
  { id: "spell.repel-metal-or-stone", name: "Repel Metal or Stone", spellLevel: 8 },
  { id: "spell.scintillating-pattern", name: "Scintillating Pattern", spellLevel: 8 },
  { id: "spell.screen", name: "Screen", spellLevel: 8 },
  { id: "spell.shield-of-law", name: "Shield of Law", spellLevel: 8 },
  { id: "spell.summon-monster-viii", name: "Summon Monster VIII", spellLevel: 8 },
  { id: "spell.summon-natures-ally-viii", name: "Summon Nature's Ally VIII", spellLevel: 8 },
  { id: "spell.sunburst", name: "Sunburst", spellLevel: 8 },
  { id: "spell.symbol-of-death", name: "Symbol of Death", spellLevel: 8 },
  { id: "spell.symbol-of-insanity", name: "Symbol of Insanity", spellLevel: 8 },
  { id: "spell.sympathy", name: "Sympathy", spellLevel: 8 },
  { id: "spell.telekinetic-sphere", name: "Telekinetic Sphere", spellLevel: 8 },
  { id: "spell.temporal-stasis", name: "Temporal Stasis", spellLevel: 8 },
  { id: "spell.trap-the-soul", name: "Trap the Soul", spellLevel: 8 },
  { id: "spell.unholy-aura", name: "Unholy Aura", spellLevel: 8 },
  { id: "spell.whirlwind", name: "Whirlwind", spellLevel: 8 },
  { id: "spell.astral-projection", name: "Astral Projection", spellLevel: 9 },
  { id: "spell.crushing-hand", name: "Crushing Hand", spellLevel: 9 },
  { id: "spell.dominate-monster", name: "Dominate Monster", spellLevel: 9 },
  { id: "spell.elemental-swarm", name: "Elemental Swarm", spellLevel: 9 },
  { id: "spell.energy-drain", name: "Energy Drain", spellLevel: 9 },
  { id: "spell.etherealness", name: "Etherealness", spellLevel: 9 },
  { id: "spell.foresight", name: "Foresight", spellLevel: 9 },
  { id: "spell.freedom", name: "Freedom", spellLevel: 9 },
  { id: "spell.gate", name: "Gate", spellLevel: 9 },
  { id: "spell.implosion", name: "Implosion", spellLevel: 9 },
  { id: "spell.imprisonment", name: "Imprisonment", spellLevel: 9 },
  { id: "spell.mages-disjunction", name: "Mage's Disjunction", spellLevel: 9 },
  { id: "spell.mass-heal", name: "Mass Heal", spellLevel: 9 },
  { id: "spell.mass-hold-monster", name: "Mass Hold Monster", spellLevel: 9 },
  { id: "spell.meteor-swarm", name: "Meteor Swarm", spellLevel: 9 },
  { id: "spell.miracle", name: "Miracle", spellLevel: 9 },
  { id: "spell.power-word-kill", name: "Power Word Kill", spellLevel: 9 },
  { id: "spell.prismatic-sphere", name: "Prismatic Sphere", spellLevel: 9 },
  { id: "spell.refuge", name: "Refuge", spellLevel: 9 },
  { id: "spell.shades", name: "Shades", spellLevel: 9 },
  { id: "spell.shambler", name: "Shambler", spellLevel: 9 },
  { id: "spell.shapechange", name: "Shapechange", spellLevel: 9 },
  { id: "spell.soul-bind", name: "Soul Bind", spellLevel: 9 },
  { id: "spell.storm-of-vengeance", name: "Storm of Vengeance", spellLevel: 9 },
  { id: "spell.summon-monster-ix", name: "Summon Monster IX", spellLevel: 9 },
  { id: "spell.summon-natures-ally-ix", name: "Summon Nature's Ally IX", spellLevel: 9 },
  { id: "spell.teleportation-circle", name: "Teleportation Circle", spellLevel: 9 },
  { id: "spell.time-stop", name: "Time Stop", spellLevel: 9 },
  { id: "spell.true-resurrection", name: "True Resurrection", spellLevel: 9 },
  { id: "spell.wail-of-the-banshee", name: "Wail of the Banshee", spellLevel: 9 },
  { id: "spell.weird", name: "Weird", spellLevel: 9 },
  { id: "spell.wish", name: "Wish", spellLevel: 9 },
] as const

describe('CRB batch S5: remaining spell levels 8 and 9', () => {
  it('resolves all 83 S5 spells in the CRB catalog', () => {
    for (const item of S5_SPELLS) {
      const spell = lookupCrbSpell(item.id)
      expect(spell, `Expected ${item.id} to exist in CRB catalog`).not.toBeNull()
      expect(spell?.id).toBe(item.id)
      expect(spell?.name).toBe(item.name)
      expect(spell?.spellLevel).toBe(item.spellLevel)
      expect(spell?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and spellLevel onto empty spell rows', () => {
    for (const item of S5_SPELLS) {
      const catalog = lookupCrbSpell(item.id)!
      const stamped = applyCrbSpell(createEmptySpellListEntry(), item.id)
      expect(stamped.spell.id).toBe(item.id)
      expect(stamped.spell.name).toBe(catalog.name)
      expect(stamped.spellLevel).toBe(catalog.spellLevel)
      expect(stamped.spell.source?.book).toBe('CRB')
    }
  })

  it('maintains slot and DC neutrality on empty character', () => {
    const character = createEmptyCharacter()
    const entry = createEmptySpellcasting()
    const beforeSlots = structuredClone(entry.slots)
    entry.spells = S5_SPELLS.slice(0, 5).map((item) =>
      applyCrbSpell(createEmptySpellListEntry(), item.id),
    )
    character.spellcasting = [entry]
    const view = compute(character)

    expect(entry.slots).toEqual(beforeSlots)
    expect(entry.slots.every((row) => row.max == null && row.remaining === 0)).toBe(
      true,
    )
    expect(entry.spells[0]?.prepared).toBe(false)
    expect(entry.spells[0]?.summary).toBe('')
    expect(view.spellcasting[entry.id]?.dcByLevel[8]).toBe(18)
    expect(view.spellcasting[entry.id]?.bonusSlotsByLevel[8]).toBe(0)
  })
})
