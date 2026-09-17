import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from '../character/createRows'
import { applyCrbSpell, lookupCrbSpell } from '../content'
import { compute } from './compute'

const S2_SPELLS = [
  { id: "spell.acid-arrow", name: "Acid Arrow", spellLevel: 2 },
  { id: "spell.aid", name: "Aid", spellLevel: 2 },
  { id: "spell.align-weapon", name: "Align Weapon", spellLevel: 2 },
  { id: "spell.alter-self", name: "Alter Self", spellLevel: 2 },
  { id: "spell.animal-trance", name: "Animal Trance", spellLevel: 2 },
  { id: "spell.augury", name: "Augury", spellLevel: 2 },
  { id: "spell.barkskin", name: "Barkskin", spellLevel: 2 },
  { id: "spell.bears-endurance", name: "Bear's Endurance", spellLevel: 2 },
  { id: "spell.blindness-deafness", name: "Blindness/Deafness", spellLevel: 2 },
  { id: "spell.blur", name: "Blur", spellLevel: 2 },
  { id: "spell.bulls-strength", name: "Bull's Strength", spellLevel: 2 },
  { id: "spell.calm-emotions", name: "Calm Emotions", spellLevel: 2 },
  { id: "spell.cats-grace", name: "Cat's Grace", spellLevel: 2 },
  { id: "spell.chill-metal", name: "Chill Metal", spellLevel: 2 },
  { id: "spell.command-undead", name: "Command Undead", spellLevel: 2 },
  { id: "spell.consecrate", name: "Consecrate", spellLevel: 2 },
  { id: "spell.continual-flame", name: "Continual Flame", spellLevel: 2 },
  { id: "spell.cure-moderate-wounds", name: "Cure Moderate Wounds", spellLevel: 2 },
  { id: "spell.darkness", name: "Darkness", spellLevel: 2 },
  { id: "spell.darkvision", name: "Darkvision", spellLevel: 2 },
  { id: "spell.daze-monster", name: "Daze Monster", spellLevel: 2 },
  { id: "spell.death-knell", name: "Death Knell", spellLevel: 2 },
  { id: "spell.desecrate", name: "Desecrate", spellLevel: 2 },
  { id: "spell.eagles-splendor", name: "Eagle's Splendor", spellLevel: 2 },
  { id: "spell.enthrall", name: "Enthrall", spellLevel: 2 },
  { id: "spell.false-life", name: "False Life", spellLevel: 2 },
  { id: "spell.find-traps", name: "Find Traps", spellLevel: 2 },
  { id: "spell.flame-blade", name: "Flame Blade", spellLevel: 2 },
  { id: "spell.flaming-sphere", name: "Flaming Sphere", spellLevel: 2 },
  { id: "spell.fog-cloud", name: "Fog Cloud", spellLevel: 2 },
  { id: "spell.foxs-cunning", name: "Fox's Cunning", spellLevel: 2 },
  { id: "spell.ghoul-touch", name: "Ghoul Touch", spellLevel: 2 },
  { id: "spell.gust-of-wind", name: "Gust of Wind", spellLevel: 2 },
  { id: "spell.heat-metal", name: "Heat Metal", spellLevel: 2 },
  { id: "spell.hideous-laughter", name: "Hideous Laughter", spellLevel: 2 },
  { id: "spell.hold-animal", name: "Hold Animal", spellLevel: 2 },
  { id: "spell.hypnotic-pattern", name: "Hypnotic Pattern", spellLevel: 2 },
  { id: "spell.inflict-moderate-wounds", name: "Inflict Moderate Wounds", spellLevel: 2 },
  { id: "spell.knock", name: "Knock", spellLevel: 2 },
  { id: "spell.levitate", name: "Levitate", spellLevel: 2 },
  { id: "spell.locate-object", name: "Locate Object", spellLevel: 2 },
  { id: "spell.magic-mouth", name: "Magic Mouth", spellLevel: 2 },
  { id: "spell.make-whole", name: "Make Whole", spellLevel: 2 },
  { id: "spell.minor-image", name: "Minor Image", spellLevel: 2 },
  { id: "spell.mirror-image", name: "Mirror Image", spellLevel: 2 },
  { id: "spell.misdirection", name: "Misdirection", spellLevel: 2 },
  { id: "spell.obscure-object", name: "Obscure Object", spellLevel: 2 },
  { id: "spell.owls-wisdom", name: "Owl's Wisdom", spellLevel: 2 },
  { id: "spell.phantom-trap", name: "Phantom Trap", spellLevel: 2 },
  { id: "spell.protection-from-arrows", name: "Protection from Arrows", spellLevel: 2 },
  { id: "spell.pyrotechnics", name: "Pyrotechnics", spellLevel: 2 },
  { id: "spell.reduce-animal", name: "Reduce Animal", spellLevel: 2 },
  { id: "spell.remove-paralysis", name: "Remove Paralysis", spellLevel: 2 },
  { id: "spell.resist-energy", name: "Resist Energy", spellLevel: 2 },
  { id: "spell.rope-trick", name: "Rope Trick", spellLevel: 2 },
  { id: "spell.scare", name: "Scare", spellLevel: 2 },
  { id: "spell.shatter", name: "Shatter", spellLevel: 2 },
  { id: "spell.shield-other", name: "Shield Other", spellLevel: 2 },
  { id: "spell.silence", name: "Silence", spellLevel: 2 },
  { id: "spell.snare", name: "Snare", spellLevel: 2 },
  { id: "spell.soften-earth-and-stone", name: "Soften Earth and Stone", spellLevel: 2 },
  { id: "spell.sound-burst", name: "Sound Burst", spellLevel: 2 },
  { id: "spell.speak-with-plants", name: "Speak with Plants", spellLevel: 2 },
  { id: "spell.spectral-hand", name: "Spectral Hand", spellLevel: 2 },
  { id: "spell.spider-climb", name: "Spider Climb", spellLevel: 2 },
  { id: "spell.spike-growth", name: "Spike Growth", spellLevel: 2 },
  { id: "spell.spiritual-weapon", name: "Spiritual Weapon", spellLevel: 2 },
  { id: "spell.status", name: "Status", spellLevel: 2 },
  { id: "spell.summon-monster-ii", name: "Summon Monster II", spellLevel: 2 },
  { id: "spell.summon-natures-ally-ii", name: "Summon Nature's Ally II", spellLevel: 2 },
  { id: "spell.summon-swarm", name: "Summon Swarm", spellLevel: 2 },
  { id: "spell.touch-of-idiocy", name: "Touch of Idiocy", spellLevel: 2 },
  { id: "spell.tree-shape", name: "Tree Shape", spellLevel: 2 },
  { id: "spell.warp-wood", name: "Warp Wood", spellLevel: 2 },
  { id: "spell.web", name: "Web", spellLevel: 2 },
  { id: "spell.whispering-wind", name: "Whispering Wind", spellLevel: 2 },
  { id: "spell.wood-shape", name: "Wood Shape", spellLevel: 2 },
  { id: "spell.zone-of-truth", name: "Zone of Truth", spellLevel: 2 },
  { id: "spell.arcane-sight", name: "Arcane Sight", spellLevel: 3 },
  { id: "spell.beast-shape-i", name: "Beast Shape I", spellLevel: 3 },
  { id: "spell.call-lightning", name: "Call Lightning", spellLevel: 3 },
  { id: "spell.command-plants", name: "Command Plants", spellLevel: 3 },
  { id: "spell.create-food-and-water", name: "Create Food and Water", spellLevel: 3 },
  { id: "spell.cure-serious-wounds", name: "Cure Serious Wounds", spellLevel: 3 },
  { id: "spell.daylight", name: "Daylight", spellLevel: 3 },
  { id: "spell.deep-slumber", name: "Deep Slumber", spellLevel: 3 },
  { id: "spell.deeper-darkness", name: "Deeper Darkness", spellLevel: 3 },
  { id: "spell.diminish-plants", name: "Diminish Plants", spellLevel: 3 },
  { id: "spell.discern-lies", name: "Discern Lies", spellLevel: 3 },
  { id: "spell.displacement", name: "Displacement", spellLevel: 3 },
  { id: "spell.dominate-animal", name: "Dominate Animal", spellLevel: 3 },
  { id: "spell.explosive-runes", name: "Explosive Runes", spellLevel: 3 },
  { id: "spell.flame-arrow", name: "Flame Arrow", spellLevel: 3 },
  { id: "spell.fly", name: "Fly", spellLevel: 3 },
  { id: "spell.gaseous-form", name: "Gaseous Form", spellLevel: 3 },
  { id: "spell.gentle-repose", name: "Gentle Repose", spellLevel: 3 },
  { id: "spell.glibness", name: "Glibness", spellLevel: 3 },
  { id: "spell.glyph-of-warding", name: "Glyph of Warding", spellLevel: 3 },
  { id: "spell.good-hope", name: "Good Hope", spellLevel: 3 },
  { id: "spell.greater-magic-fang", name: "Greater Magic Fang", spellLevel: 3 },
  { id: "spell.greater-magic-weapon", name: "Greater Magic Weapon", spellLevel: 3 },
  { id: "spell.halt-undead", name: "Halt Undead", spellLevel: 3 },
  { id: "spell.heal-mount", name: "Heal Mount", spellLevel: 3 },
  { id: "spell.helping-hand", name: "Helping Hand", spellLevel: 3 },
  { id: "spell.heroism", name: "Heroism", spellLevel: 3 },
  { id: "spell.hold-person", name: "Hold Person", spellLevel: 3 },
  { id: "spell.illusory-script", name: "Illusory Script", spellLevel: 3 },
  { id: "spell.inflict-serious-wounds", name: "Inflict Serious Wounds", spellLevel: 3 },
  { id: "spell.invisibility-purge", name: "Invisibility Purge", spellLevel: 3 },
  { id: "spell.invisibility-sphere", name: "Invisibility Sphere", spellLevel: 3 },
  { id: "spell.keen-edge", name: "Keen Edge", spellLevel: 3 },
  { id: "spell.lightning-bolt", name: "Lightning Bolt", spellLevel: 3 },
  { id: "spell.magic-circle-against-chaos", name: "Magic Circle against Chaos", spellLevel: 3 },
  { id: "spell.magic-circle-against-evil", name: "Magic Circle against Evil", spellLevel: 3 },
  { id: "spell.magic-circle-against-good", name: "Magic Circle against Good", spellLevel: 3 },
  { id: "spell.magic-circle-against-law", name: "Magic Circle against Law", spellLevel: 3 },
  { id: "spell.magic-vestment", name: "Magic Vestment", spellLevel: 3 },
  { id: "spell.major-image", name: "Major Image", spellLevel: 3 },
  { id: "spell.meld-into-stone", name: "Meld into Stone", spellLevel: 3 },
  { id: "spell.neutralize-poison", name: "Neutralize Poison", spellLevel: 3 },
  { id: "spell.nondetection", name: "Nondetection", spellLevel: 3 },
  { id: "spell.phantom-steed", name: "Phantom Steed", spellLevel: 3 },
  { id: "spell.plant-growth", name: "Plant Growth", spellLevel: 3 },
  { id: "spell.poison", name: "Poison", spellLevel: 3 },
  { id: "spell.prayer", name: "Prayer", spellLevel: 3 },
  { id: "spell.protection-from-energy", name: "Protection from Energy", spellLevel: 3 },
  { id: "spell.quench", name: "Quench", spellLevel: 3 },
  { id: "spell.ray-of-exhaustion", name: "Ray of Exhaustion", spellLevel: 3 },
  { id: "spell.remove-blindness-deafness", name: "Remove Blindness/Deafness", spellLevel: 3 },
  { id: "spell.remove-disease", name: "Remove Disease", spellLevel: 3 },
  { id: "spell.repel-vermin", name: "Repel Vermin", spellLevel: 3 },
  { id: "spell.sculpt-sound", name: "Sculpt Sound", spellLevel: 3 },
  { id: "spell.searing-light", name: "Searing Light", spellLevel: 3 },
  { id: "spell.secret-page", name: "Secret Page", spellLevel: 3 },
  { id: "spell.sepia-snake-sigil", name: "Sepia Snake Sigil", spellLevel: 3 },
  { id: "spell.sleet-storm", name: "Sleet Storm", spellLevel: 3 },
  { id: "spell.slow", name: "Slow", spellLevel: 3 },
  { id: "spell.speak-with-dead", name: "Speak with Dead", spellLevel: 3 },
  { id: "spell.stinking-cloud", name: "Stinking Cloud", spellLevel: 3 },
  { id: "spell.suggestion", name: "Suggestion", spellLevel: 3 },
  { id: "spell.summon-monster-iii", name: "Summon Monster III", spellLevel: 3 },
  { id: "spell.summon-natures-ally-iii", name: "Summon Nature's Ally III", spellLevel: 3 },
  { id: "spell.tiny-hut", name: "Tiny Hut", spellLevel: 3 },
  { id: "spell.tongues", name: "Tongues", spellLevel: 3 },
  { id: "spell.vampiric-touch", name: "Vampiric Touch", spellLevel: 3 },
  { id: "spell.water-walk", name: "Water Walk", spellLevel: 3 },
  { id: "spell.wind-wall", name: "Wind Wall", spellLevel: 3 },
] as const

describe('CRB batch S2: remaining spell levels 2 and 3', () => {
  it('resolves all 147 S2 spells in the CRB catalog', () => {
    for (const item of S2_SPELLS) {
      const spell = lookupCrbSpell(item.id)
      expect(spell, `Expected ${item.id} to exist in CRB catalog`).not.toBeNull()
      expect(spell?.id).toBe(item.id)
      expect(spell?.name).toBe(item.name)
      expect(spell?.spellLevel).toBe(item.spellLevel)
      expect(spell?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and spellLevel onto empty spell rows', () => {
    for (const item of S2_SPELLS) {
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
    entry.spells = S2_SPELLS.slice(0, 5).map((item) =>
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
    expect(view.spellcasting[entry.id]?.dcByLevel[2]).toBe(12)
    expect(view.spellcasting[entry.id]?.bonusSlotsByLevel[2]).toBe(0)
  })
})
