# PF1e CRB feat and spell id tables

**Status:** Locked 2026-09-03. Do not pack JSON in the same change as this lock.  
**Parent:** [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) §8  
**Machine copy:** [`pf1e-crb-feat-spell-ids.json`](pf1e-crb-feat-spell-ids.json)

Closed lists for the remaining Core Rulebook **feat table** (Chapter 5) and **class spell lists** (Chapter 10: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer/Wizard). Same job as [pack-design §7](pf1e-crb-pack-design.md#7-remaining-mundane-weapons-and-armor) did for weapons: every remaining id is named here before anyone types `feats.json` / `spells.json`.

**Counts:** 177 CRB feats (172 remaining after Batch 12). 622 unique class-list spells (618 remaining after Batch 13).

## Shared locks

| Lock | Rule |
| --- | --- |
| Scope | Core Rulebook only. No APG / Ultimate Magic / Ultimate Combat / Adventurer’s Armory rows |
| Fields | Feat: `id`, `name`, `category`, `source.book: CRB`. Spell: `id`, `name`, `spellLevel`, `source.book: CRB`. **No** `description` / `summary` / benefit / prerequisites / prose ([ADR 0007](adr/0007-content-licensing.md)) |
| Page numbers | Omit `source.page` |
| Combat / slots | Apply stamps catalog fields only. Do **not** rewrite `armorClass`, `attacks`, initiative, slots, prepared flags, or DCs |
| Specialization | Weapon Focus (longsword) / Spell Focus (evocation) stay a typed name on the sheet. One catalog row per feat, not one row per weapon or school |
| Spell level | One integer. Use the **sorcerer/wizard** list level when the spell is on that list; otherwise the **lowest** CRB class-list level. Domain-only extras wait |
| Alignment groups | `Detect Chaos/Evil/Good/Law` (and Protection / Magic Circle / Dispel) expand to four (or two, on the Paladin shorthand) separate ids |
| Slash names | `Open/Close`, `Blindness/Deafness`, `Clairaudience/Clairvoyance`, `Geas/Quest`, `Remove Blindness/Deafness` stay **one** spell each |
| Comma flip | `Confusion, Lesser` → id `spell.lesser-confusion`, display **Lesser Confusion**. Same for Greater / Mass |
| Apostrophes | Dropped in the id (`feat.gorgons-fist`, `spell.bears-endurance`); kept on the display name |
| Skip | Do not re-pack the Batch 12 / 13 golden rows listed below |
| Unknown id | Still custom; never fail Load |
| Tests | New ids resolve; goldens still resolve; apply still leaves Combat / slots typed |

Id pattern stays `feat.<kebab>` and `spell.<kebab>`. Category enum stays `general` / `combat` / `metamagic` / `itemCreation` / `other`. Do not use `other` on this CRB table.

## Batch plan

Two groups per PR, same as mundane equipment. Honesty / code fixes and the Wizard 7 playtest override have landed.

| Batch | What | Remaining rows |
| --- | --- | ---: |
| **F1a** | Remaining combat feats, part 1 of 6 (Agile Maneuvers–Dazzling Display) — *Packed* | 0 (18 packed) |
| **F1b** | Remaining combat feats, part 2 of 6 (Deadly Aim–Greater Overrun) — *Packed* | 0 (18 packed) |
| **F1c** | Remaining combat feats, part 3 of 6 (Greater Penetrating Strike–Improved Trip) — *Packed* | 0 (18 packed) |
| **F2a** | Remaining combat feats, part 4 of 6 (Improved Two-Weapon Fighting–Quick Draw) — *Packed* | 0 (17 packed) |
| **F2b** | Remaining combat feats, part 5 of 6 (Rapid Reload–Staggering Critical) — *Packed* | 0 (17 packed) |
| **F2c** | Remaining combat feats, part 6 of 6 (Stand Still–Wind Stance) — *Packed* | 0 (18 packed) |
| **F3a** | Remaining general feats, part 1 of 3 (Acrobatic–Extra Ki) — *Packed* | 0 (16 packed) |
| **F3b** | Remaining general feats, part 2 of 3 (Extra Lay On Hands–Leadership) — *Packed* | 0 (16 packed) |
| **F3c** | Remaining general feats, part 3 of 3 (Lightning Reflexes–Turn Undead) — *Packed* | 0 (15 packed) |
| **F4** | Remaining item creation + all metamagic — *Packed* | 0 (13 packed) |
| **S1** | Remaining spell levels 0 and 1 — *Packed* | 0 (82 packed) |
| **S2** | Remaining spell levels 2 and 3 — *Packed* | 0 (147 packed) |
| **S3** | Remaining spell levels 4 and 5 — *Packed* | 0 (139 packed) |
| **S4** | Remaining spell levels 6 and 7 — *Packed* | 0 (127 packed) |
| **S5** | Remaining spell levels 8 and 9 — *Packed* | 0 (83 packed) |

Skip packed ids in every batch. Magic weapons/armor stay later ([pack-design §7.5](pf1e-crb-pack-design.md#75-reserved-magic-weapons-and-armor)). APG Summoner spells stay in the APG pack.

## Packed already (Batch 12 / 13 + Wizard 7 playtest + Batches F1a–F1c + Batches F2a–F2c + Batches F3a–F3c + Batch F4 + Batches S1–S5 — all 177 CRB feats and all 622 CRB spells packed)
| Id | Name | Category |
| --- | --- | --- |
| `feat.improved-initiative` | Improved Initiative | combat |
| `feat.power-attack` | Power Attack | combat |
| `feat.scribe-scroll` | Scribe Scroll | itemCreation |
| `feat.spell-focus` | Spell Focus | general |
| `feat.weapon-focus` | Weapon Focus | combat |
| `feat.point-blank-shot` | Point-Blank Shot | combat |
| `feat.eschew-materials` | Eschew Materials | general |
| `feat.heighten-spell` | Heighten Spell | metamagic |
| `feat.craft-wondrous-item` | Craft Wondrous Item | itemCreation |
| `feat.craft-magic-arms-and-armor` | Craft Magic Arms and Armor | itemCreation |
| `feat.craft-construct` | Craft Construct | itemCreation |
| `feat.agile-maneuvers` | Agile Maneuvers | combat |
| `feat.arcane-armor-mastery` | Arcane Armor Mastery | combat |
| `feat.arcane-armor-training` | Arcane Armor Training | combat |
| `feat.arcane-strike` | Arcane Strike | combat |
| `feat.armor-proficiency-heavy` | Armor Proficiency, Heavy | combat |
| `feat.armor-proficiency-light` | Armor Proficiency, Light | combat |
| `feat.armor-proficiency-medium` | Armor Proficiency, Medium | combat |
| `feat.bleeding-critical` | Bleeding Critical | combat |
| `feat.blind-fight` | Blind-Fight | combat |
| `feat.blinding-critical` | Blinding Critical | combat |
| `feat.catch-off-guard` | Catch Off-Guard | combat |
| `feat.channel-smite` | Channel Smite | combat |
| `feat.cleave` | Cleave | combat |
| `feat.combat-expertise` | Combat Expertise | combat |
| `feat.combat-reflexes` | Combat Reflexes | combat |
| `feat.critical-focus` | Critical Focus | combat |
| `feat.critical-mastery` | Critical Mastery | combat |
| `feat.dazzling-display` | Dazzling Display | combat |
| `feat.deadly-aim` | Deadly Aim | combat |
| `feat.deadly-stroke` | Deadly Stroke | combat |
| `feat.deafening-critical` | Deafening Critical | combat |
| `feat.defensive-combat-training` | Defensive Combat Training | combat |
| `feat.deflect-arrows` | Deflect Arrows | combat |
| `feat.disruptive` | Disruptive | combat |
| `feat.dodge` | Dodge | combat |
| `feat.double-slice` | Double Slice | combat |
| `feat.exhausting-critical` | Exhausting Critical | combat |
| `feat.exotic-weapon-proficiency` | Exotic Weapon Proficiency | combat |
| `feat.far-shot` | Far Shot | combat |
| `feat.gorgons-fist` | Gorgon's Fist | combat |
| `feat.great-cleave` | Great Cleave | combat |
| `feat.greater-bull-rush` | Greater Bull Rush | combat |
| `feat.greater-disarm` | Greater Disarm | combat |
| `feat.greater-feint` | Greater Feint | combat |
| `feat.greater-grapple` | Greater Grapple | combat |
| `feat.greater-overrun` | Greater Overrun | combat |
| `feat.greater-penetrating-strike` | Greater Penetrating Strike | combat |
| `feat.greater-shield-focus` | Greater Shield Focus | combat |
| `feat.greater-sunder` | Greater Sunder | combat |
| `feat.greater-trip` | Greater Trip | combat |
| `feat.greater-two-weapon-fighting` | Greater Two-Weapon Fighting | combat |
| `feat.greater-vital-strike` | Greater Vital Strike | combat |
| `feat.greater-weapon-focus` | Greater Weapon Focus | combat |
| `feat.greater-weapon-specialization` | Greater Weapon Specialization | combat |
| `feat.improved-bull-rush` | Improved Bull Rush | combat |
| `feat.improved-critical` | Improved Critical | combat |
| `feat.improved-disarm` | Improved Disarm | combat |
| `feat.improved-feint` | Improved Feint | combat |
| `feat.improved-grapple` | Improved Grapple | combat |
| `feat.improved-overrun` | Improved Overrun | combat |
| `feat.improved-precise-shot` | Improved Precise Shot | combat |
| `feat.improved-shield-bash` | Improved Shield Bash | combat |
| `feat.improved-sunder` | Improved Sunder | combat |
| `feat.improved-trip` | Improved Trip | combat |
| `feat.improved-two-weapon-fighting` | Improved Two-Weapon Fighting | combat |
| `feat.improved-unarmed-strike` | Improved Unarmed Strike | combat |
| `feat.improved-vital-strike` | Improved Vital Strike | combat |
| `feat.improvised-weapon-mastery` | Improvised Weapon Mastery | combat |
| `feat.intimidating-prowess` | Intimidating Prowess | combat |
| `feat.lightning-stance` | Lightning Stance | combat |
| `feat.lunge` | Lunge | combat |
| `feat.manyshot` | Manyshot | combat |
| `feat.martial-weapon-proficiency` | Martial Weapon Proficiency | combat |
| `feat.medusas-wrath` | Medusa's Wrath | combat |
| `feat.mobility` | Mobility | combat |
| `feat.mounted-archery` | Mounted Archery | combat |
| `feat.mounted-combat` | Mounted Combat | combat |
| `feat.penetrating-strike` | Penetrating Strike | combat |
| `feat.pinpoint-targeting` | Pinpoint Targeting | combat |
| `feat.precise-shot` | Precise Shot | combat |
| `feat.quick-draw` | Quick Draw | combat |
| `feat.rapid-reload` | Rapid Reload | combat |
| `feat.rapid-shot` | Rapid Shot | combat |
| `feat.ride-by-attack` | Ride-By Attack | combat |
| `feat.scorpion-style` | Scorpion Style | combat |
| `feat.shatter-defenses` | Shatter Defenses | combat |
| `feat.shield-focus` | Shield Focus | combat |
| `feat.shield-master` | Shield Master | combat |
| `feat.shield-proficiency` | Shield Proficiency | combat |
| `feat.shield-slam` | Shield Slam | combat |
| `feat.shot-on-the-run` | Shot on the Run | combat |
| `feat.sickening-critical` | Sickening Critical | combat |
| `feat.simple-weapon-proficiency` | Simple Weapon Proficiency | combat |
| `feat.snatch-arrows` | Snatch Arrows | combat |
| `feat.spellbreaker` | Spellbreaker | combat |
| `feat.spirited-charge` | Spirited Charge | combat |
| `feat.spring-attack` | Spring Attack | combat |
| `feat.staggering-critical` | Staggering Critical | combat |
| `feat.stand-still` | Stand Still | combat |
| `feat.step-up` | Step Up | combat |
| `feat.strike-back` | Strike Back | combat |
| `feat.stunning-critical` | Stunning Critical | combat |
| `feat.stunning-fist` | Stunning Fist | combat |
| `feat.throw-anything` | Throw Anything | combat |
| `feat.tiring-critical` | Tiring Critical | combat |
| `feat.tower-shield-proficiency` | Tower Shield Proficiency | combat |
| `feat.trample` | Trample | combat |
| `feat.two-weapon-defense` | Two-Weapon Defense | combat |
| `feat.two-weapon-fighting` | Two-Weapon Fighting | combat |
| `feat.two-weapon-rend` | Two-Weapon Rend | combat |
| `feat.unseat` | Unseat | combat |
| `feat.vital-strike` | Vital Strike | combat |
| `feat.weapon-finesse` | Weapon Finesse | combat |
| `feat.weapon-specialization` | Weapon Specialization | combat |
| `feat.whirlwind-attack` | Whirlwind Attack | combat |
| `feat.wind-stance` | Wind Stance | combat |
| `feat.acrobatic` | Acrobatic | general |
| `feat.acrobatic-steps` | Acrobatic Steps | general |
| `feat.alertness` | Alertness | general |
| `feat.alignment-channel` | Alignment Channel | general |
| `feat.animal-affinity` | Animal Affinity | general |
| `feat.athletic` | Athletic | general |
| `feat.augment-summoning` | Augment Summoning | general |
| `feat.combat-casting` | Combat Casting | general |
| `feat.command-undead` | Command Undead | general |
| `feat.deceitful` | Deceitful | general |
| `feat.deft-hands` | Deft Hands | general |
| `feat.diehard` | Diehard | general |
| `feat.elemental-channel` | Elemental Channel | general |
| `feat.endurance` | Endurance | general |
| `feat.extra-channel` | Extra Channel | general |
| `feat.extra-ki` | Extra Ki | general |
| `feat.extra-lay-on-hands` | Extra Lay On Hands | general |
| `feat.extra-mercy` | Extra Mercy | general |
| `feat.extra-performance` | Extra Performance | general |
| `feat.extra-rage` | Extra Rage | general |
| `feat.fleet` | Fleet | general |
| `feat.great-fortitude` | Great Fortitude | general |
| `feat.greater-spell-focus` | Greater Spell Focus | general |
| `feat.greater-spell-penetration` | Greater Spell Penetration | general |
| `feat.improved-channel` | Improved Channel | general |
| `feat.improved-counterspell` | Improved Counterspell | general |
| `feat.improved-familiar` | Improved Familiar | general |
| `feat.improved-great-fortitude` | Improved Great Fortitude | general |
| `feat.improved-iron-will` | Improved Iron Will | general |
| `feat.improved-lightning-reflexes` | Improved Lightning Reflexes | general |
| `feat.iron-will` | Iron Will | general |
| `feat.leadership` | Leadership | general |
| `feat.lightning-reflexes` | Lightning Reflexes | general |
| `feat.magical-aptitude` | Magical Aptitude | general |
| `feat.master-craftsman` | Master Craftsman | general |
| `feat.natural-spell` | Natural Spell | general |
| `feat.nimble-moves` | Nimble Moves | general |
| `feat.persuasive` | Persuasive | general |
| `feat.run` | Run | general |
| `feat.selective-channeling` | Selective Channeling | general |
| `feat.self-sufficient` | Self-Sufficient | general |
| `feat.skill-focus` | Skill Focus | general |
| `feat.spell-mastery` | Spell Mastery | general |
| `feat.spell-penetration` | Spell Penetration | general |
| `feat.stealthy` | Stealthy | general |
| `feat.toughness` | Toughness | general |
| `feat.turn-undead` | Turn Undead | general |
| `feat.brew-potion` | Brew Potion | itemCreation |
| `feat.craft-rod` | Craft Rod | itemCreation |
| `feat.craft-staff` | Craft Staff | itemCreation |
| `feat.craft-wand` | Craft Wand | itemCreation |
| `feat.forge-ring` | Forge Ring | itemCreation |
| `feat.empower-spell` | Empower Spell | metamagic |
| `feat.enlarge-spell` | Enlarge Spell | metamagic |
| `feat.extend-spell` | Extend Spell | metamagic |
| `feat.maximize-spell` | Maximize Spell | metamagic |
| `feat.quicken-spell` | Quicken Spell | metamagic |
| `feat.silent-spell` | Silent Spell | metamagic |
| `feat.still-spell` | Still Spell | metamagic |
| `feat.widen-spell` | Widen Spell | metamagic |
| Id | Name | Level |
| --- | --- | --- |
| `spell.detect-magic` | Detect Magic | 0 |
| `spell.fireball` | Fireball | 3 |
| `spell.light` | Light | 0 |
| `spell.magic-missile` | Magic Missile | 1 |
| `spell.detect-poison` | Detect Poison | 0 |
| `spell.read-magic` | Read Magic | 0 |
| `spell.resistance` | Resistance | 0 |
| `spell.acid-splash` | Acid Splash | 0 |
| `spell.flare` | Flare | 0 |
| `spell.dancing-lights` | Dancing Lights | 0 |
| `spell.ray-of-frost` | Ray of Frost | 0 |
| `spell.ghost-sound` | Ghost Sound | 0 |
| `spell.open-close` | Open/Close | 0 |
| `spell.message` | Message | 0 |
| `spell.mage-hand` | Mage Hand | 0 |
| `spell.mending` | Mending | 0 |
| `spell.arcane-mark` | Arcane Mark | 0 |
| `spell.prestidigitation` | Prestidigitation | 0 |
| `spell.alarm` | Alarm | 1 |
| `spell.comprehend-languages` | Comprehend Languages | 1 |
| `spell.detect-secret-doors` | Detect Secret Doors | 1 |
| `spell.true-strike` | True Strike | 1 |
| `spell.mage-armor` | Mage Armor | 1 |
| `spell.obscuring-mist` | Obscuring Mist | 1 |
| `spell.floating-disk` | Floating Disk | 1 |
| `spell.mount` | Mount | 1 |
| `spell.burning-hands` | Burning Hands | 1 |
| `spell.unseen-servant` | Unseen Servant | 1 |
| `spell.shield` | Shield | 1 |
| `spell.protection-from-evil` | Protection from Evil | 1 |
| `spell.arcane-lock` | Arcane Lock | 2 |
| `spell.detect-thoughts` | Detect Thoughts | 2 |
| `spell.see-invisibility` | See Invisibility | 2 |
| `spell.scorching-ray` | Scorching Ray | 2 |
| `spell.invisibility` | Invisibility | 2 |
| `spell.glitterdust` | Glitterdust | 2 |
| `spell.dispel-magic` | Dispel Magic | 3 |
| `spell.haste` | Haste | 3 |
| `spell.blink` | Blink | 3 |
| `spell.shrink-item` | Shrink Item | 3 |
| `spell.clairaudience-clairvoyance` | Clairaudience/Clairvoyance | 3 |
| `spell.water-breathing` | Water Breathing | 3 |
| `spell.greater-invisibility` | Greater Invisibility | 4 |
| `spell.lesser-globe-of-invulnerability` | Lesser Globe of Invulnerability | 4 |




## S1 — remaining spell levels 0 and 1 (Packed)
| Id | Name | Level |
| --- | --- | --- |
| `spell.acid-splash` | Acid Splash | 0 |
| `spell.arcane-mark` | Arcane Mark | 0 |
| `spell.bleed` | Bleed | 0 |
| `spell.create-water` | Create Water | 0 |
| `spell.dancing-lights` | Dancing Lights | 0 |
| `spell.daze` | Daze | 0 |
| `spell.detect-poison` | Detect Poison | 0 |
| `spell.disrupt-undead` | Disrupt Undead | 0 |
| `spell.flare` | Flare | 0 |
| `spell.ghost-sound` | Ghost Sound | 0 |
| `spell.guidance` | Guidance | 0 |
| `spell.know-direction` | Know Direction | 0 |
| `spell.lullaby` | Lullaby | 0 |
| `spell.mage-hand` | Mage Hand | 0 |
| `spell.mending` | Mending | 0 |
| `spell.message` | Message | 0 |
| `spell.open-close` | Open/Close | 0 |
| `spell.prestidigitation` | Prestidigitation | 0 |
| `spell.purify-food-and-drink` | Purify Food and Drink | 0 |
| `spell.ray-of-frost` | Ray of Frost | 0 |
| `spell.read-magic` | Read Magic | 0 |
| `spell.resistance` | Resistance | 0 |
| `spell.stabilize` | Stabilize | 0 |
| `spell.summon-instrument` | Summon Instrument | 0 |
| `spell.touch-of-fatigue` | Touch of Fatigue | 0 |
| `spell.virtue` | Virtue | 0 |
| `spell.alarm` | Alarm | 1 |
| `spell.animal-messenger` | Animal Messenger | 1 |
| `spell.animate-rope` | Animate Rope | 1 |
| `spell.bane` | Bane | 1 |
| `spell.bless` | Bless | 1 |
| `spell.bless-water` | Bless Water | 1 |
| `spell.bless-weapon` | Bless Weapon | 1 |
| `spell.burning-hands` | Burning Hands | 1 |
| `spell.calm-animals` | Calm Animals | 1 |
| `spell.cause-fear` | Cause Fear | 1 |
| `spell.charm-animal` | Charm Animal | 1 |
| `spell.charm-person` | Charm Person | 1 |
| `spell.chill-touch` | Chill Touch | 1 |
| `spell.color-spray` | Color Spray | 1 |
| `spell.command` | Command | 1 |
| `spell.comprehend-languages` | Comprehend Languages | 1 |
| `spell.cure-light-wounds` | Cure Light Wounds | 1 |
| `spell.curse-water` | Curse Water | 1 |
| `spell.deathwatch` | Deathwatch | 1 |
| `spell.delay-poison` | Delay Poison | 1 |
| `spell.detect-animals-or-plants` | Detect Animals or Plants | 1 |
| `spell.detect-chaos` | Detect Chaos | 1 |
| `spell.detect-evil` | Detect Evil | 1 |
| `spell.detect-good` | Detect Good | 1 |
| `spell.detect-law` | Detect Law | 1 |
| `spell.detect-secret-doors` | Detect Secret Doors | 1 |
| `spell.detect-snares-and-pits` | Detect Snares and Pits | 1 |
| `spell.detect-undead` | Detect Undead | 1 |
| `spell.disguise-self` | Disguise Self | 1 |
| `spell.divine-favor` | Divine Favor | 1 |
| `spell.doom` | Doom | 1 |
| `spell.endure-elements` | Endure Elements | 1 |
| `spell.enlarge-person` | Enlarge Person | 1 |
| `spell.entangle` | Entangle | 1 |
| `spell.entropic-shield` | Entropic Shield | 1 |
| `spell.erase` | Erase | 1 |
| `spell.expeditious-retreat` | Expeditious Retreat | 1 |
| `spell.faerie-fire` | Faerie Fire | 1 |
| `spell.feather-fall` | Feather Fall | 1 |
| `spell.floating-disk` | Floating Disk | 1 |
| `spell.goodberry` | Goodberry | 1 |
| `spell.grease` | Grease | 1 |
| `spell.hide-from-animals` | Hide from Animals | 1 |
| `spell.hide-from-undead` | Hide from Undead | 1 |
| `spell.hold-portal` | Hold Portal | 1 |
| `spell.hypnotism` | Hypnotism | 1 |
| `spell.identify` | Identify | 1 |
| `spell.inflict-light-wounds` | Inflict Light Wounds | 1 |
| `spell.jump` | Jump | 1 |
| `spell.lesser-confusion` | Lesser Confusion | 1 |
| `spell.lesser-restoration` | Lesser Restoration | 1 |
| `spell.longstrider` | Longstrider | 1 |
| `spell.mage-armor` | Mage Armor | 1 |
| `spell.magic-aura` | Magic Aura | 1 |
| `spell.magic-fang` | Magic Fang | 1 |
| `spell.magic-stone` | Magic Stone | 1 |
| `spell.magic-weapon` | Magic Weapon | 1 |
| `spell.mount` | Mount | 1 |
| `spell.obscuring-mist` | Obscuring Mist | 1 |
| `spell.pass-without-trace` | Pass without Trace | 1 |
| `spell.produce-flame` | Produce Flame | 1 |
| `spell.protection-from-chaos` | Protection from Chaos | 1 |
| `spell.protection-from-evil` | Protection from Evil | 1 |
| `spell.protection-from-good` | Protection from Good | 1 |
| `spell.protection-from-law` | Protection from Law | 1 |
| `spell.ray-of-enfeeblement` | Ray of Enfeeblement | 1 |
| `spell.reduce-person` | Reduce Person | 1 |
| `spell.remove-fear` | Remove Fear | 1 |
| `spell.sanctuary` | Sanctuary | 1 |
| `spell.shield` | Shield | 1 |
| `spell.shield-of-faith` | Shield of Faith | 1 |
| `spell.shillelagh` | Shillelagh | 1 |
| `spell.shocking-grasp` | Shocking Grasp | 1 |
| `spell.silent-image` | Silent Image | 1 |
| `spell.sleep` | Sleep | 1 |
| `spell.speak-with-animals` | Speak with Animals | 1 |
| `spell.summon-monster-i` | Summon Monster I | 1 |
| `spell.summon-natures-ally-i` | Summon Nature's Ally I | 1 |
| `spell.true-strike` | True Strike | 1 |
| `spell.undetectable-alignment` | Undetectable Alignment | 1 |
| `spell.unseen-servant` | Unseen Servant | 1 |
| `spell.ventriloquism` | Ventriloquism | 1 |

## S2 — remaining spell levels 2 and 3 (Packed)
| Id | Name | Level |
| --- | --- | --- |
| `spell.acid-arrow` | Acid Arrow | 2 |
| `spell.aid` | Aid | 2 |
| `spell.align-weapon` | Align Weapon | 2 |
| `spell.alter-self` | Alter Self | 2 |
| `spell.animal-trance` | Animal Trance | 2 |
| `spell.arcane-lock` | Arcane Lock | 2 |
| `spell.augury` | Augury | 2 |
| `spell.barkskin` | Barkskin | 2 |
| `spell.bears-endurance` | Bear's Endurance | 2 |
| `spell.blindness-deafness` | Blindness/Deafness | 2 |
| `spell.blur` | Blur | 2 |
| `spell.bulls-strength` | Bull's Strength | 2 |
| `spell.calm-emotions` | Calm Emotions | 2 |
| `spell.cats-grace` | Cat's Grace | 2 |
| `spell.chill-metal` | Chill Metal | 2 |
| `spell.command-undead` | Command Undead | 2 |
| `spell.consecrate` | Consecrate | 2 |
| `spell.continual-flame` | Continual Flame | 2 |
| `spell.cure-moderate-wounds` | Cure Moderate Wounds | 2 |
| `spell.darkness` | Darkness | 2 |
| `spell.darkvision` | Darkvision | 2 |
| `spell.daze-monster` | Daze Monster | 2 |
| `spell.death-knell` | Death Knell | 2 |
| `spell.desecrate` | Desecrate | 2 |
| `spell.detect-thoughts` | Detect Thoughts | 2 |
| `spell.eagles-splendor` | Eagle's Splendor | 2 |
| `spell.enthrall` | Enthrall | 2 |
| `spell.false-life` | False Life | 2 |
| `spell.find-traps` | Find Traps | 2 |
| `spell.flame-blade` | Flame Blade | 2 |
| `spell.flaming-sphere` | Flaming Sphere | 2 |
| `spell.fog-cloud` | Fog Cloud | 2 |
| `spell.foxs-cunning` | Fox's Cunning | 2 |
| `spell.ghoul-touch` | Ghoul Touch | 2 |
| `spell.glitterdust` | Glitterdust | 2 |
| `spell.gust-of-wind` | Gust of Wind | 2 |
| `spell.heat-metal` | Heat Metal | 2 |
| `spell.hideous-laughter` | Hideous Laughter | 2 |
| `spell.hold-animal` | Hold Animal | 2 |
| `spell.hypnotic-pattern` | Hypnotic Pattern | 2 |
| `spell.inflict-moderate-wounds` | Inflict Moderate Wounds | 2 |
| `spell.invisibility` | Invisibility | 2 |
| `spell.knock` | Knock | 2 |
| `spell.levitate` | Levitate | 2 |
| `spell.locate-object` | Locate Object | 2 |
| `spell.magic-mouth` | Magic Mouth | 2 |
| `spell.make-whole` | Make Whole | 2 |
| `spell.minor-image` | Minor Image | 2 |
| `spell.mirror-image` | Mirror Image | 2 |
| `spell.misdirection` | Misdirection | 2 |
| `spell.obscure-object` | Obscure Object | 2 |
| `spell.owls-wisdom` | Owl's Wisdom | 2 |
| `spell.phantom-trap` | Phantom Trap | 2 |
| `spell.protection-from-arrows` | Protection from Arrows | 2 |
| `spell.pyrotechnics` | Pyrotechnics | 2 |
| `spell.reduce-animal` | Reduce Animal | 2 |
| `spell.remove-paralysis` | Remove Paralysis | 2 |
| `spell.resist-energy` | Resist Energy | 2 |
| `spell.rope-trick` | Rope Trick | 2 |
| `spell.scare` | Scare | 2 |
| `spell.scorching-ray` | Scorching Ray | 2 |
| `spell.see-invisibility` | See Invisibility | 2 |
| `spell.shatter` | Shatter | 2 |
| `spell.shield-other` | Shield Other | 2 |
| `spell.silence` | Silence | 2 |
| `spell.snare` | Snare | 2 |
| `spell.soften-earth-and-stone` | Soften Earth and Stone | 2 |
| `spell.sound-burst` | Sound Burst | 2 |
| `spell.speak-with-plants` | Speak with Plants | 2 |
| `spell.spectral-hand` | Spectral Hand | 2 |
| `spell.spider-climb` | Spider Climb | 2 |
| `spell.spike-growth` | Spike Growth | 2 |
| `spell.spiritual-weapon` | Spiritual Weapon | 2 |
| `spell.status` | Status | 2 |
| `spell.summon-monster-ii` | Summon Monster II | 2 |
| `spell.summon-natures-ally-ii` | Summon Nature's Ally II | 2 |
| `spell.summon-swarm` | Summon Swarm | 2 |
| `spell.touch-of-idiocy` | Touch of Idiocy | 2 |
| `spell.tree-shape` | Tree Shape | 2 |
| `spell.warp-wood` | Warp Wood | 2 |
| `spell.web` | Web | 2 |
| `spell.whispering-wind` | Whispering Wind | 2 |
| `spell.wood-shape` | Wood Shape | 2 |
| `spell.zone-of-truth` | Zone of Truth | 2 |
| `spell.arcane-sight` | Arcane Sight | 3 |
| `spell.beast-shape-i` | Beast Shape I | 3 |
| `spell.blink` | Blink | 3 |
| `spell.call-lightning` | Call Lightning | 3 |
| `spell.clairaudience-clairvoyance` | Clairaudience/Clairvoyance | 3 |
| `spell.command-plants` | Command Plants | 3 |
| `spell.create-food-and-water` | Create Food and Water | 3 |
| `spell.cure-serious-wounds` | Cure Serious Wounds | 3 |
| `spell.daylight` | Daylight | 3 |
| `spell.deep-slumber` | Deep Slumber | 3 |
| `spell.deeper-darkness` | Deeper Darkness | 3 |
| `spell.diminish-plants` | Diminish Plants | 3 |
| `spell.discern-lies` | Discern Lies | 3 |
| `spell.dispel-magic` | Dispel Magic | 3 |
| `spell.displacement` | Displacement | 3 |
| `spell.dominate-animal` | Dominate Animal | 3 |
| `spell.explosive-runes` | Explosive Runes | 3 |
| `spell.flame-arrow` | Flame Arrow | 3 |
| `spell.fly` | Fly | 3 |
| `spell.gaseous-form` | Gaseous Form | 3 |
| `spell.gentle-repose` | Gentle Repose | 3 |
| `spell.glibness` | Glibness | 3 |
| `spell.glyph-of-warding` | Glyph of Warding | 3 |
| `spell.good-hope` | Good Hope | 3 |
| `spell.greater-magic-fang` | Greater Magic Fang | 3 |
| `spell.greater-magic-weapon` | Greater Magic Weapon | 3 |
| `spell.halt-undead` | Halt Undead | 3 |
| `spell.haste` | Haste | 3 |
| `spell.heal-mount` | Heal Mount | 3 |
| `spell.helping-hand` | Helping Hand | 3 |
| `spell.heroism` | Heroism | 3 |
| `spell.hold-person` | Hold Person | 3 |
| `spell.illusory-script` | Illusory Script | 3 |
| `spell.inflict-serious-wounds` | Inflict Serious Wounds | 3 |
| `spell.invisibility-purge` | Invisibility Purge | 3 |
| `spell.invisibility-sphere` | Invisibility Sphere | 3 |
| `spell.keen-edge` | Keen Edge | 3 |
| `spell.lightning-bolt` | Lightning Bolt | 3 |
| `spell.magic-circle-against-chaos` | Magic Circle against Chaos | 3 |
| `spell.magic-circle-against-evil` | Magic Circle against Evil | 3 |
| `spell.magic-circle-against-good` | Magic Circle against Good | 3 |
| `spell.magic-circle-against-law` | Magic Circle against Law | 3 |
| `spell.magic-vestment` | Magic Vestment | 3 |
| `spell.major-image` | Major Image | 3 |
| `spell.meld-into-stone` | Meld into Stone | 3 |
| `spell.neutralize-poison` | Neutralize Poison | 3 |
| `spell.nondetection` | Nondetection | 3 |
| `spell.phantom-steed` | Phantom Steed | 3 |
| `spell.plant-growth` | Plant Growth | 3 |
| `spell.poison` | Poison | 3 |
| `spell.prayer` | Prayer | 3 |
| `spell.protection-from-energy` | Protection from Energy | 3 |
| `spell.quench` | Quench | 3 |
| `spell.ray-of-exhaustion` | Ray of Exhaustion | 3 |
| `spell.remove-blindness-deafness` | Remove Blindness/Deafness | 3 |
| `spell.remove-disease` | Remove Disease | 3 |
| `spell.repel-vermin` | Repel Vermin | 3 |
| `spell.sculpt-sound` | Sculpt Sound | 3 |
| `spell.searing-light` | Searing Light | 3 |
| `spell.secret-page` | Secret Page | 3 |
| `spell.sepia-snake-sigil` | Sepia Snake Sigil | 3 |
| `spell.shrink-item` | Shrink Item | 3 |
| `spell.sleet-storm` | Sleet Storm | 3 |
| `spell.slow` | Slow | 3 |
| `spell.speak-with-dead` | Speak with Dead | 3 |
| `spell.stinking-cloud` | Stinking Cloud | 3 |
| `spell.suggestion` | Suggestion | 3 |
| `spell.summon-monster-iii` | Summon Monster III | 3 |
| `spell.summon-natures-ally-iii` | Summon Nature's Ally III | 3 |
| `spell.tiny-hut` | Tiny Hut | 3 |
| `spell.tongues` | Tongues | 3 |
| `spell.vampiric-touch` | Vampiric Touch | 3 |
| `spell.water-breathing` | Water Breathing | 3 |
| `spell.water-walk` | Water Walk | 3 |
| `spell.wind-wall` | Wind Wall | 3 |

## S3 — remaining spell levels 4 and 5 (Packed)
| Id | Name | Level |
| --- | --- | --- |
| `spell.air-walk` | Air Walk | 4 |
| `spell.animate-dead` | Animate Dead | 4 |
| `spell.antiplant-shell` | Antiplant Shell | 4 |
| `spell.arcane-eye` | Arcane Eye | 4 |
| `spell.beast-shape-ii` | Beast Shape II | 4 |
| `spell.bestow-curse` | Bestow Curse | 4 |
| `spell.black-tentacles` | Black Tentacles | 4 |
| `spell.chaos-hammer` | Chaos Hammer | 4 |
| `spell.charm-monster` | Charm Monster | 4 |
| `spell.commune-with-nature` | Commune with Nature | 4 |
| `spell.confusion` | Confusion | 4 |
| `spell.contagion` | Contagion | 4 |
| `spell.crushing-despair` | Crushing Despair | 4 |
| `spell.cure-critical-wounds` | Cure Critical Wounds | 4 |
| `spell.death-ward` | Death Ward | 4 |
| `spell.detect-scrying` | Detect Scrying | 4 |
| `spell.dimension-door` | Dimension Door | 4 |
| `spell.dimensional-anchor` | Dimensional Anchor | 4 |
| `spell.dispel-chaos` | Dispel Chaos | 4 |
| `spell.dispel-evil` | Dispel Evil | 4 |
| `spell.divination` | Divination | 4 |
| `spell.divine-power` | Divine Power | 4 |
| `spell.elemental-body-i` | Elemental Body I | 4 |
| `spell.enervation` | Enervation | 4 |
| `spell.fear` | Fear | 4 |
| `spell.fire-shield` | Fire Shield | 4 |
| `spell.fire-trap` | Fire Trap | 4 |
| `spell.flame-strike` | Flame Strike | 4 |
| `spell.freedom-of-movement` | Freedom of Movement | 4 |
| `spell.giant-vermin` | Giant Vermin | 4 |
| `spell.greater-invisibility` | Greater Invisibility | 4 |
| `spell.hallucinatory-terrain` | Hallucinatory Terrain | 4 |
| `spell.holy-smite` | Holy Smite | 4 |
| `spell.holy-sword` | Holy Sword | 4 |
| `spell.ice-storm` | Ice Storm | 4 |
| `spell.illusory-wall` | Illusory Wall | 4 |
| `spell.imbue-with-spell-ability` | Imbue with Spell Ability | 4 |
| `spell.inflict-critical-wounds` | Inflict Critical Wounds | 4 |
| `spell.lesser-geas` | Lesser Geas | 4 |
| `spell.lesser-globe-of-invulnerability` | Lesser Globe of Invulnerability | 4 |
| `spell.lesser-planar-ally` | Lesser Planar Ally | 4 |
| `spell.locate-creature` | Locate Creature | 4 |
| `spell.mark-of-justice` | Mark of Justice | 4 |
| `spell.mass-enlarge-person` | Mass Enlarge Person | 4 |
| `spell.mass-reduce-person` | Mass Reduce Person | 4 |
| `spell.minor-creation` | Minor Creation | 4 |
| `spell.mnemonic-enhancer` | Mnemonic Enhancer | 4 |
| `spell.modify-memory` | Modify Memory | 4 |
| `spell.orders-wrath` | Order's Wrath | 4 |
| `spell.phantasmal-killer` | Phantasmal Killer | 4 |
| `spell.rainbow-pattern` | Rainbow Pattern | 4 |
| `spell.reincarnate` | Reincarnate | 4 |
| `spell.remove-curse` | Remove Curse | 4 |
| `spell.resilient-sphere` | Resilient Sphere | 4 |
| `spell.restoration` | Restoration | 4 |
| `spell.rusting-grasp` | Rusting Grasp | 4 |
| `spell.scrying` | Scrying | 4 |
| `spell.secure-shelter` | Secure Shelter | 4 |
| `spell.shadow-conjuration` | Shadow Conjuration | 4 |
| `spell.shout` | Shout | 4 |
| `spell.solid-fog` | Solid Fog | 4 |
| `spell.spell-immunity` | Spell Immunity | 4 |
| `spell.spike-stones` | Spike Stones | 4 |
| `spell.stone-shape` | Stone Shape | 4 |
| `spell.stoneskin` | Stoneskin | 4 |
| `spell.summon-monster-iv` | Summon Monster IV | 4 |
| `spell.summon-natures-ally-iv` | Summon Nature's Ally IV | 4 |
| `spell.tree-stride` | Tree Stride | 4 |
| `spell.unholy-blight` | Unholy Blight | 4 |
| `spell.wall-of-fire` | Wall of Fire | 4 |
| `spell.wall-of-ice` | Wall of Ice | 4 |
| `spell.zone-of-silence` | Zone of Silence | 4 |
| `spell.animal-growth` | Animal Growth | 5 |
| `spell.atonement-fm` | Atonement FM | 5 |
| `spell.awaken` | Awaken | 5 |
| `spell.baleful-polymorph` | Baleful Polymorph | 5 |
| `spell.beast-shape-iii` | Beast Shape III | 5 |
| `spell.blight` | Blight | 5 |
| `spell.break-enchantment` | Break Enchantment | 5 |
| `spell.breath-of-life` | Breath of Life | 5 |
| `spell.call-lightning-storm` | Call Lightning Storm | 5 |
| `spell.cloudkill` | Cloudkill | 5 |
| `spell.commune` | Commune | 5 |
| `spell.cone-of-cold` | Cone of Cold | 5 |
| `spell.contact-other-plane` | Contact Other Plane | 5 |
| `spell.control-winds` | Control Winds | 5 |
| `spell.dismissal` | Dismissal | 5 |
| `spell.dispel-good` | Dispel Good | 5 |
| `spell.dispel-law` | Dispel Law | 5 |
| `spell.disrupting-weapon` | Disrupting Weapon | 5 |
| `spell.dominate-person` | Dominate Person | 5 |
| `spell.dream` | Dream | 5 |
| `spell.elemental-body-ii` | Elemental Body II | 5 |
| `spell.fabricate` | Fabricate | 5 |
| `spell.false-vision` | False Vision | 5 |
| `spell.feeblemind` | Feeblemind | 5 |
| `spell.greater-command` | Greater Command | 5 |
| `spell.hallow` | Hallow | 5 |
| `spell.hold-monster` | Hold Monster | 5 |
| `spell.insect-plague` | Insect Plague | 5 |
| `spell.interposing-hand` | Interposing Hand | 5 |
| `spell.lesser-planar-binding` | Lesser Planar Binding | 5 |
| `spell.mages-faithful-hound` | Mage's Faithful Hound | 5 |
| `spell.mages-private-sanctum` | Mage's Private Sanctum | 5 |
| `spell.magic-jar` | Magic Jar | 5 |
| `spell.major-creation` | Major Creation | 5 |
| `spell.mass-cure-light-wounds` | Mass Cure Light Wounds | 5 |
| `spell.mass-inflict-light-wounds` | Mass Inflict Light Wounds | 5 |
| `spell.mind-fog` | Mind Fog | 5 |
| `spell.mirage-arcana` | Mirage Arcana | 5 |
| `spell.nightmare` | Nightmare | 5 |
| `spell.overland-flight` | Overland Flight | 5 |
| `spell.passwall` | Passwall | 5 |
| `spell.permanency` | Permanency | 5 |
| `spell.persistent-image` | Persistent Image | 5 |
| `spell.plant-shape-i` | Plant Shape I | 5 |
| `spell.polymorph` | Polymorph | 5 |
| `spell.prying-eyes` | Prying Eyes | 5 |
| `spell.raise-dead` | Raise Dead | 5 |
| `spell.righteous-might` | Righteous Might | 5 |
| `spell.secret-chest` | Secret Chest | 5 |
| `spell.seeming` | Seeming | 5 |
| `spell.sending` | Sending | 5 |
| `spell.shadow-evocation` | Shadow Evocation | 5 |
| `spell.slay-living` | Slay Living | 5 |
| `spell.song-of-discord` | Song of Discord | 5 |
| `spell.spell-resistance` | Spell Resistance | 5 |
| `spell.summon-monster-v` | Summon Monster V | 5 |
| `spell.summon-natures-ally-v` | Summon Nature's Ally V | 5 |
| `spell.symbol-of-pain` | Symbol of Pain | 5 |
| `spell.symbol-of-sleep` | Symbol of Sleep | 5 |
| `spell.telekinesis` | Telekinesis | 5 |
| `spell.telepathic-bond` | Telepathic Bond | 5 |
| `spell.teleport` | Teleport | 5 |
| `spell.transmute-mud-to-rock` | Transmute Mud to Rock | 5 |
| `spell.transmute-rock-to-mud` | Transmute Rock to Mud | 5 |
| `spell.unhallow` | Unhallow | 5 |
| `spell.wall-of-force` | Wall of Force | 5 |
| `spell.wall-of-stone` | Wall of Stone | 5 |
| `spell.wall-of-thorns` | Wall of Thorns | 5 |
| `spell.waves-of-fatigue` | Waves of Fatigue | 5 |

## S4 — remaining spell levels 6 and 7 (Packed)
| Id | Name | Level |
| --- | --- | --- |
| `spell.acid-fog` | Acid Fog | 6 |
| `spell.analyze-dweomer` | Analyze Dweomer | 6 |
| `spell.animate-objects` | Animate Objects | 6 |
| `spell.antilife-shell` | Antilife Shell | 6 |
| `spell.antimagic-field` | Antimagic Field | 6 |
| `spell.beast-shape-iv` | Beast Shape IV | 6 |
| `spell.blade-barrier` | Blade Barrier | 6 |
| `spell.chain-lightning` | Chain Lightning | 6 |
| `spell.circle-of-death` | Circle of Death | 6 |
| `spell.contingency` | Contingency | 6 |
| `spell.control-water` | Control Water | 6 |
| `spell.create-undead` | Create Undead | 6 |
| `spell.disintegrate` | Disintegrate | 6 |
| `spell.elemental-body-iii` | Elemental Body III | 6 |
| `spell.eyebite` | Eyebite | 6 |
| `spell.find-the-path` | Find the Path | 6 |
| `spell.fire-seeds` | Fire Seeds | 6 |
| `spell.flesh-to-stone` | Flesh to Stone | 6 |
| `spell.forbiddance` | Forbiddance | 6 |
| `spell.forceful-hand` | Forceful Hand | 6 |
| `spell.form-of-the-dragon-i` | Form of the Dragon I | 6 |
| `spell.freezing-sphere` | Freezing Sphere | 6 |
| `spell.geas-quest` | Geas/Quest | 6 |
| `spell.globe-of-invulnerability` | Globe of Invulnerability | 6 |
| `spell.greater-dispel-magic` | Greater Dispel Magic | 6 |
| `spell.greater-glyph-of-warding` | Greater Glyph of Warding | 6 |
| `spell.greater-heroism` | Greater Heroism | 6 |
| `spell.guards-and-wards` | Guards and Wards | 6 |
| `spell.harm` | Harm | 6 |
| `spell.heal` | Heal | 6 |
| `spell.heroes-feast` | Heroes' Feast | 6 |
| `spell.ironwood` | Ironwood | 6 |
| `spell.legend-lore` | Legend Lore | 6 |
| `spell.liveoak` | Liveoak | 6 |
| `spell.mages-lucubration` | Mage's Lucubration | 6 |
| `spell.mass-bears-endurance` | Mass Bear's Endurance | 6 |
| `spell.mass-bulls-strength` | Mass Bull's Strength | 6 |
| `spell.mass-cats-grace` | Mass Cat's Grace | 6 |
| `spell.mass-cure-moderate-wounds` | Mass Cure Moderate Wounds | 6 |
| `spell.mass-eagles-splendor` | Mass Eagle's Splendor | 6 |
| `spell.mass-foxs-cunning` | Mass Fox's Cunning | 6 |
| `spell.mass-inflict-moderate-wounds` | Mass Inflict Moderate Wounds | 6 |
| `spell.mass-owls-wisdom` | Mass Owl's Wisdom | 6 |
| `spell.mass-suggestion` | Mass Suggestion | 6 |
| `spell.mislead` | Mislead | 6 |
| `spell.move-earth` | Move Earth | 6 |
| `spell.permanent-image` | Permanent Image | 6 |
| `spell.planar-ally` | Planar Ally | 6 |
| `spell.planar-binding` | Planar Binding | 6 |
| `spell.plant-shape-ii` | Plant Shape II | 6 |
| `spell.programmed-image` | Programmed Image | 6 |
| `spell.repel-wood` | Repel Wood | 6 |
| `spell.repulsion` | Repulsion | 6 |
| `spell.shadow-walk` | Shadow Walk | 6 |
| `spell.spellstaff` | Spellstaff | 6 |
| `spell.stone-tell` | Stone Tell | 6 |
| `spell.stone-to-flesh` | Stone to Flesh | 6 |
| `spell.summon-monster-vi` | Summon Monster VI | 6 |
| `spell.summon-natures-ally-vi` | Summon Nature's Ally VI | 6 |
| `spell.symbol-of-fear` | Symbol of Fear | 6 |
| `spell.symbol-of-persuasion` | Symbol of Persuasion | 6 |
| `spell.sympathetic-vibration` | Sympathetic Vibration | 6 |
| `spell.transformation` | Transformation | 6 |
| `spell.transport-via-plants` | Transport via Plants | 6 |
| `spell.true-seeing` | True Seeing | 6 |
| `spell.undeath-to-death` | Undeath to Death | 6 |
| `spell.veil` | Veil | 6 |
| `spell.wall-of-iron` | Wall of Iron | 6 |
| `spell.wind-walk` | Wind Walk | 6 |
| `spell.word-of-recall` | Word of Recall | 6 |
| `spell.animate-plants` | Animate Plants | 7 |
| `spell.banishment` | Banishment | 7 |
| `spell.blasphemy` | Blasphemy | 7 |
| `spell.changestaff` | Changestaff | 7 |
| `spell.control-undead` | Control Undead | 7 |
| `spell.control-weather` | Control Weather | 7 |
| `spell.creeping-doom` | Creeping Doom | 7 |
| `spell.delayed-blast-fireball` | Delayed Blast Fireball | 7 |
| `spell.destruction` | Destruction | 7 |
| `spell.dictum` | Dictum | 7 |
| `spell.elemental-body-iv` | Elemental Body IV | 7 |
| `spell.ethereal-jaunt` | Ethereal Jaunt | 7 |
| `spell.finger-of-death` | Finger of Death | 7 |
| `spell.fire-storm` | Fire Storm | 7 |
| `spell.forcecage` | Forcecage | 7 |
| `spell.form-of-the-dragon-ii` | Form of the Dragon II | 7 |
| `spell.giant-form-i` | Giant Form I | 7 |
| `spell.grasping-hand` | Grasping Hand | 7 |
| `spell.greater-arcane-sight` | Greater Arcane Sight | 7 |
| `spell.greater-polymorph` | Greater Polymorph | 7 |
| `spell.greater-restoration` | Greater Restoration | 7 |
| `spell.greater-scrying` | Greater Scrying | 7 |
| `spell.greater-shadow-conjuration` | Greater Shadow Conjuration | 7 |
| `spell.greater-teleport` | Greater Teleport | 7 |
| `spell.holy-word` | Holy Word | 7 |
| `spell.insanity` | Insanity | 7 |
| `spell.instant-summons` | Instant Summons | 7 |
| `spell.limited-wish` | Limited Wish | 7 |
| `spell.mages-magnificent-mansion` | Mage's Magnificent Mansion | 7 |
| `spell.mages-sword` | Mage's Sword | 7 |
| `spell.mass-cure-serious-wounds` | Mass Cure Serious Wounds | 7 |
| `spell.mass-hold-person` | Mass Hold Person | 7 |
| `spell.mass-inflict-serious-wounds` | Mass Inflict Serious Wounds | 7 |
| `spell.mass-invisibility` | Mass Invisibility | 7 |
| `spell.phase-door` | Phase Door | 7 |
| `spell.plane-shift` | Plane Shift | 7 |
| `spell.plant-shape-iii` | Plant Shape III | 7 |
| `spell.power-word-blind` | Power Word Blind | 7 |
| `spell.prismatic-spray` | Prismatic Spray | 7 |
| `spell.project-image` | Project Image | 7 |
| `spell.regenerate` | Regenerate | 7 |
| `spell.resurrection` | Resurrection | 7 |
| `spell.reverse-gravity` | Reverse Gravity | 7 |
| `spell.sequester` | Sequester | 7 |
| `spell.simulacrum` | Simulacrum | 7 |
| `spell.spell-turning` | Spell Turning | 7 |
| `spell.statue` | Statue | 7 |
| `spell.summon-monster-vii` | Summon Monster VII | 7 |
| `spell.summon-natures-ally-vii` | Summon Nature's Ally VII | 7 |
| `spell.sunbeam` | Sunbeam | 7 |
| `spell.symbol-of-stunning` | Symbol of Stunning | 7 |
| `spell.symbol-of-weakness` | Symbol of Weakness | 7 |
| `spell.teleport-object` | Teleport Object | 7 |
| `spell.transmute-metal-to-wood` | Transmute Metal to Wood | 7 |
| `spell.vision` | Vision | 7 |
| `spell.waves-of-exhaustion` | Waves of Exhaustion | 7 |
| `spell.word-of-chaos` | Word of Chaos | 7 |

## S5 — remaining spell levels 8 and 9 (Packed)
| Id | Name | Level |
| --- | --- | --- |
| `spell.animal-shapes` | Animal Shapes | 8 |
| `spell.antipathy` | Antipathy | 8 |
| `spell.binding` | Binding | 8 |
| `spell.clenched-fist` | Clenched Fist | 8 |
| `spell.cloak-of-chaos` | Cloak of Chaos | 8 |
| `spell.clone` | Clone | 8 |
| `spell.control-plants` | Control Plants | 8 |
| `spell.create-greater-undead` | Create Greater Undead | 8 |
| `spell.demand` | Demand | 8 |
| `spell.dimensional-lock` | Dimensional Lock | 8 |
| `spell.discern-location` | Discern Location | 8 |
| `spell.earthquake` | Earthquake | 8 |
| `spell.form-of-the-dragon-iii` | Form of the Dragon III | 8 |
| `spell.giant-form-ii` | Giant Form II | 8 |
| `spell.greater-planar-ally` | Greater Planar Ally | 8 |
| `spell.greater-planar-binding` | Greater Planar Binding | 8 |
| `spell.greater-prying-eyes` | Greater Prying Eyes | 8 |
| `spell.greater-shadow-evocation` | Greater Shadow Evocation | 8 |
| `spell.greater-shout` | Greater Shout | 8 |
| `spell.greater-spell-immunity` | Greater Spell Immunity | 8 |
| `spell.holy-aura` | Holy Aura | 8 |
| `spell.horrid-wilting` | Horrid Wilting | 8 |
| `spell.incendiary-cloud` | Incendiary Cloud | 8 |
| `spell.iron-body` | Iron Body | 8 |
| `spell.irresistible-dance` | Irresistible Dance | 8 |
| `spell.mass-charm-monster` | Mass Charm Monster | 8 |
| `spell.mass-cure-critical-wounds` | Mass Cure Critical Wounds | 8 |
| `spell.mass-inflict-critical-wounds` | Mass Inflict Critical Wounds | 8 |
| `spell.maze` | Maze | 8 |
| `spell.mind-blank` | Mind Blank | 8 |
| `spell.moment-of-prescience` | Moment of Prescience | 8 |
| `spell.polar-ray` | Polar Ray | 8 |
| `spell.polymorph-any-object` | Polymorph Any Object | 8 |
| `spell.power-word-stun` | Power Word Stun | 8 |
| `spell.prismatic-wall` | Prismatic Wall | 8 |
| `spell.protection-from-spells` | Protection from Spells | 8 |
| `spell.repel-metal-or-stone` | Repel Metal or Stone | 8 |
| `spell.scintillating-pattern` | Scintillating Pattern | 8 |
| `spell.screen` | Screen | 8 |
| `spell.shield-of-law` | Shield of Law | 8 |
| `spell.summon-monster-viii` | Summon Monster VIII | 8 |
| `spell.summon-natures-ally-viii` | Summon Nature's Ally VIII | 8 |
| `spell.sunburst` | Sunburst | 8 |
| `spell.symbol-of-death` | Symbol of Death | 8 |
| `spell.symbol-of-insanity` | Symbol of Insanity | 8 |
| `spell.sympathy` | Sympathy | 8 |
| `spell.telekinetic-sphere` | Telekinetic Sphere | 8 |
| `spell.temporal-stasis` | Temporal Stasis | 8 |
| `spell.trap-the-soul` | Trap the Soul | 8 |
| `spell.unholy-aura` | Unholy Aura | 8 |
| `spell.whirlwind` | Whirlwind | 8 |
| `spell.astral-projection` | Astral Projection | 9 |
| `spell.crushing-hand` | Crushing Hand | 9 |
| `spell.dominate-monster` | Dominate Monster | 9 |
| `spell.elemental-swarm` | Elemental Swarm | 9 |
| `spell.energy-drain` | Energy Drain | 9 |
| `spell.etherealness` | Etherealness | 9 |
| `spell.foresight` | Foresight | 9 |
| `spell.freedom` | Freedom | 9 |
| `spell.gate` | Gate | 9 |
| `spell.implosion` | Implosion | 9 |
| `spell.imprisonment` | Imprisonment | 9 |
| `spell.mages-disjunction` | Mage's Disjunction | 9 |
| `spell.mass-heal` | Mass Heal | 9 |
| `spell.mass-hold-monster` | Mass Hold Monster | 9 |
| `spell.meteor-swarm` | Meteor Swarm | 9 |
| `spell.miracle` | Miracle | 9 |
| `spell.power-word-kill` | Power Word Kill | 9 |
| `spell.prismatic-sphere` | Prismatic Sphere | 9 |
| `spell.refuge` | Refuge | 9 |
| `spell.shades` | Shades | 9 |
| `spell.shambler` | Shambler | 9 |
| `spell.shapechange` | Shapechange | 9 |
| `spell.soul-bind` | Soul Bind | 9 |
| `spell.storm-of-vengeance` | Storm of Vengeance | 9 |
| `spell.summon-monster-ix` | Summon Monster IX | 9 |
| `spell.summon-natures-ally-ix` | Summon Nature's Ally IX | 9 |
| `spell.teleportation-circle` | Teleportation Circle | 9 |
| `spell.time-stop` | Time Stop | 9 |
| `spell.true-resurrection` | True Resurrection | 9 |
| `spell.wail-of-the-banshee` | Wail of the Banshee | 9 |
| `spell.weird` | Weird | 9 |
| `spell.wish` | Wish | 9 |
