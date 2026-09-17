import { describe, expect, it } from 'vitest'
import { createEmptyCharacter } from '../character/createEmptyCharacter'
import {
  createEmptySpellListEntry,
  createEmptySpellcasting,
} from '../character/createRows'
import { applyCrbSpell, lookupCrbSpell } from '../content'
import { compute } from './compute'

const S3_SPELLS = [
  { id: "spell.air-walk", name: "Air Walk", spellLevel: 4 },
  { id: "spell.animate-dead", name: "Animate Dead", spellLevel: 4 },
  { id: "spell.antiplant-shell", name: "Antiplant Shell", spellLevel: 4 },
  { id: "spell.arcane-eye", name: "Arcane Eye", spellLevel: 4 },
  { id: "spell.beast-shape-ii", name: "Beast Shape II", spellLevel: 4 },
  { id: "spell.bestow-curse", name: "Bestow Curse", spellLevel: 4 },
  { id: "spell.black-tentacles", name: "Black Tentacles", spellLevel: 4 },
  { id: "spell.chaos-hammer", name: "Chaos Hammer", spellLevel: 4 },
  { id: "spell.charm-monster", name: "Charm Monster", spellLevel: 4 },
  { id: "spell.commune-with-nature", name: "Commune with Nature", spellLevel: 4 },
  { id: "spell.confusion", name: "Confusion", spellLevel: 4 },
  { id: "spell.contagion", name: "Contagion", spellLevel: 4 },
  { id: "spell.crushing-despair", name: "Crushing Despair", spellLevel: 4 },
  { id: "spell.cure-critical-wounds", name: "Cure Critical Wounds", spellLevel: 4 },
  { id: "spell.death-ward", name: "Death Ward", spellLevel: 4 },
  { id: "spell.detect-scrying", name: "Detect Scrying", spellLevel: 4 },
  { id: "spell.dimension-door", name: "Dimension Door", spellLevel: 4 },
  { id: "spell.dimensional-anchor", name: "Dimensional Anchor", spellLevel: 4 },
  { id: "spell.dispel-chaos", name: "Dispel Chaos", spellLevel: 4 },
  { id: "spell.dispel-evil", name: "Dispel Evil", spellLevel: 4 },
  { id: "spell.divination", name: "Divination", spellLevel: 4 },
  { id: "spell.divine-power", name: "Divine Power", spellLevel: 4 },
  { id: "spell.elemental-body-i", name: "Elemental Body I", spellLevel: 4 },
  { id: "spell.enervation", name: "Enervation", spellLevel: 4 },
  { id: "spell.fear", name: "Fear", spellLevel: 4 },
  { id: "spell.fire-shield", name: "Fire Shield", spellLevel: 4 },
  { id: "spell.fire-trap", name: "Fire Trap", spellLevel: 4 },
  { id: "spell.flame-strike", name: "Flame Strike", spellLevel: 4 },
  { id: "spell.freedom-of-movement", name: "Freedom of Movement", spellLevel: 4 },
  { id: "spell.giant-vermin", name: "Giant Vermin", spellLevel: 4 },
  { id: "spell.hallucinatory-terrain", name: "Hallucinatory Terrain", spellLevel: 4 },
  { id: "spell.holy-smite", name: "Holy Smite", spellLevel: 4 },
  { id: "spell.holy-sword", name: "Holy Sword", spellLevel: 4 },
  { id: "spell.ice-storm", name: "Ice Storm", spellLevel: 4 },
  { id: "spell.illusory-wall", name: "Illusory Wall", spellLevel: 4 },
  { id: "spell.imbue-with-spell-ability", name: "Imbue with Spell Ability", spellLevel: 4 },
  { id: "spell.inflict-critical-wounds", name: "Inflict Critical Wounds", spellLevel: 4 },
  { id: "spell.lesser-geas", name: "Lesser Geas", spellLevel: 4 },
  { id: "spell.lesser-planar-ally", name: "Lesser Planar Ally", spellLevel: 4 },
  { id: "spell.locate-creature", name: "Locate Creature", spellLevel: 4 },
  { id: "spell.mark-of-justice", name: "Mark of Justice", spellLevel: 4 },
  { id: "spell.mass-enlarge-person", name: "Mass Enlarge Person", spellLevel: 4 },
  { id: "spell.mass-reduce-person", name: "Mass Reduce Person", spellLevel: 4 },
  { id: "spell.minor-creation", name: "Minor Creation", spellLevel: 4 },
  { id: "spell.mnemonic-enhancer", name: "Mnemonic Enhancer", spellLevel: 4 },
  { id: "spell.modify-memory", name: "Modify Memory", spellLevel: 4 },
  { id: "spell.orders-wrath", name: "Order's Wrath", spellLevel: 4 },
  { id: "spell.phantasmal-killer", name: "Phantasmal Killer", spellLevel: 4 },
  { id: "spell.rainbow-pattern", name: "Rainbow Pattern", spellLevel: 4 },
  { id: "spell.reincarnate", name: "Reincarnate", spellLevel: 4 },
  { id: "spell.remove-curse", name: "Remove Curse", spellLevel: 4 },
  { id: "spell.resilient-sphere", name: "Resilient Sphere", spellLevel: 4 },
  { id: "spell.restoration", name: "Restoration", spellLevel: 4 },
  { id: "spell.rusting-grasp", name: "Rusting Grasp", spellLevel: 4 },
  { id: "spell.scrying", name: "Scrying", spellLevel: 4 },
  { id: "spell.secure-shelter", name: "Secure Shelter", spellLevel: 4 },
  { id: "spell.shadow-conjuration", name: "Shadow Conjuration", spellLevel: 4 },
  { id: "spell.shout", name: "Shout", spellLevel: 4 },
  { id: "spell.solid-fog", name: "Solid Fog", spellLevel: 4 },
  { id: "spell.spell-immunity", name: "Spell Immunity", spellLevel: 4 },
  { id: "spell.spike-stones", name: "Spike Stones", spellLevel: 4 },
  { id: "spell.stone-shape", name: "Stone Shape", spellLevel: 4 },
  { id: "spell.stoneskin", name: "Stoneskin", spellLevel: 4 },
  { id: "spell.summon-monster-iv", name: "Summon Monster IV", spellLevel: 4 },
  { id: "spell.summon-natures-ally-iv", name: "Summon Nature's Ally IV", spellLevel: 4 },
  { id: "spell.tree-stride", name: "Tree Stride", spellLevel: 4 },
  { id: "spell.unholy-blight", name: "Unholy Blight", spellLevel: 4 },
  { id: "spell.wall-of-fire", name: "Wall of Fire", spellLevel: 4 },
  { id: "spell.wall-of-ice", name: "Wall of Ice", spellLevel: 4 },
  { id: "spell.zone-of-silence", name: "Zone of Silence", spellLevel: 4 },
  { id: "spell.animal-growth", name: "Animal Growth", spellLevel: 5 },
  { id: "spell.atonement-fm", name: "Atonement FM", spellLevel: 5 },
  { id: "spell.awaken", name: "Awaken", spellLevel: 5 },
  { id: "spell.baleful-polymorph", name: "Baleful Polymorph", spellLevel: 5 },
  { id: "spell.beast-shape-iii", name: "Beast Shape III", spellLevel: 5 },
  { id: "spell.blight", name: "Blight", spellLevel: 5 },
  { id: "spell.break-enchantment", name: "Break Enchantment", spellLevel: 5 },
  { id: "spell.breath-of-life", name: "Breath of Life", spellLevel: 5 },
  { id: "spell.call-lightning-storm", name: "Call Lightning Storm", spellLevel: 5 },
  { id: "spell.cloudkill", name: "Cloudkill", spellLevel: 5 },
  { id: "spell.commune", name: "Commune", spellLevel: 5 },
  { id: "spell.cone-of-cold", name: "Cone of Cold", spellLevel: 5 },
  { id: "spell.contact-other-plane", name: "Contact Other Plane", spellLevel: 5 },
  { id: "spell.control-winds", name: "Control Winds", spellLevel: 5 },
  { id: "spell.dismissal", name: "Dismissal", spellLevel: 5 },
  { id: "spell.dispel-good", name: "Dispel Good", spellLevel: 5 },
  { id: "spell.dispel-law", name: "Dispel Law", spellLevel: 5 },
  { id: "spell.disrupting-weapon", name: "Disrupting Weapon", spellLevel: 5 },
  { id: "spell.dominate-person", name: "Dominate Person", spellLevel: 5 },
  { id: "spell.dream", name: "Dream", spellLevel: 5 },
  { id: "spell.elemental-body-ii", name: "Elemental Body II", spellLevel: 5 },
  { id: "spell.fabricate", name: "Fabricate", spellLevel: 5 },
  { id: "spell.false-vision", name: "False Vision", spellLevel: 5 },
  { id: "spell.feeblemind", name: "Feeblemind", spellLevel: 5 },
  { id: "spell.greater-command", name: "Greater Command", spellLevel: 5 },
  { id: "spell.hallow", name: "Hallow", spellLevel: 5 },
  { id: "spell.hold-monster", name: "Hold Monster", spellLevel: 5 },
  { id: "spell.insect-plague", name: "Insect Plague", spellLevel: 5 },
  { id: "spell.interposing-hand", name: "Interposing Hand", spellLevel: 5 },
  { id: "spell.lesser-planar-binding", name: "Lesser Planar Binding", spellLevel: 5 },
  { id: "spell.mages-faithful-hound", name: "Mage's Faithful Hound", spellLevel: 5 },
  { id: "spell.mages-private-sanctum", name: "Mage's Private Sanctum", spellLevel: 5 },
  { id: "spell.magic-jar", name: "Magic Jar", spellLevel: 5 },
  { id: "spell.major-creation", name: "Major Creation", spellLevel: 5 },
  { id: "spell.mass-cure-light-wounds", name: "Mass Cure Light Wounds", spellLevel: 5 },
  { id: "spell.mass-inflict-light-wounds", name: "Mass Inflict Light Wounds", spellLevel: 5 },
  { id: "spell.mind-fog", name: "Mind Fog", spellLevel: 5 },
  { id: "spell.mirage-arcana", name: "Mirage Arcana", spellLevel: 5 },
  { id: "spell.nightmare", name: "Nightmare", spellLevel: 5 },
  { id: "spell.overland-flight", name: "Overland Flight", spellLevel: 5 },
  { id: "spell.passwall", name: "Passwall", spellLevel: 5 },
  { id: "spell.permanency", name: "Permanency", spellLevel: 5 },
  { id: "spell.persistent-image", name: "Persistent Image", spellLevel: 5 },
  { id: "spell.plant-shape-i", name: "Plant Shape I", spellLevel: 5 },
  { id: "spell.polymorph", name: "Polymorph", spellLevel: 5 },
  { id: "spell.prying-eyes", name: "Prying Eyes", spellLevel: 5 },
  { id: "spell.raise-dead", name: "Raise Dead", spellLevel: 5 },
  { id: "spell.righteous-might", name: "Righteous Might", spellLevel: 5 },
  { id: "spell.secret-chest", name: "Secret Chest", spellLevel: 5 },
  { id: "spell.seeming", name: "Seeming", spellLevel: 5 },
  { id: "spell.sending", name: "Sending", spellLevel: 5 },
  { id: "spell.shadow-evocation", name: "Shadow Evocation", spellLevel: 5 },
  { id: "spell.slay-living", name: "Slay Living", spellLevel: 5 },
  { id: "spell.song-of-discord", name: "Song of Discord", spellLevel: 5 },
  { id: "spell.spell-resistance", name: "Spell Resistance", spellLevel: 5 },
  { id: "spell.summon-monster-v", name: "Summon Monster V", spellLevel: 5 },
  { id: "spell.summon-natures-ally-v", name: "Summon Nature's Ally V", spellLevel: 5 },
  { id: "spell.symbol-of-pain", name: "Symbol of Pain", spellLevel: 5 },
  { id: "spell.symbol-of-sleep", name: "Symbol of Sleep", spellLevel: 5 },
  { id: "spell.telekinesis", name: "Telekinesis", spellLevel: 5 },
  { id: "spell.telepathic-bond", name: "Telepathic Bond", spellLevel: 5 },
  { id: "spell.teleport", name: "Teleport", spellLevel: 5 },
  { id: "spell.transmute-mud-to-rock", name: "Transmute Mud to Rock", spellLevel: 5 },
  { id: "spell.transmute-rock-to-mud", name: "Transmute Rock to Mud", spellLevel: 5 },
  { id: "spell.unhallow", name: "Unhallow", spellLevel: 5 },
  { id: "spell.wall-of-force", name: "Wall of Force", spellLevel: 5 },
  { id: "spell.wall-of-stone", name: "Wall of Stone", spellLevel: 5 },
  { id: "spell.wall-of-thorns", name: "Wall of Thorns", spellLevel: 5 },
  { id: "spell.waves-of-fatigue", name: "Waves of Fatigue", spellLevel: 5 },
] as const

describe('CRB batch S3: remaining spell levels 4 and 5', () => {
  it('resolves all 139 S3 spells in the CRB catalog', () => {
    for (const item of S3_SPELLS) {
      const spell = lookupCrbSpell(item.id)
      expect(spell, `Expected ${item.id} to exist in CRB catalog`).not.toBeNull()
      expect(spell?.id).toBe(item.id)
      expect(spell?.name).toBe(item.name)
      expect(spell?.spellLevel).toBe(item.spellLevel)
      expect(spell?.source?.book).toBe('CRB')
    }
  })

  it('stamps catalog identity and spellLevel onto empty spell rows', () => {
    for (const item of S3_SPELLS) {
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
    entry.spells = S3_SPELLS.slice(0, 5).map((item) =>
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
    expect(view.spellcasting[entry.id]?.dcByLevel[4]).toBe(14)
    expect(view.spellcasting[entry.id]?.bonusSlotsByLevel[4]).toBe(0)
  })
})
