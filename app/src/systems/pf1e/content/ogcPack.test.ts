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

const BATCH_F3C = [
  { id: 'feat.lightning-reflexes', kind: 'feat', name: 'Lightning Reflexes' },
  { id: 'feat.magical-aptitude', kind: 'feat', name: 'Magical Aptitude' },
  { id: 'feat.master-craftsman', kind: 'feat', name: 'Master Craftsman' },
  { id: 'feat.natural-spell', kind: 'feat', name: 'Natural Spell' },
  { id: 'feat.nimble-moves', kind: 'feat', name: 'Nimble Moves' },
  { id: 'feat.persuasive', kind: 'feat', name: 'Persuasive' },
  { id: 'feat.run', kind: 'feat', name: 'Run' },
  { id: 'feat.selective-channeling', kind: 'feat', name: 'Selective Channeling' },
  { id: 'feat.self-sufficient', kind: 'feat', name: 'Self-Sufficient' },
  { id: 'feat.skill-focus', kind: 'feat', name: 'Skill Focus' },
  { id: 'feat.spell-mastery', kind: 'feat', name: 'Spell Mastery' },
  { id: 'feat.spell-penetration', kind: 'feat', name: 'Spell Penetration' },
  { id: 'feat.stealthy', kind: 'feat', name: 'Stealthy' },
  { id: 'feat.toughness', kind: 'feat', name: 'Toughness' },
  { id: 'feat.turn-undead', kind: 'feat', name: 'Turn Undead' },
] as const

const BATCH_F4 = [
  { id: 'feat.brew-potion', kind: 'feat', name: 'Brew Potion' },
  { id: 'feat.craft-rod', kind: 'feat', name: 'Craft Rod' },
  { id: 'feat.craft-staff', kind: 'feat', name: 'Craft Staff' },
  { id: 'feat.craft-wand', kind: 'feat', name: 'Craft Wand' },
  { id: 'feat.forge-ring', kind: 'feat', name: 'Forge Ring' },
  { id: 'feat.empower-spell', kind: 'feat', name: 'Empower Spell' },
  { id: 'feat.enlarge-spell', kind: 'feat', name: 'Enlarge Spell' },
  { id: 'feat.extend-spell', kind: 'feat', name: 'Extend Spell' },
  { id: 'feat.maximize-spell', kind: 'feat', name: 'Maximize Spell' },
  { id: 'feat.quicken-spell', kind: 'feat', name: 'Quicken Spell' },
  { id: 'feat.silent-spell', kind: 'feat', name: 'Silent Spell' },
  { id: 'feat.still-spell', kind: 'feat', name: 'Still Spell' },
  { id: 'feat.widen-spell', kind: 'feat', name: 'Widen Spell' },
] as const

const BATCH_F0 = [
  { id: 'feat.improved-initiative', kind: 'feat', name: 'Improved Initiative' },
  { id: 'feat.scribe-scroll', kind: 'feat', name: 'Scribe Scroll' },
  { id: 'feat.spell-focus', kind: 'feat', name: 'Spell Focus' },
  { id: 'feat.weapon-focus', kind: 'feat', name: 'Weapon Focus' },
  { id: 'feat.eschew-materials', kind: 'feat', name: 'Eschew Materials' },
  { id: 'feat.heighten-spell', kind: 'feat', name: 'Heighten Spell' },
  { id: 'feat.craft-wondrous-item', kind: 'feat', name: 'Craft Wondrous Item' },
  { id: 'feat.craft-magic-arms-and-armor', kind: 'feat', name: 'Craft Magic Arms and Armor' },
  { id: 'feat.craft-construct', kind: 'feat', name: 'Craft Construct' },
  { id: 'feat.point-blank-shot', kind: 'feat', name: 'Point-Blank Shot' },
] as const

