import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from '../character/createRows'
import { applyCrbSpell, lookupCrbSpell } from '../content'
import { compute } from './compute'

const S4_SPELLS = [
  { id: "spell.acid-fog", name: "Acid Fog", spellLevel: 6 },
  { id: "spell.analyze-dweomer", name: "Analyze Dweomer", spellLevel: 6 },
  { id: "spell.animate-objects", name: "Animate Objects", spellLevel: 6 },
  { id: "spell.antilife-shell", name: "Antilife Shell", spellLevel: 6 },
  { id: "spell.antimagic-field", name: "Antimagic Field", spellLevel: 6 },
  { id: "spell.beast-shape-iv", name: "Beast Shape IV", spellLevel: 6 },
  { id: "spell.blade-barrier", name: "Blade Barrier", spellLevel: 6 },
  { id: "spell.chain-lightning", name: "Chain Lightning", spellLevel: 6 },
  { id: "spell.circle-of-death", name: "Circle of Death", spellLevel: 6 },
  { id: "spell.contingency", name: "Contingency", spellLevel: 6 },
  { id: "spell.control-water", name: "Control Water", spellLevel: 6 },
  { id: "spell.create-undead", name: "Create Undead", spellLevel: 6 },
  { id: "spell.disintegrate", name: "Disintegrate", spellLevel: 6 },
  { id: "spell.elemental-body-iii", name: "Elemental Body III", spellLevel: 6 },
  { id: "spell.eyebite", name: "Eyebite", spellLevel: 6 },
  { id: "spell.find-the-path", name: "Find the Path", spellLevel: 6 },
  { id: "spell.fire-seeds", name: "Fire Seeds", spellLevel: 6 },
  { id: "spell.flesh-to-stone", name: "Flesh to Stone", spellLevel: 6 },
  { id: "spell.forbiddance", name: "Forbiddance", spellLevel: 6 },
  { id: "spell.forceful-hand", name: "Forceful Hand", spellLevel: 6 },
  { id: "spell.form-of-the-dragon-i", name: "Form of the Dragon I", spellLevel: 6 },
  { id: "spell.freezing-sphere", name: "Freezing Sphere", spellLevel: 6 },
  { id: "spell.geas-quest", name: "Geas/Quest", spellLevel: 6 },
  { id: "spell.globe-of-invulnerability", name: "Globe of Invulnerability", spellLevel: 6 },
  { id: "spell.greater-dispel-magic", name: "Greater Dispel Magic", spellLevel: 6 },
  { id: "spell.greater-glyph-of-warding", name: "Greater Glyph of Warding", spellLevel: 6 },
  { id: "spell.greater-heroism", name: "Greater Heroism", spellLevel: 6 },
  { id: "spell.guards-and-wards", name: "Guards and Wards", spellLevel: 6 },
  { id: "spell.harm", name: "Harm", spellLevel: 6 },
  { id: "spell.heal", name: "Heal", spellLevel: 6 },
  { id: "spell.heroes-feast", name: "Heroes' Feast", spellLevel: 6 },
  { id: "spell.ironwood", name: "Ironwood", spellLevel: 6 },
  { id: "spell.legend-lore", name: "Legend Lore", spellLevel: 6 },
  { id: "spell.liveoak", name: "Liveoak", spellLevel: 6 },
  { id: "spell.mages-lucubration", name: "Mage's Lucubration", spellLevel: 6 },
  { id: "spell.mass-bears-endurance", name: "Mass Bear's Endurance", spellLevel: 6 },
  { id: "spell.mass-bulls-strength", name: "Mass Bull's Strength", spellLevel: 6 },
  { id: "spell.mass-cats-grace", name: "Mass Cat's Grace", spellLevel: 6 },
  { id: "spell.mass-cure-moderate-wounds", name: "Mass Cure Moderate Wounds", spellLevel: 6 },
  { id: "spell.mass-eagles-splendor", name: "Mass Eagle's Splendor", spellLevel: 6 },
  { id: "spell.mass-foxs-cunning", name: "Mass Fox's Cunning", spellLevel: 6 },
  { id: "spell.mass-inflict-moderate-wounds", name: "Mass Inflict Moderate Wounds", spellLevel: 6 },
  { id: "spell.mass-owls-wisdom", name: "Mass Owl's Wisdom", spellLevel: 6 },
  { id: "spell.mass-suggestion", name: "Mass Suggestion", spellLevel: 6 },
  { id: "spell.mislead", name: "Mislead", spellLevel: 6 },
  { id: "spell.move-earth", name: "Move Earth", spellLevel: 6 },
  { id: "spell.permanent-image", name: "Permanent Image", spellLevel: 6 },
  { id: "spell.planar-ally", name: "Planar Ally", spellLevel: 6 },
  { id: "spell.planar-binding", name: "Planar Binding", spellLevel: 6 },
  { id: "spell.plant-shape-ii", name: "Plant Shape II", spellLevel: 6 },
  { id: "spell.programmed-image", name: "Programmed Image", spellLevel: 6 },
  { id: "spell.repel-wood", name: "Repel Wood", spellLevel: 6 },
  { id: "spell.repulsion", name: "Repulsion", spellLevel: 6 },
  { id: "spell.shadow-walk", name: "Shadow Walk", spellLevel: 6 },
  { id: "spell.spellstaff", name: "Spellstaff", spellLevel: 6 },
  { id: "spell.stone-tell", name: "Stone Tell", spellLevel: 6 },
  { id: "spell.stone-to-flesh", name: "Stone to Flesh", spellLevel: 6 },
  { id: "spell.summon-monster-vi", name: "Summon Monster VI", spellLevel: 6 },
  { id: "spell.summon-natures-ally-vi", name: "Summon Nature's Ally VI", spellLevel: 6 },
  { id: "spell.symbol-of-fear", name: "Symbol of Fear", spellLevel: 6 },
  { id: "spell.symbol-of-persuasion", name: "Symbol of Persuasion", spellLevel: 6 },
  { id: "spell.sympathetic-vibration", name: "Sympathetic Vibration", spellLevel: 6 },
  { id: "spell.transformation", name: "Transformation", spellLevel: 6 },
  { id: "spell.transport-via-plants", name: "Transport via Plants", spellLevel: 6 },
  { id: "spell.true-seeing", name: "True Seeing", spellLevel: 6 },
  { id: "spell.undeath-to-death", name: "Undeath to Death", spellLevel: 6 },
  { id: "spell.veil", name: "Veil", spellLevel: 6 },
  { id: "spell.wall-of-iron", name: "Wall of Iron", spellLevel: 6 },
  { id: "spell.wind-walk", name: "Wind Walk", spellLevel: 6 },
  { id: "spell.word-of-recall", name: "Word of Recall", spellLevel: 6 },
  { id: "spell.animate-plants", name: "Animate Plants", spellLevel: 7 },
  { id: "spell.banishment", name: "Banishment", spellLevel: 7 },
  { id: "spell.blasphemy", name: "Blasphemy", spellLevel: 7 },
  { id: "spell.changestaff", name: "Changestaff", spellLevel: 7 },
  { id: "spell.control-undead", name: "Control Undead", spellLevel: 7 },
  { id: "spell.control-weather", name: "Control Weather", spellLevel: 7 },
  { id: "spell.creeping-doom", name: "Creeping Doom", spellLevel: 7 },
  { id: "spell.delayed-blast-fireball", name: "Delayed Blast Fireball", spellLevel: 7 },
  { id: "spell.destruction", name: "Destruction", spellLevel: 7 },
  { id: "spell.dictum", name: "Dictum", spellLevel: 7 },
  { id: "spell.elemental-body-iv", name: "Elemental Body IV", spellLevel: 7 },
  { id: "spell.ethereal-jaunt", name: "Ethereal Jaunt", spellLevel: 7 },
  { id: "spell.finger-of-death", name: "Finger of Death", spellLevel: 7 },
  { id: "spell.fire-storm", name: "Fire Storm", spellLevel: 7 },
  { id: "spell.forcecage", name: "Forcecage", spellLevel: 7 },
  { id: "spell.form-of-the-dragon-ii", name: "Form of the Dragon II", spellLevel: 7 },
  { id: "spell.giant-form-i", name: "Giant Form I", spellLevel: 7 },
  { id: "spell.grasping-hand", name: "Grasping Hand", spellLevel: 7 },
  { id: "spell.greater-arcane-sight", name: "Greater Arcane Sight", spellLevel: 7 },
  { id: "spell.greater-polymorph", name: "Greater Polymorph", spellLevel: 7 },
  { id: "spell.greater-restoration", name: "Greater Restoration", spellLevel: 7 },
  { id: "spell.greater-scrying", name: "Greater Scrying", spellLevel: 7 },
  { id: "spell.greater-shadow-conjuration", name: "Greater Shadow Conjuration", spellLevel: 7 },
  { id: "spell.greater-teleport", name: "Greater Teleport", spellLevel: 7 },
  { id: "spell.holy-word", name: "Holy Word", spellLevel: 7 },
  { id: "spell.insanity", name: "Insanity", spellLevel: 7 },
  { id: "spell.instant-summons", name: "Instant Summons", spellLevel: 7 },
  { id: "spell.limited-wish", name: "Limited Wish", spellLevel: 7 },
  { id: "spell.mages-magnificent-mansion", name: "Mage's Magnificent Mansion", spellLevel: 7 },
  { id: "spell.mages-sword", name: "Mage's Sword", spellLevel: 7 },
  { id: "spell.mass-cure-serious-wounds", name: "Mass Cure Serious Wounds", spellLevel: 7 },
  { id: "spell.mass-hold-person", name: "Mass Hold Person", spellLevel: 7 },
  { id: "spell.mass-inflict-serious-wounds", name: "Mass Inflict Serious Wounds", spellLevel: 7 },
  { id: "spell.mass-invisibility", name: "Mass Invisibility", spellLevel: 7 },
  { id: "spell.phase-door", name: "Phase Door", spellLevel: 7 },
  { id: "spell.plane-shift", name: "Plane Shift", spellLevel: 7 },
  { id: "spell.plant-shape-iii", name: "Plant Shape III", spellLevel: 7 },
  { id: "spell.power-word-blind", name: "Power Word Blind", spellLevel: 7 },
  { id: "spell.prismatic-spray", name: "Prismatic Spray", spellLevel: 7 },
  { id: "spell.project-image", name: "Project Image", spellLevel: 7 },
  { id: "spell.regenerate", name: "Regenerate", spellLevel: 7 },
  { id: "spell.resurrection", name: "Resurrection", spellLevel: 7 },
  { id: "spell.reverse-gravity", name: "Reverse Gravity", spellLevel: 7 },
  { id: "spell.sequester", name: "Sequester", spellLevel: 7 },
  { id: "spell.simulacrum", name: "Simulacrum", spellLevel: 7 },
  { id: "spell.spell-turning", name: "Spell Turning", spellLevel: 7 },
  { id: "spell.statue", name: "Statue", spellLevel: 7 },
  { id: "spell.summon-monster-vii", name: "Summon Monster VII", spellLevel: 7 },
  { id: "spell.summon-natures-ally-vii", name: "Summon Nature's Ally VII", spellLevel: 7 },
  { id: "spell.sunbeam", name: "Sunbeam", spellLevel: 7 },
  { id: "spell.symbol-of-stunning", name: "Symbol of Stunning", spellLevel: 7 },
  { id: "spell.symbol-of-weakness", name: "Symbol of Weakness", spellLevel: 7 },
  { id: "spell.teleport-object", name: "Teleport Object", spellLevel: 7 },
  { id: "spell.transmute-metal-to-wood", name: "Transmute Metal to Wood", spellLevel: 7 },
  { id: "spell.vision", name: "Vision", spellLevel: 7 },
  { id: "spell.waves-of-exhaustion", name: "Waves of Exhaustion", spellLevel: 7 },
  { id: "spell.word-of-chaos", name: "Word of Chaos", spellLevel: 7 },
] as const

describe('CRB batch S4: remaining spell levels 6 and 7', () => {
  it('resolves all 127 S4 spells in the CRB catalog', () => {
    for (const item of S4_SPELLS) {
      const spell = lookupCrbSpell(item.id)
      expect(spell, `Expected ${item.id} to exist in CRB catalog`).not.toBeNull()
      expect(spell?.id).toBe(item.id)
      expect(spell?.name).toBe(item.name)
      expect(spell?.spellLevel).toBe(item.spellLevel)
      expect(spell?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and spellLevel onto empty spell rows', () => {
    for (const item of S4_SPELLS) {
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
    entry.spells = S4_SPELLS.slice(0, 5).map((item) =>
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
    expect(view.spellcasting[entry.id]?.dcByLevel[6]).toBe(16)
    expect(view.spellcasting[entry.id]?.bonusSlotsByLevel[6]).toBe(0)
  })
})
