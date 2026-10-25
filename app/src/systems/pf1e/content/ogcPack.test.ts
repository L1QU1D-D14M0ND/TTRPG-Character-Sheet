import { describe, expect, it } from 'vitest'
import { lookupOgcName, OGC_ENTRIES } from './ogcPack'
import { groups } from './catalogIndex'

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

const BATCH_F1C = [
  { id: 'feat.greater-penetrating-strike', kind: 'feat', name: 'Greater Penetrating Strike' },
  { id: 'feat.greater-shield-focus', kind: 'feat', name: 'Greater Shield Focus' },
  { id: 'feat.greater-sunder', kind: 'feat', name: 'Greater Sunder' },
  { id: 'feat.greater-trip', kind: 'feat', name: 'Greater Trip' },
  { id: 'feat.greater-two-weapon-fighting', kind: 'feat', name: 'Greater Two-Weapon Fighting' },
  { id: 'feat.greater-vital-strike', kind: 'feat', name: 'Greater Vital Strike' },
  { id: 'feat.greater-weapon-focus', kind: 'feat', name: 'Greater Weapon Focus' },
  { id: 'feat.greater-weapon-specialization', kind: 'feat', name: 'Greater Weapon Specialization' },
  { id: 'feat.improved-bull-rush', kind: 'feat', name: 'Improved Bull Rush' },
  { id: 'feat.improved-critical', kind: 'feat', name: 'Improved Critical' },
  { id: 'feat.improved-disarm', kind: 'feat', name: 'Improved Disarm' },
  { id: 'feat.improved-feint', kind: 'feat', name: 'Improved Feint' },
  { id: 'feat.improved-grapple', kind: 'feat', name: 'Improved Grapple' },
  { id: 'feat.improved-overrun', kind: 'feat', name: 'Improved Overrun' },
  { id: 'feat.improved-precise-shot', kind: 'feat', name: 'Improved Precise Shot' },
  { id: 'feat.improved-shield-bash', kind: 'feat', name: 'Improved Shield Bash' },
  { id: 'feat.improved-sunder', kind: 'feat', name: 'Improved Sunder' },
  { id: 'feat.improved-trip', kind: 'feat', name: 'Improved Trip' },
] as const

const BATCH_F2A = [
  { id: 'feat.improved-two-weapon-fighting', kind: 'feat', name: 'Improved Two-Weapon Fighting' },
  { id: 'feat.improved-unarmed-strike', kind: 'feat', name: 'Improved Unarmed Strike' },
  { id: 'feat.improved-vital-strike', kind: 'feat', name: 'Improved Vital Strike' },
  { id: 'feat.improvised-weapon-mastery', kind: 'feat', name: 'Improvised Weapon Mastery' },
  { id: 'feat.intimidating-prowess', kind: 'feat', name: 'Intimidating Prowess' },
  { id: 'feat.lightning-stance', kind: 'feat', name: 'Lightning Stance' },
  { id: 'feat.lunge', kind: 'feat', name: 'Lunge' },
  { id: 'feat.manyshot', kind: 'feat', name: 'Manyshot' },
  { id: 'feat.martial-weapon-proficiency', kind: 'feat', name: 'Martial Weapon Proficiency' },
  { id: 'feat.medusas-wrath', kind: 'feat', name: "Medusa's Wrath" },
  { id: 'feat.mobility', kind: 'feat', name: 'Mobility' },
  { id: 'feat.mounted-archery', kind: 'feat', name: 'Mounted Archery' },
  { id: 'feat.mounted-combat', kind: 'feat', name: 'Mounted Combat' },
  { id: 'feat.penetrating-strike', kind: 'feat', name: 'Penetrating Strike' },
  { id: 'feat.pinpoint-targeting', kind: 'feat', name: 'Pinpoint Targeting' },
  { id: 'feat.precise-shot', kind: 'feat', name: 'Precise Shot' },
  { id: 'feat.quick-draw', kind: 'feat', name: 'Quick Draw' },
] as const