const BATCH_L0 = [
  { id: 'spell.acid-splash', kind: 'spell', name: "Acid Splash" },
  { id: 'spell.arcane-mark', kind: 'spell', name: "Arcane Mark" },
  { id: 'spell.bleed', kind: 'spell', name: "Bleed" },
  { id: 'spell.create-water', kind: 'spell', name: "Create Water" },
  { id: 'spell.dancing-lights', kind: 'spell', name: "Dancing Lights" },
  { id: 'spell.daze', kind: 'spell', name: "Daze" },
  { id: 'spell.detect-magic', kind: 'spell', name: "Detect Magic" },
  { id: 'spell.detect-poison', kind: 'spell', name: "Detect Poison" },
  { id: 'spell.disrupt-undead', kind: 'spell', name: "Disrupt Undead" },
  { id: 'spell.flare', kind: 'spell', name: "Flare" },
  { id: 'spell.ghost-sound', kind: 'spell', name: "Ghost Sound" },
  { id: 'spell.guidance', kind: 'spell', name: "Guidance" },
  { id: 'spell.know-direction', kind: 'spell', name: "Know Direction" },
  { id: 'spell.light', kind: 'spell', name: "Light" },
  { id: 'spell.lullaby', kind: 'spell', name: "Lullaby" },
  { id: 'spell.mage-hand', kind: 'spell', name: "Mage Hand" },
  { id: 'spell.mending', kind: 'spell', name: "Mending" },
  { id: 'spell.message', kind: 'spell', name: "Message" },
  { id: 'spell.open-close', kind: 'spell', name: "Open/Close" },
  { id: 'spell.prestidigitation', kind: 'spell', name: "Prestidigitation" },
  { id: 'spell.purify-food-and-drink', kind: 'spell', name: "Purify Food and Drink" },
  { id: 'spell.ray-of-frost', kind: 'spell', name: "Ray of Frost" },
  { id: 'spell.read-magic', kind: 'spell', name: "Read Magic" },
  { id: 'spell.resistance', kind: 'spell', name: "Resistance" },
  { id: 'spell.stabilize', kind: 'spell', name: "Stabilize" },
  { id: 'spell.summon-instrument', kind: 'spell', name: "Summon Instrument" },
  { id: 'spell.touch-of-fatigue', kind: 'spell', name: "Touch of Fatigue" },
  { id: 'spell.virtue', kind: 'spell', name: "Virtue" },
] as const

const BATCH_L1A = [
  { id: 'spell.alarm', kind: 'spell', name: "Alarm" },
  { id: 'spell.animal-messenger', kind: 'spell', name: "Animal Messenger" },
  { id: 'spell.animate-rope', kind: 'spell', name: "Animate Rope" },
  { id: 'spell.bane', kind: 'spell', name: "Bane" },
  { id: 'spell.bless', kind: 'spell', name: "Bless" },
  { id: 'spell.bless-water', kind: 'spell', name: "Bless Water" },
  { id: 'spell.bless-weapon', kind: 'spell', name: "Bless Weapon" },
  { id: 'spell.burning-hands', kind: 'spell', name: "Burning Hands" },
  { id: 'spell.calm-animals', kind: 'spell', name: "Calm Animals" },
  { id: 'spell.cause-fear', kind: 'spell', name: "Cause Fear" },
  { id: 'spell.charm-animal', kind: 'spell', name: "Charm Animal" },
  { id: 'spell.charm-person', kind: 'spell', name: "Charm Person" },
  { id: 'spell.chill-touch', kind: 'spell', name: "Chill Touch" },
  { id: 'spell.color-spray', kind: 'spell', name: "Color Spray" },
  { id: 'spell.command', kind: 'spell', name: "Command" },
  { id: 'spell.comprehend-languages', kind: 'spell', name: "Comprehend Languages" },
  { id: 'spell.cure-light-wounds', kind: 'spell', name: "Cure Light Wounds" },
  { id: 'spell.curse-water', kind: 'spell', name: "Curse Water" },
  { id: 'spell.deathwatch', kind: 'spell', name: "Deathwatch" },
  { id: 'spell.delay-poison', kind: 'spell', name: "Delay Poison" },
] as const

