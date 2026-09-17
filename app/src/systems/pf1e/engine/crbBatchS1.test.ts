import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from '../character/createRows'
import { applyCrbSpell, lookupCrbSpell } from '../content'
import { compute } from './compute'

const S1_SPELLS = [
  { id: "spell.bleed", name: "Bleed", spellLevel: 0 },
  { id: "spell.create-water", name: "Create Water", spellLevel: 0 },
  { id: "spell.daze", name: "Daze", spellLevel: 0 },
  { id: "spell.disrupt-undead", name: "Disrupt Undead", spellLevel: 0 },
  { id: "spell.guidance", name: "Guidance", spellLevel: 0 },
  { id: "spell.know-direction", name: "Know Direction", spellLevel: 0 },
  { id: "spell.lullaby", name: "Lullaby", spellLevel: 0 },
  { id: "spell.purify-food-and-drink", name: "Purify Food and Drink", spellLevel: 0 },
  { id: "spell.stabilize", name: "Stabilize", spellLevel: 0 },
  { id: "spell.summon-instrument", name: "Summon Instrument", spellLevel: 0 },
  { id: "spell.touch-of-fatigue", name: "Touch of Fatigue", spellLevel: 0 },
  { id: "spell.virtue", name: "Virtue", spellLevel: 0 },
  { id: "spell.animal-messenger", name: "Animal Messenger", spellLevel: 1 },
  { id: "spell.animate-rope", name: "Animate Rope", spellLevel: 1 },
  { id: "spell.bane", name: "Bane", spellLevel: 1 },
  { id: "spell.bless", name: "Bless", spellLevel: 1 },
  { id: "spell.bless-water", name: "Bless Water", spellLevel: 1 },
  { id: "spell.bless-weapon", name: "Bless Weapon", spellLevel: 1 },
  { id: "spell.calm-animals", name: "Calm Animals", spellLevel: 1 },
  { id: "spell.cause-fear", name: "Cause Fear", spellLevel: 1 },
  { id: "spell.charm-animal", name: "Charm Animal", spellLevel: 1 },
  { id: "spell.charm-person", name: "Charm Person", spellLevel: 1 },
  { id: "spell.chill-touch", name: "Chill Touch", spellLevel: 1 },
  { id: "spell.color-spray", name: "Color Spray", spellLevel: 1 },
  { id: "spell.command", name: "Command", spellLevel: 1 },
  { id: "spell.cure-light-wounds", name: "Cure Light Wounds", spellLevel: 1 },
  { id: "spell.curse-water", name: "Curse Water", spellLevel: 1 },
  { id: "spell.deathwatch", name: "Deathwatch", spellLevel: 1 },
  { id: "spell.delay-poison", name: "Delay Poison", spellLevel: 1 },
  { id: "spell.detect-animals-or-plants", name: "Detect Animals or Plants", spellLevel: 1 },
  { id: "spell.detect-chaos", name: "Detect Chaos", spellLevel: 1 },
  { id: "spell.detect-evil", name: "Detect Evil", spellLevel: 1 },
  { id: "spell.detect-good", name: "Detect Good", spellLevel: 1 },
  { id: "spell.detect-law", name: "Detect Law", spellLevel: 1 },
  { id: "spell.detect-snares-and-pits", name: "Detect Snares and Pits", spellLevel: 1 },
  { id: "spell.detect-undead", name: "Detect Undead", spellLevel: 1 },
  { id: "spell.disguise-self", name: "Disguise Self", spellLevel: 1 },
  { id: "spell.divine-favor", name: "Divine Favor", spellLevel: 1 },
  { id: "spell.doom", name: "Doom", spellLevel: 1 },
  { id: "spell.endure-elements", name: "Endure Elements", spellLevel: 1 },
  { id: "spell.enlarge-person", name: "Enlarge Person", spellLevel: 1 },
  { id: "spell.entangle", name: "Entangle", spellLevel: 1 },
  { id: "spell.entropic-shield", name: "Entropic Shield", spellLevel: 1 },
  { id: "spell.erase", name: "Erase", spellLevel: 1 },
  { id: "spell.expeditious-retreat", name: "Expeditious Retreat", spellLevel: 1 },
  { id: "spell.faerie-fire", name: "Faerie Fire", spellLevel: 1 },
  { id: "spell.feather-fall", name: "Feather Fall", spellLevel: 1 },
  { id: "spell.goodberry", name: "Goodberry", spellLevel: 1 },
  { id: "spell.grease", name: "Grease", spellLevel: 1 },
  { id: "spell.hide-from-animals", name: "Hide from Animals", spellLevel: 1 },
  { id: "spell.hide-from-undead", name: "Hide from Undead", spellLevel: 1 },
  { id: "spell.hold-portal", name: "Hold Portal", spellLevel: 1 },
  { id: "spell.hypnotism", name: "Hypnotism", spellLevel: 1 },
  { id: "spell.identify", name: "Identify", spellLevel: 1 },
  { id: "spell.inflict-light-wounds", name: "Inflict Light Wounds", spellLevel: 1 },
  { id: "spell.jump", name: "Jump", spellLevel: 1 },
  { id: "spell.lesser-confusion", name: "Lesser Confusion", spellLevel: 1 },
  { id: "spell.lesser-restoration", name: "Lesser Restoration", spellLevel: 1 },
  { id: "spell.longstrider", name: "Longstrider", spellLevel: 1 },
  { id: "spell.magic-aura", name: "Magic Aura", spellLevel: 1 },
  { id: "spell.magic-fang", name: "Magic Fang", spellLevel: 1 },
  { id: "spell.magic-stone", name: "Magic Stone", spellLevel: 1 },
  { id: "spell.magic-weapon", name: "Magic Weapon", spellLevel: 1 },
  { id: "spell.pass-without-trace", name: "Pass without Trace", spellLevel: 1 },
  { id: "spell.produce-flame", name: "Produce Flame", spellLevel: 1 },
  { id: "spell.protection-from-chaos", name: "Protection from Chaos", spellLevel: 1 },
  { id: "spell.protection-from-good", name: "Protection from Good", spellLevel: 1 },
  { id: "spell.protection-from-law", name: "Protection from Law", spellLevel: 1 },
  { id: "spell.ray-of-enfeeblement", name: "Ray of Enfeeblement", spellLevel: 1 },
  { id: "spell.reduce-person", name: "Reduce Person", spellLevel: 1 },
  { id: "spell.remove-fear", name: "Remove Fear", spellLevel: 1 },
  { id: "spell.sanctuary", name: "Sanctuary", spellLevel: 1 },
  { id: "spell.shield-of-faith", name: "Shield of Faith", spellLevel: 1 },
  { id: "spell.shillelagh", name: "Shillelagh", spellLevel: 1 },
  { id: "spell.shocking-grasp", name: "Shocking Grasp", spellLevel: 1 },
  { id: "spell.silent-image", name: "Silent Image", spellLevel: 1 },
  { id: "spell.sleep", name: "Sleep", spellLevel: 1 },
  { id: "spell.speak-with-animals", name: "Speak with Animals", spellLevel: 1 },
  { id: "spell.summon-monster-i", name: "Summon Monster I", spellLevel: 1 },
  { id: "spell.summon-natures-ally-i", name: "Summon Nature's Ally I", spellLevel: 1 },
  { id: "spell.undetectable-alignment", name: "Undetectable Alignment", spellLevel: 1 },
  { id: "spell.ventriloquism", name: "Ventriloquism", spellLevel: 1 },
] as const

describe('CRB batch S1: remaining spell levels 0 and 1', () => {
  it('resolves all 82 S1 spells in the CRB catalog', () => {
    for (const item of S1_SPELLS) {
      const spell = lookupCrbSpell(item.id)
      expect(spell, `Expected ${item.id} to exist in CRB catalog`).not.toBeNull()
      expect(spell?.id).toBe(item.id)
      expect(spell?.name).toBe(item.name)
      expect(spell?.spellLevel).toBe(item.spellLevel)
      expect(spell?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and spellLevel onto empty spell rows', () => {
    for (const item of S1_SPELLS) {
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
    entry.spells = S1_SPELLS.slice(0, 5).map((item) =>
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
    expect(view.spellcasting[entry.id]?.dcByLevel[0]).toBe(10)
    expect(view.spellcasting[entry.id]?.bonusSlotsByLevel[0]).toBe(0)
  })
})
