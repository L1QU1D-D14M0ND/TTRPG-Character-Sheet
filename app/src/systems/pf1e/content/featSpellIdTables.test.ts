import { describe, expect, it } from 'vitest'
import { readRepoJson } from '../../../test/readRepoFile'
import { CRB_FEATS, CRB_SPELLS } from './crbPack'

type FeatLock = { id: string; name: string; category: string }
type SpellLock = { id: string; name: string; spellLevel: number }

type FeatSpellLock = {
  schemaVersion: number
  packedFeats: FeatLock[]
  packedSpells: SpellLock[]
  batches: Record<string, Array<FeatLock | SpellLock>>
}

const FEAT_ID = /^feat\.[a-z0-9]+(?:-[a-z0-9]+)*$/
const SPELL_ID = /^spell\.[a-z0-9]+(?:-[a-z0-9]+)*$/
const CATEGORIES = new Set([
  'general',
  'combat',
  'metamagic',
  'itemCreation',
  'other',
])

const lock = readRepoJson(
  'docs/pf1e-crb-feat-spell-ids.json',
) as FeatSpellLock

describe('CRB feat/spell id tables', () => {
  it('locks remaining feats and spells in F1–F4 and S1–S5', () => {
    expect(lock.schemaVersion).toBe(1)
    expect(lock.packedFeats.map((row) => row.id)).toEqual([
      'feat.improved-initiative',
      'feat.power-attack',
      'feat.scribe-scroll',
      'feat.spell-focus',
      'feat.weapon-focus',
      'feat.point-blank-shot',
      'feat.eschew-materials',
      'feat.heighten-spell',
      'feat.craft-wondrous-item',
      'feat.craft-magic-arms-and-armor',
      'feat.craft-construct',
      'feat.agile-maneuvers',
      'feat.arcane-armor-mastery',
      'feat.arcane-armor-training',
      'feat.arcane-strike',
      'feat.armor-proficiency-heavy',
      'feat.armor-proficiency-light',
      'feat.armor-proficiency-medium',
      'feat.bleeding-critical',
      'feat.blind-fight',
      'feat.blinding-critical',
      'feat.catch-off-guard',
      'feat.channel-smite',
      'feat.cleave',
      'feat.combat-expertise',
      'feat.combat-reflexes',
      'feat.critical-focus',
      'feat.critical-mastery',
      'feat.dazzling-display',
      'feat.deadly-aim',
      'feat.deadly-stroke',
      'feat.deafening-critical',
      'feat.defensive-combat-training',
      'feat.deflect-arrows',
      'feat.disruptive',
      'feat.dodge',
      'feat.double-slice',
      'feat.exhausting-critical',
      'feat.exotic-weapon-proficiency',
      'feat.far-shot',
      'feat.gorgons-fist',
      'feat.great-cleave',
      'feat.greater-bull-rush',
      'feat.greater-disarm',
      'feat.greater-feint',
      'feat.greater-grapple',
      'feat.greater-overrun',
      'feat.greater-penetrating-strike',
      'feat.greater-shield-focus',
      'feat.greater-sunder',
      'feat.greater-trip',
      'feat.greater-two-weapon-fighting',
      'feat.greater-vital-strike',
      'feat.greater-weapon-focus',
      'feat.greater-weapon-specialization',
      'feat.improved-bull-rush',
      'feat.improved-critical',
      'feat.improved-disarm',
      'feat.improved-feint',
      'feat.improved-grapple',
      'feat.improved-overrun',
      'feat.improved-precise-shot',
      'feat.improved-shield-bash',
      'feat.improved-sunder',
      'feat.improved-trip',
      'feat.improved-two-weapon-fighting',
      'feat.improved-unarmed-strike',
      'feat.improved-vital-strike',
      'feat.improvised-weapon-mastery',
      'feat.intimidating-prowess',
      'feat.lightning-stance',
      'feat.lunge',
      'feat.manyshot',
      'feat.martial-weapon-proficiency',
      'feat.medusas-wrath',
      'feat.mobility',
      'feat.mounted-archery',
      'feat.mounted-combat',
      'feat.penetrating-strike',
      'feat.pinpoint-targeting',
      'feat.precise-shot',
      'feat.quick-draw',
      'feat.rapid-reload',
      'feat.rapid-shot',
      'feat.ride-by-attack',
      'feat.scorpion-style',
      'feat.shatter-defenses',
      'feat.shield-focus',
      'feat.shield-master',
      'feat.shield-proficiency',
      'feat.shield-slam',
      'feat.shot-on-the-run',
      'feat.sickening-critical',
      'feat.simple-weapon-proficiency',
      'feat.snatch-arrows',
      'feat.spellbreaker',
      'feat.spirited-charge',
      'feat.spring-attack',
      'feat.staggering-critical',
      'feat.stand-still',
      'feat.step-up',
      'feat.strike-back',
      'feat.stunning-critical',
      'feat.stunning-fist',
      'feat.throw-anything',
      'feat.tiring-critical',
      'feat.tower-shield-proficiency',
      'feat.trample',
      'feat.two-weapon-defense',
      'feat.two-weapon-fighting',
      'feat.two-weapon-rend',
      'feat.unseat',
      'feat.vital-strike',
      'feat.weapon-finesse',
      'feat.weapon-specialization',
      'feat.whirlwind-attack',
      'feat.wind-stance',
      'feat.acrobatic',
      'feat.acrobatic-steps',
      'feat.alertness',
      'feat.alignment-channel',
      'feat.animal-affinity',
      'feat.athletic',
      'feat.augment-summoning',
      'feat.combat-casting',
      'feat.command-undead',
      'feat.deceitful',
      'feat.deft-hands',
      'feat.diehard',
      'feat.elemental-channel',
      'feat.endurance',
      'feat.extra-channel',
      'feat.extra-ki',
      'feat.extra-lay-on-hands',
      'feat.extra-mercy',
      'feat.extra-performance',
      'feat.extra-rage',
      'feat.fleet',
      'feat.great-fortitude',
      'feat.greater-spell-focus',
      'feat.greater-spell-penetration',
      'feat.improved-channel',
      'feat.improved-counterspell',
      'feat.improved-familiar',
      'feat.improved-great-fortitude',
      'feat.improved-iron-will',
      'feat.improved-lightning-reflexes',
      'feat.iron-will',
      'feat.leadership',
      'feat.lightning-reflexes',
      'feat.magical-aptitude',
      'feat.master-craftsman',
      'feat.natural-spell',
      'feat.nimble-moves',
      'feat.persuasive',
      'feat.run',
      'feat.selective-channeling',
      'feat.self-sufficient',
      'feat.skill-focus',
      'feat.spell-mastery',
      'feat.spell-penetration',
      'feat.stealthy',
      'feat.toughness',
      'feat.turn-undead',
      'feat.brew-potion',
      'feat.craft-rod',
      'feat.craft-staff',
      'feat.craft-wand',
      'feat.forge-ring',
      'feat.empower-spell',
      'feat.enlarge-spell',
      'feat.extend-spell',
      'feat.maximize-spell',
      'feat.quicken-spell',
      'feat.silent-spell',
      'feat.still-spell',
      'feat.widen-spell',
    ])
    expect(lock.packedSpells.slice(0, 44).map((row) => row.id)).toEqual([
      'spell.detect-magic',
      'spell.fireball',
      'spell.light',
      'spell.magic-missile',
      'spell.detect-poison',
      'spell.read-magic',
      'spell.resistance',
      'spell.acid-splash',
      'spell.flare',
      'spell.dancing-lights',
      'spell.ray-of-frost',
      'spell.ghost-sound',
      'spell.open-close',
      'spell.message',
      'spell.mage-hand',
      'spell.mending',
      'spell.arcane-mark',
      'spell.prestidigitation',
      'spell.alarm',
      'spell.comprehend-languages',
      'spell.detect-secret-doors',
      'spell.true-strike',
      'spell.mage-armor',
      'spell.obscuring-mist',
      'spell.floating-disk',
      'spell.mount',
      'spell.burning-hands',
      'spell.unseen-servant',
      'spell.shield',
      'spell.protection-from-evil',
      'spell.arcane-lock',
      'spell.detect-thoughts',
      'spell.see-invisibility',
      'spell.scorching-ray',
      'spell.invisibility',
      'spell.glitterdust',
      'spell.dispel-magic',
      'spell.haste',
      'spell.blink',
      'spell.shrink-item',
      'spell.clairaudience-clairvoyance',
      'spell.water-breathing',
      'spell.greater-invisibility',
      'spell.lesser-globe-of-invulnerability',
    ])
    expect(lock.packedSpells).toHaveLength(622)
    expect(Object.keys(lock.batches)).toEqual([])
  })

  it('uses unique kebab ids and mechanics-only fields', () => {
    const featIds = lock.packedFeats.map((row) => row.id)
    expect(new Set(featIds).size).toBe(177)

    const spellIds = lock.packedSpells.map((row) => row.id)
    expect(new Set(spellIds).size).toBe(622)

    for (const row of lock.packedFeats) {
      expect(row.id).toMatch(FEAT_ID)
      expect(row.name.length).toBeGreaterThan(0)
      expect(CATEGORIES.has(row.category)).toBe(true)
      expect(row).not.toHaveProperty('description')
      expect(row).not.toHaveProperty('benefit')
      expect(row).not.toHaveProperty('summary')
    }

    for (const row of lock.packedSpells) {
      expect(row.id).toMatch(SPELL_ID)
      expect(row.name.length).toBeGreaterThan(0)
      expect(row.spellLevel).toBeGreaterThanOrEqual(0)
      expect(row.spellLevel).toBeLessThanOrEqual(9)
      expect(row).not.toHaveProperty('description')
      expect(row).not.toHaveProperty('text')
    }
  })

  it('keeps all 177 CRB feats and 622 CRB spells packed and matching catalog json', () => {
    const packedFeatIds = new Set(CRB_FEATS.map((row) => row.id))
    const packedSpellIds = new Set(CRB_SPELLS.map((row) => row.id))
    expect(packedFeatIds.size).toBe(177)
    expect(packedSpellIds.size).toBe(622)

    for (const row of lock.packedFeats) {
      expect(packedFeatIds.has(row.id)).toBe(true)
    }
    for (const row of lock.packedSpells) {
      expect(packedSpellIds.has(row.id)).toBe(true)
    }
    const remainingIds = Object.values(lock.batches).flatMap((rows) =>
      rows.map((row) => row.id),
    )
    expect(remainingIds).toHaveLength(0)
  })
})