const BATCH_L1B = [
  { id: 'spell.detect-animals-or-plants', kind: 'spell', name: "Detect Animals or Plants" },
  { id: 'spell.detect-chaos', kind: 'spell', name: "Detect Chaos" },
  { id: 'spell.detect-evil', kind: 'spell', name: "Detect Evil" },
  { id: 'spell.detect-good', kind: 'spell', name: "Detect Good" },
  { id: 'spell.detect-law', kind: 'spell', name: "Detect Law" },
  { id: 'spell.detect-secret-doors', kind: 'spell', name: "Detect Secret Doors" },
  { id: 'spell.detect-snares-and-pits', kind: 'spell', name: "Detect Snares and Pits" },
  { id: 'spell.detect-undead', kind: 'spell', name: "Detect Undead" },
  { id: 'spell.disguise-self', kind: 'spell', name: "Disguise Self" },
  { id: 'spell.divine-favor', kind: 'spell', name: "Divine Favor" },
  { id: 'spell.doom', kind: 'spell', name: "Doom" },
  { id: 'spell.endure-elements', kind: 'spell', name: "Endure Elements" },
  { id: 'spell.enlarge-person', kind: 'spell', name: "Enlarge Person" },
  { id: 'spell.entangle', kind: 'spell', name: "Entangle" },
  { id: 'spell.entropic-shield', kind: 'spell', name: "Entropic Shield" },
  { id: 'spell.erase', kind: 'spell', name: "Erase" },
  { id: 'spell.expeditious-retreat', kind: 'spell', name: "Expeditious Retreat" },
  { id: 'spell.faerie-fire', kind: 'spell', name: "Faerie Fire" },
  { id: 'spell.feather-fall', kind: 'spell', name: "Feather Fall" },
  { id: 'spell.floating-disk', kind: 'spell', name: "Floating Disk" },
] as const

const BATCH_L1C = [
  { id: 'spell.goodberry', kind: 'spell', name: "Goodberry" },
  { id: 'spell.grease', kind: 'spell', name: "Grease" },
  { id: 'spell.hide-from-animals', kind: 'spell', name: "Hide from Animals" },
  { id: 'spell.hide-from-undead', kind: 'spell', name: "Hide from Undead" },
  { id: 'spell.hold-portal', kind: 'spell', name: "Hold Portal" },
  { id: 'spell.hypnotism', kind: 'spell', name: "Hypnotism" },
  { id: 'spell.identify', kind: 'spell', name: "Identify" },
  { id: 'spell.inflict-light-wounds', kind: 'spell', name: "Inflict Light Wounds" },
  { id: 'spell.jump', kind: 'spell', name: "Jump" },
  { id: 'spell.lesser-confusion', kind: 'spell', name: "Lesser Confusion" },
  { id: 'spell.lesser-restoration', kind: 'spell', name: "Lesser Restoration" },
  { id: 'spell.longstrider', kind: 'spell', name: "Longstrider" },
  { id: 'spell.mage-armor', kind: 'spell', name: "Mage Armor" },
  { id: 'spell.magic-aura', kind: 'spell', name: "Magic Aura" },
  { id: 'spell.magic-fang', kind: 'spell', name: "Magic Fang" },
  { id: 'spell.magic-missile', kind: 'spell', name: "Magic Missile" },
  { id: 'spell.magic-stone', kind: 'spell', name: "Magic Stone" },
  { id: 'spell.magic-weapon', kind: 'spell', name: "Magic Weapon" },
  { id: 'spell.mount', kind: 'spell', name: "Mount" },
  { id: 'spell.obscuring-mist', kind: 'spell', name: "Obscuring Mist" },
] as const

