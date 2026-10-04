import { describe, expect, it } from 'vitest'
import { lookupOgcName, OGC_ENTRIES } from './ogcPack'

const SMOKE_SET = [
  { id: 'spell.fireball', kind: 'spell', name: 'Fireball' },
  { id: 'feat.power-attack', kind: 'feat', name: 'Power Attack' },
  { id: 'feature.arcane-bond', kind: 'feature', name: 'Arcane Bond' },
  { id: 'spell.evolution-surge', kind: 'spell', name: 'Evolution Surge' },
] as const

const BATCH_ER = [
  { id: 'feature.physical-enhancement', kind: 'feature', name: 'Physical Enhancement' },
  { id: 'feature.telekinetic-fist', kind: 'feature', name: 'Telekinetic Fist' },
] as const

const BATCH_F1A = [
  { id: 'feat.agile-maneuvers', kind: 'feat', name: 'Agile Maneuvers' },
  { id: 'feat.arcane-armor-mastery', kind: 'feat', name: 'Arcane Armor Mastery' },
  { id: 'feat.arcane-armor-training', kind: 'feat', name: 'Arcane Armor Training' },
  { id: 'feat.arcane-strike', kind: 'feat', name: 'Arcane Strike' },
  { id: 'feat.armor-proficiency-heavy', kind: 'feat', name: 'Armor Proficiency, Heavy' },
  { id: 'feat.armor-proficiency-light', kind: 'feat', name: 'Armor Proficiency, Light' },
  { id: 'feat.armor-proficiency-medium', kind: 'feat', name: 'Armor Proficiency, Medium' },
  { id: 'feat.bleeding-critical', kind: 'feat', name: 'Bleeding Critical' },
  { id: 'feat.blind-fight', kind: 'feat', name: 'Blind-Fight' },
  { id: 'feat.blinding-critical', kind: 'feat', name: 'Blinding Critical' },
  { id: 'feat.catch-off-guard', kind: 'feat', name: 'Catch Off-Guard' },
  { id: 'feat.channel-smite', kind: 'feat', name: 'Channel Smite' },
  { id: 'feat.cleave', kind: 'feat', name: 'Cleave' },
  { id: 'feat.combat-expertise', kind: 'feat', name: 'Combat Expertise' },
  { id: 'feat.combat-reflexes', kind: 'feat', name: 'Combat Reflexes' },
  { id: 'feat.critical-focus', kind: 'feat', name: 'Critical Focus' },
  { id: 'feat.critical-mastery', kind: 'feat', name: 'Critical Mastery' },
  { id: 'feat.dazzling-display', kind: 'feat', name: 'Dazzling Display' },
] as const

const BATCH_F1B = [
  { id: 'feat.deadly-aim', kind: 'feat', name: 'Deadly Aim' },
  { id: 'feat.deadly-stroke', kind: 'feat', name: 'Deadly Stroke' },
  { id: 'feat.deafening-critical', kind: 'feat', name: 'Deafening Critical' },
  { id: 'feat.defensive-combat-training', kind: 'feat', name: 'Defensive Combat Training' },
  { id: 'feat.deflect-arrows', kind: 'feat', name: 'Deflect Arrows' },
  { id: 'feat.disruptive', kind: 'feat', name: 'Disruptive' },
  { id: 'feat.dodge', kind: 'feat', name: 'Dodge' },
  { id: 'feat.double-slice', kind: 'feat', name: 'Double Slice' },
  { id: 'feat.exhausting-critical', kind: 'feat', name: 'Exhausting Critical' },
  { id: 'feat.exotic-weapon-proficiency', kind: 'feat', name: 'Exotic Weapon Proficiency' },
  { id: 'feat.far-shot', kind: 'feat', name: 'Far Shot' },
  { id: 'feat.gorgons-fist', kind: 'feat', name: "Gorgon's Fist" },
  { id: 'feat.great-cleave', kind: 'feat', name: 'Great Cleave' },
  { id: 'feat.greater-bull-rush', kind: 'feat', name: 'Greater Bull Rush' },
  { id: 'feat.greater-disarm', kind: 'feat', name: 'Greater Disarm' },
  { id: 'feat.greater-feint', kind: 'feat', name: 'Greater Feint' },
  { id: 'feat.greater-grapple', kind: 'feat', name: 'Greater Grapple' },
  { id: 'feat.greater-overrun', kind: 'feat', name: 'Greater Overrun' },
] as const

const PACKED = [...SMOKE_SET, ...BATCH_ER, ...BATCH_F1A, ...BATCH_F1B]

describe('PF1e OGC encyclopedia pack', () => {
  it('ships the smoke set plus batches E-R, F1a, and F1b and nothing else', () => {
    expect(OGC_ENTRIES.map((entry) => entry.id)).toEqual(PACKED.map((entry) => entry.id))
  })

  it('joins every entry to a mechanic catalog name', () => {
    for (const expected of PACKED) {
      const entry = OGC_ENTRIES.find((row) => row.id === expected.id)
      expect(entry?.kind).toBe(expected.kind)
      expect(entry?.body.length).toBeGreaterThan(0)
      expect(lookupOgcName(entry!)).toBe(expected.name)
    }
  })

  it('rejects duplicate ids', () => {
    const ids = OGC_ENTRIES.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
