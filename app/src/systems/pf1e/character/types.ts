/**
 * Character document types aligned with schemas/pf1e/character.schema.json
 * (schemaVersion 1). Do not import PF2e character types here.
 */

import type { AbilityKey } from '../../../shared/abilities'
import type { ContentRef } from '../../../shared/contentRef'
import type { Effect } from '../../../shared/effects'
import type { OverrideValue } from '../../../shared/overrides'
import type { Currency } from '../../../shared/currency'
import type { Notes } from '../../../shared/notes'

export type { AbilityKey } from '../../../shared/abilities'
export type { ContentRef, PublicationRef } from '../../../shared/contentRef'
export type { Effect } from '../../../shared/effects'
export type { OverrideValue } from '../../../shared/overrides'
export type { Currency } from '../../../shared/currency'
export type { Notes } from '../../../shared/notes'
export type Size =
  | 'fine'
  | 'diminutive'
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gargantuan'
  | 'colossal'
export type BabProgression = 'full' | 'threeQuarter' | 'half'
export type SaveQuality = 'good' | 'poor'
export type Alignment =
  | 'lawful good'
  | 'neutral good'
  | 'chaotic good'
  | 'lawful neutral'
  | 'neutral'
  | 'chaotic neutral'
  | 'lawful evil'
  | 'neutral evil'
  | 'chaotic evil'
export type ItemLocation = 'equipped' | 'carried' | 'stowed' | 'dropped'
export type LoadCategory = 'light' | 'medium' | 'heavy' | 'overloaded' | 'ignored'

export interface Meta {
  createdAt: string
  updatedAt: string
  appVersion: string
  locale: string
  characterId?: string
}

export interface Identity {
  characterName: string
  playerName?: string
  race: ContentRef
  size: Size
  alignment?: Alignment | null
  deity?: string
  xp?: number
  languages?: ContentRef[]
}

export interface FavoredClassBonus {
  hp?: number
  skillRanks?: number
}

export interface ClassSaves {
  fort: SaveQuality
  ref: SaveQuality
  will: SaveQuality
}

export interface ArcaneSchoolChoice {
  specialized: string
  opposition?: string[]
}

export interface ClassEntry {
  id: string
  class: ContentRef
  levels: number
  hitDie: number
  babProgression: BabProgression
  saves: ClassSaves
  /** Stamped from the catalog when picking Fighter/Wizard. Optional on old saves. */
  skillPointsPerLevel?: number
  /** Documentary APG archetype (Synthesist). Does not rewrite HD/BAB/saves. */
  archetype?: ContentRef
  /** Documentary Wizard arcane school and opposition schools. */
  arcaneSchool?: ArcaneSchoolChoice
  favored?: FavoredClassBonus
  prestige?: boolean
  notes?: string
  effects?: Effect[]
}

export interface AbilityBlock {
  score: number
  /** Added to score before the modifier and bonus-spell table (belts, bull's strength). */
  tempScore?: number
  /** Check/DC addend after the modifier; does not change bonus slots or carry. */
  tempModifier?: number
}

export type Abilities = Record<AbilityKey, AbilityBlock>

export interface Vitals {
  hpRolled: number[]
  currentHp: number
  tempHp: number
  nonlethal?: number
  resistances?: Array<{ type: string; value: number; notes?: string }>
  immunities?: string[]
  weaknesses?: Array<{ type: string; value: number; notes?: string }>
  speeds?: Array<{ kind: string; feet: number; notes?: string }>
  senses?: Array<{ name: string; rangeFeet?: number | null; notes?: string }>
}

export interface ArmorClassInputs {
  armorBonus: number
  shieldBonus: number
  natural: number
  deflection: number
  dodge: number
  other: number
  maxDex: number | null
  armorCheckPenalty: number
  notes?: string
}

export interface CombatInputs {
  initiativeMisc: number
  meleeAttackMisc: number
  rangedAttackMisc: number
  cmbMisc: number
  cmdMisc: number
  fortMisc: number
  refMisc: number
  willMisc: number
}

export interface SkillEntry {
  key: string
  name: string
  ability: AbilityKey
  ranks: number
  classSkill: boolean
  armorPenaltyApplies: boolean
  misc?: number
  notes?: string
  effects?: Effect[]
}