const BATCH_L1D = [
  { id: 'spell.pass-without-trace', kind: 'spell', name: "Pass without Trace" },
  { id: 'spell.produce-flame', kind: 'spell', name: "Produce Flame" },
  { id: 'spell.protection-from-chaos', kind: 'spell', name: "Protection from Chaos" },
  { id: 'spell.protection-from-evil', kind: 'spell', name: "Protection from Evil" },
  { id: 'spell.protection-from-good', kind: 'spell', name: "Protection from Good" },
  { id: 'spell.protection-from-law', kind: 'spell', name: "Protection from Law" },
  { id: 'spell.ray-of-enfeeblement', kind: 'spell', name: "Ray of Enfeeblement" },
  { id: 'spell.reduce-person', kind: 'spell', name: "Reduce Person" },
  { id: 'spell.remove-fear', kind: 'spell', name: "Remove Fear" },
  { id: 'spell.sanctuary', kind: 'spell', name: "Sanctuary" },
  { id: 'spell.shield', kind: 'spell', name: "Shield" },
  { id: 'spell.shield-of-faith', kind: 'spell', name: "Shield of Faith" },
  { id: 'spell.shillelagh', kind: 'spell', name: "Shillelagh" },
  { id: 'spell.shocking-grasp', kind: 'spell', name: "Shocking Grasp" },
  { id: 'spell.silent-image', kind: 'spell', name: "Silent Image" },
  { id: 'spell.sleep', kind: 'spell', name: "Sleep" },
  { id: 'spell.speak-with-animals', kind: 'spell', name: "Speak with Animals" },
  { id: 'spell.summon-monster-i', kind: 'spell', name: "Summon Monster I" },
  { id: 'spell.summon-natures-ally-i', kind: 'spell', name: "Summon Nature's Ally I" },
  { id: 'spell.true-strike', kind: 'spell', name: "True Strike" },
] as const

const BATCH_L1E = [
  { id: 'spell.undetectable-alignment', kind: 'spell', name: "Undetectable Alignment" },
  { id: 'spell.unseen-servant', kind: 'spell', name: "Unseen Servant" },
  { id: 'spell.ventriloquism', kind: 'spell', name: "Ventriloquism" },
] as const

const BATCH_L2A = [
  { id: 'spell.acid-arrow', kind: 'spell', name: "Acid Arrow" },
  { id: 'spell.aid', kind: 'spell', name: "Aid" },
  { id: 'spell.align-weapon', kind: 'spell', name: "Align Weapon" },
  { id: 'spell.alter-self', kind: 'spell', name: "Alter Self" },
  { id: 'spell.animal-trance', kind: 'spell', name: "Animal Trance" },
  { id: 'spell.arcane-lock', kind: 'spell', name: "Arcane Lock" },
  { id: 'spell.augury', kind: 'spell', name: "Augury" },
  { id: 'spell.barkskin', kind: 'spell', name: "Barkskin" },
  { id: 'spell.bears-endurance', kind: 'spell', name: "Bear's Endurance" },
  { id: 'spell.blindness-deafness', kind: 'spell', name: "Blindness/Deafness" },
  { id: 'spell.blur', kind: 'spell', name: "Blur" },
  { id: 'spell.bulls-strength', kind: 'spell', name: "Bull's Strength" },
  { id: 'spell.calm-emotions', kind: 'spell', name: "Calm Emotions" },
  { id: 'spell.cats-grace', kind: 'spell', name: "Cat's Grace" },
  { id: 'spell.chill-metal', kind: 'spell', name: "Chill Metal" },
  { id: 'spell.command-undead', kind: 'spell', name: "Command Undead" },
  { id: 'spell.consecrate', kind: 'spell', name: "Consecrate" },
  { id: 'spell.continual-flame', kind: 'spell', name: "Continual Flame" },
  { id: 'spell.cure-moderate-wounds', kind: 'spell', name: "Cure Moderate Wounds" },
  { id: 'spell.darkness', kind: 'spell', name: "Darkness" },
] as const