const BATCH_F2B = [
  { id: 'feat.rapid-reload', kind: 'feat', name: 'Rapid Reload' },
  { id: 'feat.rapid-shot', kind: 'feat', name: 'Rapid Shot' },
  { id: 'feat.ride-by-attack', kind: 'feat', name: 'Ride-By Attack' },
  { id: 'feat.scorpion-style', kind: 'feat', name: 'Scorpion Style' },
  { id: 'feat.shatter-defenses', kind: 'feat', name: 'Shatter Defenses' },
  { id: 'feat.shield-focus', kind: 'feat', name: 'Shield Focus' },
  { id: 'feat.shield-master', kind: 'feat', name: 'Shield Master' },
  { id: 'feat.shield-proficiency', kind: 'feat', name: 'Shield Proficiency' },
  { id: 'feat.shield-slam', kind: 'feat', name: 'Shield Slam' },
  { id: 'feat.shot-on-the-run', kind: 'feat', name: 'Shot on the Run' },
  { id: 'feat.sickening-critical', kind: 'feat', name: 'Sickening Critical' },
  { id: 'feat.simple-weapon-proficiency', kind: 'feat', name: 'Simple Weapon Proficiency' },
  { id: 'feat.snatch-arrows', kind: 'feat', name: 'Snatch Arrows' },
  { id: 'feat.spellbreaker', kind: 'feat', name: 'Spellbreaker' },
  { id: 'feat.spirited-charge', kind: 'feat', name: 'Spirited Charge' },
  { id: 'feat.spring-attack', kind: 'feat', name: 'Spring Attack' },
  { id: 'feat.staggering-critical', kind: 'feat', name: 'Staggering Critical' },
] as const

const BATCH_F2C = [
  { id: 'feat.stand-still', kind: 'feat', name: 'Stand Still' },
  { id: 'feat.step-up', kind: 'feat', name: 'Step Up' },
  { id: 'feat.strike-back', kind: 'feat', name: 'Strike Back' },
  { id: 'feat.stunning-critical', kind: 'feat', name: 'Stunning Critical' },
  { id: 'feat.stunning-fist', kind: 'feat', name: 'Stunning Fist' },
  { id: 'feat.throw-anything', kind: 'feat', name: 'Throw Anything' },
  { id: 'feat.tiring-critical', kind: 'feat', name: 'Tiring Critical' },
  { id: 'feat.tower-shield-proficiency', kind: 'feat', name: 'Tower Shield Proficiency' },
  { id: 'feat.trample', kind: 'feat', name: 'Trample' },
  { id: 'feat.two-weapon-defense', kind: 'feat', name: 'Two-Weapon Defense' },
  { id: 'feat.two-weapon-fighting', kind: 'feat', name: 'Two-Weapon Fighting' },
  { id: 'feat.two-weapon-rend', kind: 'feat', name: 'Two-Weapon Rend' },
  { id: 'feat.unseat', kind: 'feat', name: 'Unseat' },
  { id: 'feat.vital-strike', kind: 'feat', name: 'Vital Strike' },
  { id: 'feat.weapon-finesse', kind: 'feat', name: 'Weapon Finesse' },
  { id: 'feat.weapon-specialization', kind: 'feat', name: 'Weapon Specialization' },
  { id: 'feat.whirlwind-attack', kind: 'feat', name: 'Whirlwind Attack' },
  { id: 'feat.wind-stance', kind: 'feat', name: 'Wind Stance' },
] as const

const BATCH_F3A = [
  { id: 'feat.acrobatic', kind: 'feat', name: 'Acrobatic' },
  { id: 'feat.acrobatic-steps', kind: 'feat', name: 'Acrobatic Steps' },
  { id: 'feat.alertness', kind: 'feat', name: 'Alertness' },
  { id: 'feat.alignment-channel', kind: 'feat', name: 'Alignment Channel' },
  { id: 'feat.animal-affinity', kind: 'feat', name: 'Animal Affinity' },
  { id: 'feat.athletic', kind: 'feat', name: 'Athletic' },
  { id: 'feat.augment-summoning', kind: 'feat', name: 'Augment Summoning' },
  { id: 'feat.combat-casting', kind: 'feat', name: 'Combat Casting' },
  { id: 'feat.command-undead', kind: 'feat', name: 'Command Undead' },
  { id: 'feat.deceitful', kind: 'feat', name: 'Deceitful' },
  { id: 'feat.deft-hands', kind: 'feat', name: 'Deft Hands' },
  { id: 'feat.diehard', kind: 'feat', name: 'Diehard' },
  { id: 'feat.elemental-channel', kind: 'feat', name: 'Elemental Channel' },
  { id: 'feat.endurance', kind: 'feat', name: 'Endurance' },
  { id: 'feat.extra-channel', kind: 'feat', name: 'Extra Channel' },
  { id: 'feat.extra-ki', kind: 'feat', name: 'Extra Ki' },
] as const

