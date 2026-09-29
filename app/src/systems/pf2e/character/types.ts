/**
 * Character document types aligned with schemas/character.schema.json (schemaVersion 1).
 */

import type { AbilityKey } from '../../../shared/abilities'
import type { ContentRef as ContentRefCore, PublicationRef } from '../../../shared/contentRef'
import type { Effect } from '../../../shared/effects'
import type { OverrideValue } from '../../../shared/overrides'
import type { Currency } from '../../../shared/currency'
import type { Notes } from '../../../shared/notes'

export type { PublicationRef }
export type { Effect } from '../../../shared/effects'
export type { OverrideValue } from '../../../shared/overrides'
export type { Currency } from '../../../shared/currency'
export type { Notes } from '../../../shared/notes'

export type RulesetSource = 'remaster' | 'legacy' | 'custom'
export type PreferredRuleset = 'remaster' | 'legacy'
export type ProficiencyRank = 'untrained' | 'trained' | 'expert' | 'master' | 'legendary'
export type AttributeKey = AbilityKey
export type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'

export interface ContentRef extends ContentRefCore {
  rulesetSource?: RulesetSource
  legacyId?: string | null
}

export interface ModifierBreakdown {
  untyped?: number
  item?: number
  status?: number
  circumstance?: number
  ability?: number
  proficiency?: number
  other?: number
}

export interface Meta {
  createdAt: string
  updatedAt: string
  preferredRuleset: PreferredRuleset
  appVersion: string
  locale: string
  characterId?: string
}

export interface Identity {
  characterName: string
  playerName?: string
  level: number
  xp?: number
  ancestry: ContentRef
  heritage: ContentRef
  background: ContentRef
  class: ContentRef
  subclass?: ContentRef | null
  archetypes?: ContentRef[]
  size: Size
  traits: string[]
  languages: ContentRef[]
  deity?: ContentRef | null
  homeRegion?: string
  alignment?: string | null
  edicts?: string
  anathema?: string
}

export interface AttributeBoostSource {
  kind:
    | 'ancestry'
    | 'background'
    | 'class'
    | 'free'
    | 'level'
    | 'apex'
    | 'partial'
    | 'flaw'
    | 'other'
  attribute: AttributeKey
  amount: number
  levelGained?: number | null
  label?: string
  effects?: Effect[]
}

export interface AttributeBlock {
  boosts: AttributeBoostSource[]
  legacyScore?: number | null
  modifierOverride?: number | null
}

export type Attributes = Record<AttributeKey, AttributeBlock>

export interface RankedProficiency {
  rank: ProficiencyRank
  attribute?: AttributeKey
  modifiers?: ModifierBreakdown
  notes?: string
  effects?: Effect[]
}

export interface Proficiencies {
  perception: RankedProficiency
  fortitude: RankedProficiency
  reflex: RankedProficiency
  will: RankedProficiency
  classDC: RankedProficiency
  armor: {
    unarmored: ProficiencyRank
    light: ProficiencyRank
    medium: ProficiencyRank
    heavy: ProficiencyRank
  }
  weapons: {
    unarmed: ProficiencyRank
    simple: ProficiencyRank
    martial: ProficiencyRank
    advanced: ProficiencyRank
    specific?: Array<{ weapon: ContentRef; rank: ProficiencyRank }>
  }
}

export interface SkillEntry {
  key: string
  name: string
  attribute: AttributeKey
  rank: ProficiencyRank
  isLore?: boolean
  armorPenaltyApplies?: boolean
  modifiers?: ModifierBreakdown
  notes?: string
  effects?: Effect[]
}

export interface Vitals {
  ancestryHp: number
  classHpPerLevel: number
  bonuses: Array<{
    label: string
    amount: number
    perLevel?: boolean
    effects?: Effect[]
  }>
  currentHp: number
  temporaryHp: number
  dying: number
  wounded: number
  doomed: number
  resistances: Array<{ type: string; value: number; notes?: string }>
  immunities: string[]
  weaknesses: Array<{ type: string; value: number; notes?: string }>
  speeds: Array<{ kind: string; feet: number; notes?: string }>
  senses: Array<{ name: string; rangeFeet?: number | null; notes?: string }>
}

export interface ArmorClassInputs {
  equippedArmorItemId: string | null
  equippedShieldItemId: string | null
  shieldRaised: boolean
  dexCapOverride?: number | null
  modifiers?: ModifierBreakdown
  notes?: string
}

export interface FeatEntry {
  id: string
  category:
    | 'ancestry'
    | 'heritage'
    | 'background'
    | 'class'
    | 'skill'
    | 'general'
    | 'archetype'
    | 'bonus'
    | 'other'
  feat: ContentRef
  levelGained: number
  traits?: string[]
  summary?: string
  effects?: Effect[]
}

export interface FeatureEntry {
  id: string
  feature: ContentRef
  levelGained: number
  summary?: string
  effects?: Effect[]
}

export interface ActionEntry {
  id: string
  name: string
  actionType: 'action' | 'reaction' | 'free' | 'exploration' | 'downtime'
  actionCost?: number | null
  traits?: string[]
  frequency?: string
  summary?: string
  sourceFeatId?: string | null
  effects?: Effect[]
}

export interface StrikeEntry {
  id: string
  name: string
  strikeType: 'melee' | 'ranged' | 'unarmed'
  weaponCategory?: 'unarmed' | 'simple' | 'martial' | 'advanced' | 'other'
  itemId?: string | null
  attackAttribute?: AttributeKey
  damageAttribute?: AttributeKey
  damageDice: string
  damageType: string
  traits: string[]
  rangeFeet: number | null
  reload?: string | null
  ammoItemId?: string | null
  modifiers?: ModifierBreakdown
  notes?: string
  effects?: Effect[]
}