const BATCH_L2B = [
  { id: 'spell.darkvision', kind: 'spell', name: "Darkvision" },
  { id: 'spell.daze-monster', kind: 'spell', name: "Daze Monster" },
  { id: 'spell.death-knell', kind: 'spell', name: "Death Knell" },
  { id: 'spell.desecrate', kind: 'spell', name: "Desecrate" },
  { id: 'spell.detect-thoughts', kind: 'spell', name: "Detect Thoughts" },
  { id: 'spell.eagles-splendor', kind: 'spell', name: "Eagle's Splendor" },
  { id: 'spell.enthrall', kind: 'spell', name: "Enthrall" },
  { id: 'spell.false-life', kind: 'spell', name: "False Life" },
  { id: 'spell.find-traps', kind: 'spell', name: "Find Traps" },
  { id: 'spell.flame-blade', kind: 'spell', name: "Flame Blade" },
  { id: 'spell.flaming-sphere', kind: 'spell', name: "Flaming Sphere" },
  { id: 'spell.fog-cloud', kind: 'spell', name: "Fog Cloud" },
  { id: 'spell.foxs-cunning', kind: 'spell', name: "Fox's Cunning" },
  { id: 'spell.ghoul-touch', kind: 'spell', name: "Ghoul Touch" },
  { id: 'spell.glitterdust', kind: 'spell', name: "Glitterdust" },
  { id: 'spell.gust-of-wind', kind: 'spell', name: "Gust of Wind" },
  { id: 'spell.heat-metal', kind: 'spell', name: "Heat Metal" },
  { id: 'spell.hideous-laughter', kind: 'spell', name: "Hideous Laughter" },
  { id: 'spell.hold-animal', kind: 'spell', name: "Hold Animal" },
  { id: 'spell.hypnotic-pattern', kind: 'spell', name: "Hypnotic Pattern" },
] as const

const BATCH_L2C = [
  { id: 'spell.inflict-moderate-wounds', kind: 'spell', name: "Inflict Moderate Wounds" },
  { id: 'spell.invisibility', kind: 'spell', name: "Invisibility" },
  { id: 'spell.knock', kind: 'spell', name: "Knock" },
  { id: 'spell.levitate', kind: 'spell', name: "Levitate" },
  { id: 'spell.locate-object', kind: 'spell', name: "Locate Object" },
  { id: 'spell.magic-mouth', kind: 'spell', name: "Magic Mouth" },
  { id: 'spell.make-whole', kind: 'spell', name: "Make Whole" },
  { id: 'spell.minor-image', kind: 'spell', name: "Minor Image" },
  { id: 'spell.mirror-image', kind: 'spell', name: "Mirror Image" },
  { id: 'spell.misdirection', kind: 'spell', name: "Misdirection" },
  { id: 'spell.obscure-object', kind: 'spell', name: "Obscure Object" },
  { id: 'spell.owls-wisdom', kind: 'spell', name: "Owl's Wisdom" },
  { id: 'spell.phantom-trap', kind: 'spell', name: "Phantom Trap" },
  { id: 'spell.protection-from-arrows', kind: 'spell', name: "Protection from Arrows" },
  { id: 'spell.pyrotechnics', kind: 'spell', name: "Pyrotechnics" },
  { id: 'spell.reduce-animal', kind: 'spell', name: "Reduce Animal" },
  { id: 'spell.remove-paralysis', kind: 'spell', name: "Remove Paralysis" },
  { id: 'spell.resist-energy', kind: 'spell', name: "Resist Energy" },
  { id: 'spell.rope-trick', kind: 'spell', name: "Rope Trick" },
  { id: 'spell.scare', kind: 'spell', name: "Scare" },
] as const