const BATCH_F3B = [
  { id: 'feat.extra-lay-on-hands', kind: 'feat', name: 'Extra Lay On Hands' },
  { id: 'feat.extra-mercy', kind: 'feat', name: 'Extra Mercy' },
  { id: 'feat.extra-performance', kind: 'feat', name: 'Extra Performance' },
  { id: 'feat.extra-rage', kind: 'feat', name: 'Extra Rage' },
  { id: 'feat.fleet', kind: 'feat', name: 'Fleet' },
  { id: 'feat.great-fortitude', kind: 'feat', name: 'Great Fortitude' },
  { id: 'feat.greater-spell-focus', kind: 'feat', name: 'Greater Spell Focus' },
  { id: 'feat.greater-spell-penetration', kind: 'feat', name: 'Greater Spell Penetration' },
  { id: 'feat.improved-channel', kind: 'feat', name: 'Improved Channel' },
  { id: 'feat.improved-counterspell', kind: 'feat', name: 'Improved Counterspell' },
  { id: 'feat.improved-familiar', kind: 'feat', name: 'Improved Familiar' },
  { id: 'feat.improved-great-fortitude', kind: 'feat', name: 'Improved Great Fortitude' },
  { id: 'feat.improved-iron-will', kind: 'feat', name: 'Improved Iron Will' },
  { id: 'feat.improved-lightning-reflexes', kind: 'feat', name: 'Improved Lightning Reflexes' },
  { id: 'feat.iron-will', kind: 'feat', name: 'Iron Will' },
  { id: 'feat.leadership', kind: 'feat', name: 'Leadership' },
] as const

const PACKED = [
  ...SMOKE_SET,
  ...BATCH_ER,
  ...BATCH_F1A,
  ...BATCH_F1B,
  ...BATCH_F1C,
  ...BATCH_F2A,
  ...BATCH_F2B,
  ...BATCH_F2C,
  ...BATCH_F3A,
  ...BATCH_F3B,
]

describe('PF1e OGC encyclopedia pack', () => {
  it('ships the smoke set plus batches E-R, F1a through F3b and nothing else', () => {
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

  // These guards do not depend on the batch roster above, so a typo in a
  // future batch fails here even if the roster is updated to match it. An
  // unjoinable id is otherwise silent: the encyclopedia just drops the row.
  describe('entries.json integrity', () => {
    it('joins every packed id to a mechanic catalog row', () => {
      const orphans = OGC_ENTRIES.filter((entry) => lookupOgcName(entry) === null)
      expect(orphans.map((entry) => entry.id)).toEqual([])
    })

    it('prefixes every id with its kind', () => {
      const mismatched = OGC_ENTRIES.filter(
        (entry) => !entry.id.startsWith(`${entry.kind}.`),
      )
      expect(mismatched.map((entry) => entry.id)).toEqual([])
    })

    it('keeps every body a trimmed, non-empty summary', () => {
      const malformed = OGC_ENTRIES.filter(
        (entry) => entry.body.trim().length === 0 || entry.body !== entry.body.trim(),
      )
      expect(malformed.map((entry) => entry.id)).toEqual([])
    })

    /**
     * `sidebar-tools-encyclopedia.md` publishes a per-batch "rows still to
     * add" column. That arithmetic was wrong once: it listed the whole CRB
     * spell count against the L1-L9 row, double-counting L0. Pin the totals
     * so the doc and the packs have to agree.
     */
    it('leaves exactly the documented number of rows still to pack', () => {
      const packed = new Set(OGC_ENTRIES.map((entry) => entry.id))
      const remaining = (kind: 'feat' | 'spell') =>
        groups(kind)
          .flatMap((group) => group.rows)
          .filter((row) => !packed.has(row.id)).length

      // F3c-F4 + F0
      expect(remaining('feat')).toBe(28 + 10)
      // L0 + L1-L9 + A1
      expect(remaining('spell')).toBe(28 + 593 + 26)
      expect(remaining('feat') + remaining('spell')).toBe(685)
    })
  })
})