export interface SpellSlotRank {
  rank: number
  max: number
  remaining: number
}

export interface SpellListEntry {
  id: string
  spell: ContentRef
  rank: number
  tradition?: 'arcane' | 'divine' | 'occult' | 'primal' | 'none' | 'other'
  prepared?: boolean
  signature?: boolean
  usesPerDay?: number | null
  usesRemaining?: number | null
  traits?: string[]
  summary?: string
  effects?: Effect[]
}

export interface SpellcastingEntry {
  id: string
  name: string
  tradition: 'arcane' | 'divine' | 'occult' | 'primal' | 'none' | 'other'
  castType: 'prepared' | 'spontaneous' | 'innate' | 'focus' | 'other'
  attribute?: AttributeKey
  proficiency: RankedProficiency
  slots: SpellSlotRank[]
  cantrips: SpellListEntry[]
  spells: SpellListEntry[]
  focusSpells: SpellListEntry[]
  innateSpells: SpellListEntry[]
  rituals: SpellListEntry[]
  effects?: Effect[]
}

export interface Inventory {
  currency: Currency
  items: ItemEntry[]
  notes?: string
}

export interface ArmorItemStats {
  category: 'unarmored' | 'light' | 'medium' | 'heavy'
  acBonus: number
  dexCap: number | null
  checkPenalty: number
  speedPenalty: number
  strength: number | null
  potencyRune?: number
  resilientRune?: 'none' | 'resilient' | 'greaterResilient' | 'majorResilient'
  propertyRunes?: string[]
}

export interface WeaponItemStats {
  category: 'unarmed' | 'simple' | 'martial' | 'advanced' | 'other'
  group: string
  damageDice: string
  damageType: string
  hands?: string
  rangeFeet?: number | null
  reload?: string | null
  potencyRune?: number
  strikingRune?: 'none' | 'striking' | 'greaterStriking' | 'majorStriking'
  propertyRunes?: string[]
}

export interface ShieldItemStats {
  acBonus: number
  speedPenalty?: number
  hardness: number
  maxHp: number
  brokenThreshold: number
  hp: number
}

export interface ItemEntry {
  id: string
  item: ContentRef
  quantity: number
  /** Decimal bulk: 1 = 1 Bulk, 0.1 = 1L */
  bulk: number
  priceGp?: number | null
  location: 'worn' | 'readied' | 'stowed' | 'other'
  invested: boolean
  equipped: boolean
  containerId: string | null
  armor?: ArmorItemStats
  weapon?: WeaponItemStats
  shield?: ShieldItemStats
  charges?: { max: number; remaining: number } | null
  formula?: boolean
  traits?: string[]
  notes?: string
  effects?: Effect[]
}

export interface Inventory {
  currency: Currency
  items: ItemEntry[]
  bulkBonus?: number
  notes?: string
}

export interface ConditionEntry {
  id: string
  condition: ContentRef
  value?: number | null
  duration?: string | null
  notes?: string
  effects?: Effect[]
}

export interface CompanionSheet {
  identity: {
    level: number
    size: Size
    traits: string[]
    ancestryOrType?: ContentRef
  }
  attributes: Attributes
  proficiencies?: Proficiencies
  vitals: Vitals
  armorClass: ArmorClassInputs
  skills: SkillEntry[]
  strikes: StrikeEntry[]
  actions: ActionEntry[]
  spellcasting?: SpellcastingEntry[]
  inventory: Inventory
  conditions: ConditionEntry[]
  notes: string
  effects?: Effect[]
  extensions?: Record<string, unknown>
}

export interface CompanionEntry {
  id: string
  kind: 'animalCompanion' | 'familiar' | 'eidolon' | 'construct' | 'other'
  name: string
  linkedFeatureId?: string | null
  sheet: CompanionSheet
}

export interface PlayState {
  heroPoints: number
  focusPool: number
  focusRemaining: number
  initiativeModifier?: number | null
  dailyResources: Array<{
    id: string
    name: string
    max: number
    remaining: number
    resetsOn?: 'daily' | 'encounter' | 'refocus' | 'other'
  }>
}

export interface DerivedCache {
  attributeModifiers?: Partial<Record<AttributeKey, number>>
  maxHp?: number
  ac?: number
  perception?: number
  fortitude?: number
  reflex?: number
  will?: number
  classDC?: number
  skillTotals?: Record<string, number>
  bulkUsed?: number
  bulkCapacity?: number
  investedCount?: number
  maxDying?: number
  computedAt?: string
  [key: string]: unknown
}

export interface CharacterDocument {
  schemaVersion: 1
  /** Present on Save after Phase M. Missing on Load means pf2e. */
  system?: 'pf2e'
  meta: Meta
  identity: Identity
  attributes: Attributes
  proficiencies: Proficiencies
  vitals: Vitals
  armorClass: ArmorClassInputs
  skills: SkillEntry[]
  feats: FeatEntry[]
  features: FeatureEntry[]
  actions: ActionEntry[]
  strikes: StrikeEntry[]
  spellcasting: SpellcastingEntry[]
  inventory: Inventory
  companions: CompanionEntry[]
  conditions: ConditionEntry[]
  play: PlayState
  notes: Notes
  overrides: Record<string, OverrideValue>
  extensions: Record<string, unknown>
  /** Optional cache — must be omitted from Save sheet exports. */
  derived?: DerivedCache
}

import {
  APP_DISPLAY_NAME,
  APP_VERSION,
  SAVE_FILE_EXTENSION,
} from '../../../shared/constants'

export { APP_DISPLAY_NAME, APP_VERSION, SAVE_FILE_EXTENSION }