const BATCH_L2D = [
  { id: 'spell.scorching-ray', kind: 'spell', name: "Scorching Ray" },
  { id: 'spell.see-invisibility', kind: 'spell', name: "See Invisibility" },
  { id: 'spell.shatter', kind: 'spell', name: "Shatter" },
  { id: 'spell.shield-other', kind: 'spell', name: "Shield Other" },
  { id: 'spell.silence', kind: 'spell', name: "Silence" },
  { id: 'spell.snare', kind: 'spell', name: "Snare" },
  { id: 'spell.soften-earth-and-stone', kind: 'spell', name: "Soften Earth and Stone" },
  { id: 'spell.sound-burst', kind: 'spell', name: "Sound Burst" },
  { id: 'spell.speak-with-plants', kind: 'spell', name: "Speak with Plants" },
  { id: 'spell.spectral-hand', kind: 'spell', name: "Spectral Hand" },
  { id: 'spell.spider-climb', kind: 'spell', name: "Spider Climb" },
  { id: 'spell.spike-growth', kind: 'spell', name: "Spike Growth" },
  { id: 'spell.spiritual-weapon', kind: 'spell', name: "Spiritual Weapon" },
  { id: 'spell.status', kind: 'spell', name: "Status" },
  { id: 'spell.summon-monster-ii', kind: 'spell', name: "Summon Monster II" },
  { id: 'spell.summon-natures-ally-ii', kind: 'spell', name: "Summon Nature's Ally II" },
  { id: 'spell.summon-swarm', kind: 'spell', name: "Summon Swarm" },
  { id: 'spell.touch-of-idiocy', kind: 'spell', name: "Touch of Idiocy" },
  { id: 'spell.tree-shape', kind: 'spell', name: "Tree Shape" },
  { id: 'spell.warp-wood', kind: 'spell', name: "Warp Wood" },
] as const

const BATCH_L2E = [
  { id: 'spell.web', kind: 'spell', name: "Web" },
  { id: 'spell.whispering-wind', kind: 'spell', name: "Whispering Wind" },
  { id: 'spell.wood-shape', kind: 'spell', name: "Wood Shape" },
  { id: 'spell.zone-of-truth', kind: 'spell', name: "Zone of Truth" },
] as const

const BATCH_L3A = [
  { id: 'spell.arcane-sight', kind: 'spell', name: "Arcane Sight" },
  { id: 'spell.beast-shape-i', kind: 'spell', name: "Beast Shape I" },
  { id: 'spell.blink', kind: 'spell', name: "Blink" },
  { id: 'spell.call-lightning', kind: 'spell', name: "Call Lightning" },
  { id: 'spell.clairaudience-clairvoyance', kind: 'spell', name: "Clairaudience/Clairvoyance" },
  { id: 'spell.command-plants', kind: 'spell', name: "Command Plants" },
  { id: 'spell.create-food-and-water', kind: 'spell', name: "Create Food and Water" },
  { id: 'spell.cure-serious-wounds', kind: 'spell', name: "Cure Serious Wounds" },
  { id: 'spell.daylight', kind: 'spell', name: "Daylight" },
  { id: 'spell.deep-slumber', kind: 'spell', name: "Deep Slumber" },
  { id: 'spell.deeper-darkness', kind: 'spell', name: "Deeper Darkness" },
  { id: 'spell.diminish-plants', kind: 'spell', name: "Diminish Plants" },
  { id: 'spell.discern-lies', kind: 'spell', name: "Discern Lies" },
  { id: 'spell.dispel-magic', kind: 'spell', name: "Dispel Magic" },
  { id: 'spell.displacement', kind: 'spell', name: "Displacement" },
  { id: 'spell.dominate-animal', kind: 'spell', name: "Dominate Animal" },
  { id: 'spell.explosive-runes', kind: 'spell', name: "Explosive Runes" },
  { id: 'spell.flame-arrow', kind: 'spell', name: "Flame Arrow" },
  { id: 'spell.fly', kind: 'spell', name: "Fly" },
  { id: 'spell.gaseous-form', kind: 'spell', name: "Gaseous Form" },
] as const