export interface FeatEntry {
  id: string
  category: 'general' | 'combat' | 'metamagic' | 'itemCreation' | 'other'
  feat: ContentRef
  levelGained: number
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

export interface AttackEntry {
  id: string
  name: string
  attackType: 'melee' | 'ranged'
  itemId?: string | null
  attackAbility?: AbilityKey
  damageAbility?: AbilityKey | null
  damageDice: string
  damageType: string
  critRange?: number
  critMultiplier?: number
  miscAttack?: number
  miscDamage?: number
  rangeFeet?: number | null
  notes?: string
  effects?: Effect[]
}

export interface SpellSlotLevel {
  spellLevel: number
  /** Custom total. null/omitted uses class table + ability bonus. */
  max?: number | null
  remaining: number
}

export interface SpellListEntry {
  id: string
  spell: ContentRef
  spellLevel: number
  prepared?: boolean
  usesPerDay?: number | null
  usesRemaining?: number | null
  summary?: string
  effects?: Effect[]
}

export interface SpellcastingEntry {
  id: string
  name: string
  ability: AbilityKey
  classRowId?: string | null
  casterLevelOverride?: number | null
  slots: SpellSlotLevel[]
  cantrips: SpellListEntry[]
  spells: SpellListEntry[]
  notes?: string
  effects?: Effect[]
}

export interface ArmorItemStats {
  acBonus?: number
  maxDex?: number | null
  armorCheckPenalty?: number
  spellFailurePercent?: number
  enhancementBonus?: number
  masterwork?: boolean
  properties?: string[]
}

export interface WeaponHeadStats {
  damageDice?: string
  damageType?: string
  critRange?: number
  critMultiplier?: number
  enhancementBonus?: number
  masterwork?: boolean
  properties?: string[]
}

/** Documentary combat fields. Optional `properties` is N kebab-case tags (one or many; omit when empty). Later magic uses the same list. Optional `secondHead` is the off-hand dice on a double weapon. */
export interface WeaponItemStats extends WeaponHeadStats {
  rangeFeet?: number | null
  secondHead?: WeaponHeadStats
}

export interface ShieldItemStats {
  acBonus?: number
  maxDex?: number | null
  armorCheckPenalty?: number
  spellFailurePercent?: number
  enhancementBonus?: number
  masterwork?: boolean
  properties?: string[]
}

export interface ItemEntry {
  id: string
  item: ContentRef
  quantity: number
  pounds: number
  location: ItemLocation
  priceGp?: number | null
  armor?: ArmorItemStats
  weapon?: WeaponItemStats
  shield?: ShieldItemStats
  notes?: string
  effects?: Effect[]
}

export interface Inventory {
  currency: Currency
  items: ItemEntry[]
  /** When true, load category is ignored. Carried pounds still sum. */
  ignoreWeight?: boolean
  notes?: string
}

export interface FusedOverlay {
  /** When true, physical ability mods, Fort, carry, and max HP use this overlay. */
  active: boolean
  str: number
  dex: number
  con: number
  /** Typed costume HP pool while fused. Not derived from HD or evolutions. */
  costumeHp: number
}

export interface EvolutionEntry {
  id: string
  evolution: ContentRef
  notes?: string
  effects?: Effect[]
}

export interface CompanionStub {
  id: string
  kind: 'animalCompanion' | 'familiar' | 'eidolon' | 'other'
  name: string
  fused?: FusedOverlay
  evolutions?: EvolutionEntry[]
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

export interface PlayState {
  dailyResources: Array<{
    id: string
    name: string
    max: number
    remaining: number
    resetsOn?: 'daily' | 'encounter' | 'other'
  }>
}

export interface DerivedCache {
  level?: number
  abilityModifiers?: Partial<Record<AbilityKey, number>>
  bab?: number
  maxHp?: number
  ac?: number
  touchAc?: number
  flatFootedAc?: number
  cmb?: number
  cmd?: number
  initiative?: number
  fortitude?: number
  reflex?: number
  will?: number
  skillTotals?: Record<string, number>
  weightUsed?: number
  computedAt?: string
  [key: string]: unknown
}

export interface CharacterDocument {
  schemaVersion: 1
  system: 'pf1e'
  meta: Meta
  identity: Identity
  classes: ClassEntry[]
  abilities: Abilities
  vitals: Vitals
  armorClass: ArmorClassInputs
  combat: CombatInputs
  skills: SkillEntry[]
  feats: FeatEntry[]
  features: FeatureEntry[]
  attacks: AttackEntry[]
  spellcasting: SpellcastingEntry[]
  inventory: Inventory
  companions: CompanionStub[]
  conditions: ConditionEntry[]
  play: PlayState
  notes: Notes
  overrides: Record<string, OverrideValue>
  extensions: Record<string, unknown>
  derived?: DerivedCache
}