const BATCH_L3B = [
  { id: 'spell.gentle-repose', kind: 'spell', name: "Gentle Repose" },
  { id: 'spell.glibness', kind: 'spell', name: "Glibness" },
  { id: 'spell.glyph-of-warding', kind: 'spell', name: "Glyph of Warding" },
  { id: 'spell.good-hope', kind: 'spell', name: "Good Hope" },
  { id: 'spell.greater-magic-fang', kind: 'spell', name: "Greater Magic Fang" },
  { id: 'spell.greater-magic-weapon', kind: 'spell', name: "Greater Magic Weapon" },
  { id: 'spell.halt-undead', kind: 'spell', name: "Halt Undead" },
  { id: 'spell.haste', kind: 'spell', name: "Haste" },
  { id: 'spell.heal-mount', kind: 'spell', name: "Heal Mount" },
  { id: 'spell.helping-hand', kind: 'spell', name: "Helping Hand" },
  { id: 'spell.heroism', kind: 'spell', name: "Heroism" },
  { id: 'spell.hold-person', kind: 'spell', name: "Hold Person" },
  { id: 'spell.illusory-script', kind: 'spell', name: "Illusory Script" },
  { id: 'spell.inflict-serious-wounds', kind: 'spell', name: "Inflict Serious Wounds" },
  { id: 'spell.invisibility-purge', kind: 'spell', name: "Invisibility Purge" },
  { id: 'spell.invisibility-sphere', kind: 'spell', name: "Invisibility Sphere" },
  { id: 'spell.keen-edge', kind: 'spell', name: "Keen Edge" },
  { id: 'spell.lightning-bolt', kind: 'spell', name: "Lightning Bolt" },
  { id: 'spell.magic-circle-against-chaos', kind: 'spell', name: "Magic Circle against Chaos" },
  { id: 'spell.magic-circle-against-evil', kind: 'spell', name: "Magic Circle against Evil" },
] as const

const BATCH_L3C = [
  { id: 'spell.magic-circle-against-good', kind: 'spell', name: "Magic Circle against Good" },
  { id: 'spell.magic-circle-against-law', kind: 'spell', name: "Magic Circle against Law" },
  { id: 'spell.magic-vestment', kind: 'spell', name: "Magic Vestment" },
  { id: 'spell.major-image', kind: 'spell', name: "Major Image" },
  { id: 'spell.meld-into-stone', kind: 'spell', name: "Meld into Stone" },
  { id: 'spell.neutralize-poison', kind: 'spell', name: "Neutralize Poison" },
  { id: 'spell.nondetection', kind: 'spell', name: "Nondetection" },
  { id: 'spell.phantom-steed', kind: 'spell', name: "Phantom Steed" },
  { id: 'spell.plant-growth', kind: 'spell', name: "Plant Growth" },
  { id: 'spell.poison', kind: 'spell', name: "Poison" },
  { id: 'spell.prayer', kind: 'spell', name: "Prayer" },
  { id: 'spell.protection-from-energy', kind: 'spell', name: "Protection from Energy" },
  { id: 'spell.quench', kind: 'spell', name: "Quench" },
  { id: 'spell.ray-of-exhaustion', kind: 'spell', name: "Ray of Exhaustion" },
  { id: 'spell.remove-blindness-deafness', kind: 'spell', name: "Remove Blindness/Deafness" },
  { id: 'spell.remove-disease', kind: 'spell', name: "Remove Disease" },
  { id: 'spell.repel-vermin', kind: 'spell', name: "Repel Vermin" },
  { id: 'spell.sculpt-sound', kind: 'spell', name: "Sculpt Sound" },
  { id: 'spell.searing-light', kind: 'spell', name: "Searing Light" },
  { id: 'spell.secret-page', kind: 'spell', name: "Secret Page" },
] as const

const BATCH_L3D = [
  { id: 'spell.sepia-snake-sigil', kind: 'spell', name: "Sepia Snake Sigil" },
  { id: 'spell.shrink-item', kind: 'spell', name: "Shrink Item" },
  { id: 'spell.sleet-storm', kind: 'spell', name: "Sleet Storm" },
  { id: 'spell.slow', kind: 'spell', name: "Slow" },
  { id: 'spell.speak-with-dead', kind: 'spell', name: "Speak with Dead" },
  { id: 'spell.stinking-cloud', kind: 'spell', name: "Stinking Cloud" },
  { id: 'spell.suggestion', kind: 'spell', name: "Suggestion" },
  { id: 'spell.summon-monster-iii', kind: 'spell', name: "Summon Monster III" },
  { id: 'spell.summon-natures-ally-iii', kind: 'spell', name: "Summon Nature's Ally III" },
  { id: 'spell.tiny-hut', kind: 'spell', name: "Tiny Hut" },
  { id: 'spell.tongues', kind: 'spell', name: "Tongues" },
  { id: 'spell.vampiric-touch', kind: 'spell', name: "Vampiric Touch" },
  { id: 'spell.water-breathing', kind: 'spell', name: "Water Breathing" },
  { id: 'spell.water-walk', kind: 'spell', name: "Water Walk" },
  { id: 'spell.wind-wall', kind: 'spell', name: "Wind Wall" },
] as const

const BATCH_L4A = [
  { id: 'spell.air-walk', kind: 'spell', name: "Air Walk" },
  { id: 'spell.animate-dead', kind: 'spell', name: "Animate Dead" },
  { id: 'spell.antiplant-shell', kind: 'spell', name: "Antiplant Shell" },
  { id: 'spell.arcane-eye', kind: 'spell', name: "Arcane Eye" },
  { id: 'spell.beast-shape-ii', kind: 'spell', name: "Beast Shape II" },
  { id: 'spell.bestow-curse', kind: 'spell', name: "Bestow Curse" },
  { id: 'spell.black-tentacles', kind: 'spell', name: "Black Tentacles" },
  { id: 'spell.chaos-hammer', kind: 'spell', name: "Chaos Hammer" },
  { id: 'spell.charm-monster', kind: 'spell', name: "Charm Monster" },
  { id: 'spell.commune-with-nature', kind: 'spell', name: "Commune with Nature" },
  { id: 'spell.confusion', kind: 'spell', name: "Confusion" },
  { id: 'spell.contagion', kind: 'spell', name: "Contagion" },
  { id: 'spell.crushing-despair', kind: 'spell', name: "Crushing Despair" },
  { id: 'spell.cure-critical-wounds', kind: 'spell', name: "Cure Critical Wounds" },
  { id: 'spell.death-ward', kind: 'spell', name: "Death Ward" },
  { id: 'spell.detect-scrying', kind: 'spell', name: "Detect Scrying" },
  { id: 'spell.dimension-door', kind: 'spell', name: "Dimension Door" },
  { id: 'spell.dimensional-anchor', kind: 'spell', name: "Dimensional Anchor" },
  { id: 'spell.dispel-chaos', kind: 'spell', name: "Dispel Chaos" },
  { id: 'spell.dispel-evil', kind: 'spell', name: "Dispel Evil" },
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
  ...BATCH_F3C,
  ...BATCH_F4,
  ...BATCH_F0,
  ...BATCH_L0,
  ...BATCH_L1A,
  ...BATCH_L1B,
  ...BATCH_L1C,
  ...BATCH_L1D,
  ...BATCH_L1E,
  ...BATCH_L2A,
  ...BATCH_L2B,
  ...BATCH_L2C,
  ...BATCH_L2D,
  ...BATCH_L2E,
  ...BATCH_L3A,
  ...BATCH_L3B,
  ...BATCH_L3C,
  ...BATCH_L3D,
  ...BATCH_L4A,
]

describe('PF1e OGC encyclopedia pack', () => {
  it('ships the smoke set plus batches E-R, F1a through F4, F0, L0, and L1a, and nothing else', () => {
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

      // Every CRB feat now has a summary.
      expect(remaining('feat')).toBe(0)
      // L1b-L9 + A1
      expect(remaining('spell')).toBe(357)
      expect(remaining('feat') + remaining('spell')).toBe(357)
    })
  })
})
